import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Import routes
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resume.js';
import analysisRoutes from './routes/analysis.js';
import dashboardRoutes from './routes/dashboard.js';

/**
 * Initialize Express App
 */
const app = express();

/**
 * Security Middleware
 */
// Set security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Disable for API
}));

// Enable CORS - Simple and permissive configuration
console.log('🔧 CORS Configuration:');
console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   - CLIENT_URL: ${process.env.CLIENT_URL || 'Not set'}`);

// Build allowed origins list
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
].filter(Boolean);

console.log(`   - Allowed Origins: ${allowedOrigins.join(', ')}`);

app.use(
  cors({
    origin: (origin, callback) => {
      // Log every CORS check
      console.log(`\n🔍 CORS Request from: ${origin || 'no-origin'}`);
      
      // Allow requests with no origin (Postman, mobile apps, same-origin)
      if (!origin) {
        console.log('✅ No origin - allowed');
        return callback(null, true);
      }
      
      // In production, allow all origins temporarily to diagnose
      if (process.env.NODE_ENV === 'production') {
        console.log('✅ Production mode - allowing all origins');
        return callback(null, true);
      }
      
      // In development, check the allowed list
      if (allowedOrigins.includes(origin)) {
        console.log('✅ Origin in allowed list');
        return callback(null, true);
      }
      
      console.warn('❌ Origin not in allowed list');
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600, // Cache preflight requests for 10 minutes
  })
);

// Sanitize data against NoSQL injection
app.use(mongoSanitize());

/**
 * Body Parser Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log all incoming requests in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`\n📥 ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    next();
  });
}

/**
 * Compression Middleware
 */
app.use(compression());

/**
 * Logging Middleware
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

/**
 * Rate Limiting
 */
app.use('/api/', apiLimiter);

/**
 * Handle preflight requests explicitly
 */
app.options('*', cors());

/**
 * Health Check Route
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    cors: {
      clientUrl: process.env.CLIENT_URL || 'Not set',
      origin: req.headers.origin || 'No origin header',
    },
  });
});

/**
 * Debug endpoint (development only)
 */
if (process.env.NODE_ENV === 'development') {
  app.get('/debug', (req, res) => {
    res.json({
      success: true,
      server: 'Running',
      mongodb: {
        status: mongoose.connection.readyState,
        name: mongoose.connection.name || 'Not connected',
        host: mongoose.connection.host || 'Not connected',
      },
      environment: process.env.NODE_ENV,
      bodyParser: 'Enabled',
      cors: 'Enabled',
    });
  });
}

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/dashboard', dashboardRoutes);

/**
 * Welcome Route
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to AI Resume Analyzer API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      resumes: '/api/resumes',
      analysis: '/api/analysis',
      dashboard: '/api/dashboard',
    },
  });
});

/**
 * Error Handling Middleware
 */
app.use(notFound);
app.use(errorHandler);

export default app;
