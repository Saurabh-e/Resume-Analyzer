import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  console.log('📝 Register Request Received');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    console.log('❌ Missing required fields:', { name: !!name, email: !!email, password: !!password });
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and password',
    });
  }

  // Check if user already exists
  console.log('🔍 Checking if user exists:', email);
  const userExists = await User.findOne({ email });
  if (userExists) {
    console.log('❌ User already exists:', email);
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email',
    });
  }

  // Create user
  console.log('✨ Creating new user:', email);
  const user = await User.create({
    name,
    email,
    password,
  });

  console.log('✅ User created successfully:', user._id);

  // Generate token
  const token = generateToken(user._id);

  console.log('🎫 Token generated');

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.toSafeObject(),
      token,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  console.log('🔐 Login Request Received');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    console.log('❌ Missing required fields:', { email: !!email, password: !!password });
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    });
  }

  // Find user with password field
  console.log('🔍 Finding user:', email);
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    console.log('❌ User not found:', email);
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  console.log('✅ User found:', user._id);

  // Check if user is active
  if (!user.isActive) {
    console.log('❌ User account deactivated:', email);
    return res.status(401).json({
      success: false,
      message: 'Your account has been deactivated',
    });
  }

  // Check password
  console.log('🔒 Verifying password...');
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    console.log('❌ Invalid password for:', email);
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  console.log('✅ Password verified');

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  console.log('✅ Login successful for:', email);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toSafeObject(),
      token,
    },
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: 'resumes',
      options: { sort: { createdAt: -1 }, limit: 5 },
    })
    .populate({
      path: 'analyses',
      options: { sort: { createdAt: -1 }, limit: 5 },
      populate: {
        path: 'resumeId',
        select: 'originalName fileName'
      }
    });

  res.json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, avatar } = req.body;

  const user = await User.findById(req.user._id);

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use',
      });
    }
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.avatar = avatar || user.avatar;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user.toSafeObject(),
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // In a token-based system, logout is handled client-side by removing the token
  // This endpoint is here for consistency and can be extended for token blacklisting
  res.json({
    success: true,
    message: 'Logout successful',
  });
});
