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

const app = express();

// ================= BASIC MIDDLEWARE =================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(morgan('dev'));

// ================= SECURITY =================
app.use(helmet());
app.use(compression());

// ⚠️ temporarily disable (ye issue create kar sakte hain)

app.use(hpp());
// app.use(xss()); ❌ disable for now

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

// ================= HEALTH =================
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ================= TEST =================
app.get('/test', (req, res) => {
  res.json({ message: 'Backend working 🚀' });
});

// ================= 404 =================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error('🔥 GLOBAL ERROR:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ================= DB START =================
export const start = async () => {
  await connect();
};

export default app;