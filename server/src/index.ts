import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import logger from './config/logger';
import prisma from './config/database';

// Import routes
import authRoutes from './routes/auth.routes';
import integrationRoutes from './routes/integration.routes';
import aiFilterRoutes from './routes/ai-filter.routes';
import themeComparisonRoutes from './routes/theme-comparison.routes';
import notificationRoutes from './routes/notification.routes';
import gameRoutes from './routes/game.routes';
import weeklyWordRoutes from './routes/weekly-word.routes';
import interlinearRoutes from './routes/interlinear.routes';
import songRoutes from './routes/song.routes';
import substituteRoutes from './routes/substitute.routes';
import bibleBattleRoutes from './routes/bible-battle.routes';
import songRoutes from './routes/song.routes';
import substituteRoutes from './routes/substitute.routes';
import bibleBattleRoutes from './routes/bible-battle.routes';
import playlistRoutes from './routes/playlist.routes';
import findReferenceGameRoutes from './routes/find-reference-game.routes';
import gratitudeRoutes from './routes/gratitude.routes';
import substituteRoutes from './routes/substitute.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================================================
// ROUTES
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Teen Sunday School API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', integrationRoutes);
app.use('/api/admin/ai-filters', aiFilterRoutes);
app.use('/api/themes', themeComparisonRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/weekly-word', weeklyWordRoutes);
app.use('/api/bible', interlinearRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/substitute', substituteRoutes);
app.use('/api/bible-battle', bibleBattleRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/substitute', substituteRoutes);
app.use('/api/bible-battle', bibleBattleRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/games/find-reference', findReferenceGameRoutes);
app.use('/api/gratitude', gratitudeRoutes);
app.use('/api/substitute', substituteRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);

  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(err.status || 500).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✓ Database connected');

    // Initialize notification jobs
    try {
      const { initializeNotificationJobs } = await import('./jobs/notification.job');
      await initializeNotificationJobs();
      logger.info('✓ Notification jobs initialized');
    } catch (error) {
      logger.warn('⚠ Failed to initialize notification jobs:', error);
      // Don't fail server startup if notification jobs fail
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`✓ Server running on port ${PORT}`);
      logger.info(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`✓ Frontend URL: ${process.env.FRONTEND_URL}`);
      logger.info(`✓ API ready at http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
startServer();

export default app;
