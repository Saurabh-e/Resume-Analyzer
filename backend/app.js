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
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
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
 * Health Check Route
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
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
