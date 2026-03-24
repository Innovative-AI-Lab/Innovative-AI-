import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room
  socket.on('join-room', (roomId, userId, username) => {
    socket.join(roomId);
    socket.userId = userId;
    socket.username = username;
    console.log(`${username} joined room: ${roomId}`);
    
    // Notify others in the room
    socket.to(roomId).emit('user-joined', { userId, username });
  });

  // Handle chat messages
  socket.on('send-message', async (data) => {
    try {
      const { roomId, message, sender, messageType } = data;
      
      // Save message to database
      const chatService = (await import('./services/chat.service.js')).default;
      const savedMessage = await chatService.saveMessage(roomId, sender, message, messageType);
      
      // Broadcast to room
      io.to(roomId).emit('new-message', {
        ...savedMessage,
        sender: sender,
        text: message,
        messageType: messageType || 'text',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing-start', (data) => {
    socket.to(data.roomId).emit('user-typing', { userId: socket.userId, username: socket.username });
  });

  socket.on('typing-stop', (data) => {
    socket.to(data.roomId).emit('user-stopped-typing', { userId: socket.userId, username: socket.username });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Notify rooms that user left
    socket.rooms.forEach(room => {
      if (room !== socket.id) {
        socket.to(room).emit('user-left', { userId: socket.userId, username: socket.username });
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  console.log(`📡 Socket.io enabled for real-time chat`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down gracefully`);
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  server.close(() => process.exit(1));
});
