import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    messageType: {
        type: String,
        enum: ['text', 'file', 'emoji'],
        default: 'text'
    }
});

const chatRoomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    participants: [{
        type: String,
        required: true
    }],
    messages: [messageSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
});

const onlineUserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'away'],
        default: 'online'
    },
    lastSeen: {
        type: Date,
        default: Date.now
    }
});

export const Message = mongoose.model('Message', messageSchema);
export const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);
export const OnlineUser = mongoose.model('OnlineUser', onlineUserSchema);