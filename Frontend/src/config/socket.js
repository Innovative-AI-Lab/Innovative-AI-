import { io } from "socket.io-client";

const URL = import.meta.env.VITE_API_URL || "http://localhost:4001";

export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
});

export const initializeSocket = (projectId, userId, username) => {
  if (!socket.connected) {
    socket.connect();
  }

  socket.emit('join-room', projectId, userId, username);
  socket.emit('join-activity-room', projectId);
  
  return socket;
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
