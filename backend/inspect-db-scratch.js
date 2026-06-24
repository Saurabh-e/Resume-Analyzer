import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Analysis from './models/Analysis.js';
import Resume from './models/Resume.js';
import User from './models/User.js';

dotenv.config();

const testSelect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: 'john@test.com' });
    const userId = user._id;

    const recentAnalyses = await Analysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('resumeId', 'fileName originalName')
      .select('atsScore summary createdAt analysisType');

    console.log('QueryResult (with select):');
    console.log(JSON.stringify(recentAnalyses, null, 2));

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

testSelect();
