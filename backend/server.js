import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

/**
 * Load Environment Variables
 */
dotenv.config();

// Define default values for deployment environment variables if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '5000';

/**
 * Validate Required Environment Variables
 */
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'GROQ_API_KEY',
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach((varName) => console.error(`   - ${varName}`));
  process.exit(1);
}

/**
 * Connect to Database
 * Non-blocking - server will start even if DB connection fails
 */
connectDB().catch(err => {
  console.error('Database connection error:', err.message);
  console.warn('⚠️  Server starting without database connection');
});

/**
 * Start Server
 */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║      🚀 AI Resume Analyzer Server                        ║
║                                                           ║
║      Environment: ${process.env.NODE_ENV.padEnd(37)}    ║
║      Port: ${PORT.toString().padEnd(44)}    ║
║      Status: Running ✓                                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

/**
 * Handle Unhandled Promise Rejections
 */
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  console.error(err.stack);
  server.close(() => process.exit(1));
});

/**
 * Handle Uncaught Exceptions
 */
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

/**
 * Graceful Shutdown
 */
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

export default server;
