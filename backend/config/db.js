import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Set DNS servers for Node's dns resolution to bypass local router issues resolving MongoDB Atlas SRV records.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('⚠️ Failed to set DNS servers:', err.message);
}

// Load environment variables
dotenv.config();

/**
 * Connect to MongoDB with retry logic
 * @returns {Promise<void>}
 */
const connectDB = async (retries = 3) => {
  const options = {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
  };

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 Attempting MongoDB connection (${i + 1}/${retries})...`);
      console.log(`📍 Connection: ${process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@') || 'URI not found'}`);
      
      const conn = await mongoose.connect(process.env.MONGODB_URI, options);

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`📊 Database Name: ${conn.connection.name}`);

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error(`❌ MongoDB Error: ${err.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB Disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB Reconnected');
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      });

      return; // Success, exit function

    } catch (error) {
      console.error(`❌ Connection attempt ${i + 1} failed: ${error.message}`);
      
      if (i === retries - 1) {
        // Last attempt failed
        console.error('\n❌ All MongoDB connection attempts failed!');
        console.error('\n📝 Common Solutions:');
        console.error('1. Check MongoDB Atlas → Network Access → Whitelist your IP (0.0.0.0/0)');
        console.error('2. Verify username and password in connection string');
        console.error('3. Check if MongoDB Atlas cluster is active');
        console.error('4. Try using local MongoDB: mongodb://localhost:27017/ai-resume-analyzer');
        console.error('5. Disable VPN/Proxy if enabled');
        console.error('6. Wait 2-3 minutes after adding IP to Network Access');
        console.error('\n📖 See MONGODB_TROUBLESHOOTING.md for detailed help\n');
        
        // Don't exit, let the app continue without DB (will fail on DB operations)
        console.warn('⚠️  Server will start WITHOUT database connection');
        console.warn('⚠️  Database operations will fail until connection is established\n');
        return;
      }
      
      // Wait before retry
      console.log(`⏳ Retrying in 3 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};

export default connectDB;
