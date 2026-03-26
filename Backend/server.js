import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app, { start as startDb } from './app.js';

const initialPort = parseInt(process.env.PORT) || 4001;
let server;

// ================= START SERVER =================
async function startServer(port) {
  try {
    await startDb();

    server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
      },
    });

    global.io = io;

    // ================= SOCKET =================
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join-room', (roomId, userId, username) => {
        socket.join(roomId);
        socket.userId = userId;
        socket.username = username;
        socket.to(roomId).emit('user-joined', { userId, username });
      });

      socket.on('send-message', async (data) => {
        try {
          const { roomId, message, sender, messageType } = data;

          const chatService = (await import('./services/chat.service.js')).default;

          const savedMessage = await chatService.saveMessage(
            roomId,
            sender,
            message,
            messageType
          );

          io.to(roomId).emit('new-message', {
            ...savedMessage,
            sender,
            text: message,
            messageType: messageType || 'text',
            timestamp: new Date(),
          });

        } catch (error) {
          console.error('SEND MESSAGE ERROR:', error);
          socket.emit('message-error', { error: 'Failed to send message' });
        }
      });

      socket.on('typing-start', ({ roomId }) => {
        socket.to(roomId).emit('user-typing', {
          userId: socket.userId,
          username: socket.username,
        });
      });

      socket.on('typing-stop', ({ roomId }) => {
        socket.to(roomId).emit('user-stopped-typing', {
          userId: socket.userId,
          username: socket.username,
        });
      });

      socket.on('member-added', (data) => socket.to(data.roomId).emit('member-added', data));
      socket.on('member-updated', (data) => socket.to(data.roomId).emit('member-updated', data));
      socket.on('member-removed', (data) => socket.to(data.roomId).emit('member-removed', data));

      socket.on('join-activity-room', (roomId = 'global') => {
        socket.join(`activity-${roomId}`);
      });

      socket.on('leave-activity-room', (roomId = 'global') => {
        socket.leave(`activity-${roomId}`);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    // ================= START LISTEN =================
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

    // ================= PORT FALLBACK =================
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${port} busy → trying ${port + 1}`);
        startServer(port + 1);
      } else {
        console.error('SERVER ERROR:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('STARTUP ERROR:', error);
    process.exit(1);
  }
}

// ================= SHUTDOWN =================
const shutdown = (signal) => {
  console.log(`\n${signal} received → shutting down`);

  if (server) {
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ================= GLOBAL ERRORS =================
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

// ✅ FINAL FIX HERE
startServer(initialPort);