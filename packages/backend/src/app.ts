import express from 'express';
import "dotenv/config";
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import type { Request, Response, NextFunction } from 'express';
import authRoute from './routes/auth.route.js';
import projectRoute from './routes/project.route.js';
import logRoute from './routes/log.route.js';
import logQueryRoute from './routes/log.query.route.js';
import aiRoute from './routes/ai.route.js';
import { AppError } from './utils/errors.js';
import cors from "cors";
import logger from './config/logger.js';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(
  morgan('combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

// Debug middleware: Log basic info about incoming cookies (without values)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    if (req.cookies && Object.keys(req.cookies).length > 0) {
      logger.info(`Incoming request with cookies: ${Object.keys(req.cookies).join(', ')}`);
    } else {
      logger.info(`Incoming request with NO cookies for path: ${req.path}`);
    }
    next();
  });
}

app.get('/', (_req: Request, res: Response) => {
  logger.info('Hello from Logstream Ops API!');
  res.status(200).send('Hello from Logstream Ops API!');
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Logstream Ops API is running!' });
});

// API Routes
app.use('/api/auth', authRoute);
app.use('/api/projects', projectRoute);
app.use('/api/ingest', logRoute);
app.use('/api/dashboard/logs', logQueryRoute);
app.use('/api/ai', aiRoute);

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  logger.error('Unhandled Exception:', err);
  return res.status(500).json({
    message: 'An unexpected error occurred on our server.',
  });
});

export default app;
