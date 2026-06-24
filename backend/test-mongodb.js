import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  console.log('🔍 MongoDB Connection Test\n');
  console.log('URI:', process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@') || 'Not found');
  console.log('');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file');
    process.exit(1);
  }

  try {
    console.log('🔄 Attempting to connect...');
    
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };
    
    await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('✅ SUCCESS! MongoDB Connected!');
    console.log('📊 Database Name:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    
    await mongoose.connection.close();
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Connection Failed!');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    
    console.log('\n📝 Troubleshooting Steps:');
    console.log('1. Check if your IP is whitelisted in MongoDB Atlas');
    console.log('2. Verify your username and password are correct');
    console.log('3. Check if you can access: https://cloud.mongodb.com');
    console.log('4. Try disabling VPN if you\'re using one');
    console.log('5. Check Windows Firewall settings');
    console.log('\nSee MONGODB_TROUBLESHOOTING.md for detailed help');
    
    process.exit(1);
  }
};

testConnection();
