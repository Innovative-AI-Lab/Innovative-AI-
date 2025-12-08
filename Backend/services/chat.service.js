import { ChatRoom, OnlineUser, Message } from '../models/chat.model.js';

class ChatService {
    // Message operations
    async saveMessage(roomId, sender, text, messageType = 'text') {
        try {
            let chatRoom = await ChatRoom.findOne({ roomId });
            
            if (!chatRoom) {
                chatRoom = new ChatRoom({
                    roomId,
                    participants: [sender],
                    messages: []
                });
            }

            const message = {
                sender,
                text,
                messageType,
                timestamp: new Date()
            };

            chatRoom.messages.push(message);
            chatRoom.lastActivity = new Date();

            if (!chatRoom.participants.includes(sender)) {
                chatRoom.participants.push(sender);
            }

            await chatRoom.save();
            return message;
        } catch (error) {
            console.error('Error saving message:', error);
            throw error;
        }
    }

    async getMessages(roomId, limit = 50) {
        try {
            const chatRoom = await ChatRoom.findOne({ roomId });
            if (!chatRoom) return [];
            
            return chatRoom.messages
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, limit)
                .reverse();
        } catch (error) {
            console.error('Error getting messages:', error);
            throw error;
        }
    }

    // Online users operations
    async setUserOnline(userId, username) {
        try {
            await OnlineUser.findOneAndUpdate(
                { userId },
                { 
                    username, 
                    status: 'online', 
                    lastSeen: new Date() 
                },
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error('Error setting user online:', error);
            throw error;
        }
    }

    async setUserOffline(userId) {
        try {
            await OnlineUser.findOneAndUpdate(
                { userId },
                { 
                    status: 'offline', 
                    lastSeen: new Date() 
                }
            );
        } catch (error) {
            console.error('Error setting user offline:', error);
            throw error;
        }
    }

    async getOnlineUsers() {
        try {
            return await OnlineUser.find({ status: 'online' });
        } catch (error) {
            console.error('Error getting online users:', error);
            throw error;
        }
    }

    // Chat room operations
    async createChatRoom(roomId, participants = []) {
        try {
            const existingRoom = await ChatRoom.findOne({ roomId });
            if (existingRoom) return existingRoom;

            const chatRoom = new ChatRoom({
                roomId,
                participants,
                messages: []
            });

            return await chatRoom.save();
        } catch (error) {
            console.error('Error creating chat room:', error);
            throw error;
        }
    }

    async getChatRooms(userId) {
        try {
            return await ChatRoom.find({ 
                participants: userId 
            }).sort({ lastActivity: -1 });
        } catch (error) {
            console.error('Error getting chat rooms:', error);
            throw error;
        }
    }
}

export default new ChatService();