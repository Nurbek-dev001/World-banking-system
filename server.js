import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import bankingRoutes from './routes/banking.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import transferRoutes from './routes/transfer.routes.js';
import marketplaceRoutes from './routes/marketplace.routes.js';
import userRoutes from './routes/user.routes.js';
import loanRoutes from './routes/loan.routes.js';
import depositRoutes from './routes/deposit.routes.js';
import qrRoutes from './routes/qr.routes.js';
import merchantRoutes from './routes/merchant.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import adminRoutes from './routes/admin.routes.js';
import logger, { requestLoggerMiddleware, performanceMonitorMiddleware } from './utils/logger.js';
import { globalErrorHandler } from './utils/errorHandler.js';

dotenv.config();

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'http://localhost:*', 'https:'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"]
    },
    reportOnly: true
  },
  crossOriginResourcePolicy: false
}));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging Middleware
app.use(requestLoggerMiddleware(logger));
app.use(performanceMonitorMiddleware(logger));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/banking', bankingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global Error Handler
app.use(globalErrorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

// Initialize and start server
const startServer = async () => {
  try {
    // Connect to database (won't fail in dev mode)
    await connectDB();
    
    app.listen(PORT, () => {
      logger.info(`🏦 World Bank Server started`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
      logger.info(`📝 API Health check: http://localhost:${PORT}/health`);
      logger.info(`🔗 Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

startServer();

export default app;
