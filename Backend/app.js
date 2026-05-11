import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';

import connect from './config/db.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import chatRoutes from './routes/chat.routes.js';
import aiRoutes from './routes/ai.routes.js';
import projectChatRoutes from './routes/projectChat.routes.js';
import authRoutes from './routes/auth.routes.js';
import activityRoutes from './routes/activity.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

const app = express();

// ================= BASIC MIDDLEWARE =================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Express 5 makes req.query a getter. Polyfill to make it writable for legacy middleware.
app.use((req, res, next) => {
  const originalQuery = req.query;
  Object.defineProperty(req, 'query', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: originalQuery
  });
  next();
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(morgan('dev'));

// ================= SECURITY =================
app.use(helmet());
app.use(compression());

app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(xss()); // Prevent Cross-Site Scripting (XSS)

// Trust proxy for secure headers and rate limiting when behind a reverse proxy (Render/Railway/Vercel)
app.set('trust proxy', 1);

// ================= RATE LIMIT =================
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
}));



// ================= ROUTES =================
console.log('✅ Setting up routes');

app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use('/chat', chatRoutes);
app.use('/ai', aiRoutes);
app.use('/project-chat', projectChatRoutes);
app.use('/auth', authRoutes);
app.use('/activity', activityRoutes);
app.use('/notifications', notificationRoutes);

// ================= ROOT =================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Innovative AI Backend Running 🚀',
  });
});

// ================= HEALTH =================
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ================= TEST =================
app.get('/test', (req, res) => {
  res.json({ message: 'Backend working 🚀' });
});

// ================= 404 =================
app.use(notFound);

// ================= ERROR HANDLER =================
app.use(errorHandler);


// ================= DB START =================
export const start = async () => {
  await connect();
};

export default app;