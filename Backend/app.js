import express from 'express';
import morgan from 'morgan';
import connect from './Db/db.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import chatRoutes from './routes/chat.routes.js';
import aiRoutes from './routes/ai.routes.js';
import projectChatRoutes from './routes/projectChat.routes.js';
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';


connect();

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use('/chat', chatRoutes);
app.use('/ai', aiRoutes);
app.use('/project-chat', projectChatRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('ChatApp Backend - MongoDB Connected!');
});

export default app;