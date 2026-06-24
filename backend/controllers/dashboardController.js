import Analysis from '../models/Analysis.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';

/**
 * @desc    Get user dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
export const getUserDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  console.log('📊 Fetching dashboard stats for user:', userId);

  try {
    // Get total analyses
    const totalAnalyses = await Analysis.countDocuments({ userId });
    console.log('Total Analyses:', totalAnalyses);

    // Get total resumes
    const totalResumes = await Resume.countDocuments({ userId });
    console.log('Total Resumes:', totalResumes);

    // Get average ATS score
    let averageScore = 0;
    if (totalAnalyses > 0) {
      const avgScoreResult = await Analysis.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, avgScore: { $avg: '$atsScore' } } },
      ]);
      averageScore = Math.round(avgScoreResult[0]?.avgScore || 0);
    }
    console.log('Average Score:', averageScore);

    // Get recent analyses
    const recentAnalyses = await Analysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('resumeId', 'fileName originalName')
      .select('atsScore summary createdAt analysisType');

    // Get score trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const scoreTrends = await Analysis.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          avgScore: { $avg: '$atsScore' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get top skills from all analyses (only if there are analyses)
    let topSkills = [];
    if (totalAnalyses > 0) {
      try {
        topSkills = await Analysis.aggregate([
          { $match: { userId: new mongoose.Types.ObjectId(userId) } },
          { $unwind: '$matchedSkills' },
          { $group: { _id: '$matchedSkills', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]);
      } catch (error) {
        console.log('Top skills error (non-critical):', error.message);
      }
    }

    // Get score distribution (only if there are analyses)
    let scoreDistribution = [];
    if (totalAnalyses > 0) {
      try {
        scoreDistribution = await Analysis.aggregate([
          { $match: { userId: new mongoose.Types.ObjectId(userId) } },
          {
            $bucket: {
              groupBy: '$atsScore',
              boundaries: [0, 25, 50, 75, 100],
              default: 'Other',
              output: { count: { $sum: 1 } },
            },
          },
        ]);
      } catch (error) {
        console.log('Score distribution error (non-critical):', error.message);
      }
    }

    const response = {
      success: true,
      data: {
        summary: {
          totalAnalyses,
          totalResumes,
          averageScore,
        },
        recentAnalyses,
        scoreTrends,
        topSkills: topSkills.map(skill => ({
          name: skill._id,
          count: skill.count,
        })),
        scoreDistribution,
      },
    };

    console.log('✅ Dashboard stats fetched successfully');
    res.json(response);

  } catch (error) {
    console.error('❌ Dashboard Stats Error:', error);
    // Return empty data instead of failing
    res.json({
      success: true,
      data: {
        summary: {
          totalAnalyses: 0,
          totalResumes: 0,
          averageScore: 0,
        },
        recentAnalyses: [],
        scoreTrends: [],
        topSkills: [],
        scoreDistribution: [],
      },
    });
  }
});

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/dashboard/admin
 * @access  Private/Admin
 */
export const getAdminDashboard = asyncHandler(async (req, res) => {
  // Total users
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: new Date(new Date().setDate(1)) },
  });

  // Total resumes
  const totalResumes = await Resume.countDocuments();
  const resumesThisMonth = await Resume.countDocuments({
    createdAt: { $gte: new Date(new Date().setDate(1)) },
  });

  // Total analyses
  const totalAnalyses = await Analysis.countDocuments();
  const analysesThisMonth = await Analysis.countDocuments({
    createdAt: { $gte: new Date(new Date().setDate(1)) },
  });

  // Average ATS score across all analyses
  const avgScoreResult = await Analysis.aggregate([
    { $group: { _id: null, avgScore: { $avg: '$atsScore' } } },
  ]);
  const globalAverageScore = avgScoreResult[0]?.avgScore || 0;

  // User registrations over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const userRegistrations = await User.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Analysis activity over time (last 30 days)
  const analysisActivity = await Analysis.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Most active users
  const mostActiveUsers = await Analysis.aggregate([
    {
      $group: {
        _id: '$userId',
        analysisCount: { $sum: 1 },
      },
    },
    { $sort: { analysisCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        name: '$user.name',
        email: '$user.email',
        analysisCount: 1,
      },
    },
  ]);

  // Recent users
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select('name email role isActive createdAt');

  res.json({
    success: true,
    data: {
      summary: {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        totalResumes,
        resumesThisMonth,
        totalAnalyses,
        analysesThisMonth,
        globalAverageScore: Math.round(globalAverageScore),
      },
      charts: {
        userRegistrations,
        analysisActivity,
      },
      mostActiveUsers,
      recentUsers,
    },
  });
});

/**
 * @desc    Get user management data
 * @route   GET /api/dashboard/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const users = await User.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .select('-password');

  const total = await User.countDocuments();

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

/**
 * @desc    Toggle user active status
 * @route   PUT /api/dashboard/admin/users/:id/toggle-status
 * @access  Private/Admin
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: user.toSafeObject(),
  });
});

/**
 * @desc    Delete user (admin)
 * @route   DELETE /api/dashboard/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Delete user's resumes and analyses
  await Resume.deleteMany({ userId: user._id });
  await Analysis.deleteMany({ userId: user._id });
  await user.deleteOne();

  res.json({
    success: true,
    message: 'User and associated data deleted successfully',
  });
});
