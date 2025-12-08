import mongoose from 'mongoose';

class MongoDBService {
    constructor() {
        this.isConnected = false;
    }

    async connect() {
        try {
            await mongoose.connect(process.env.MONGODB_URI);
            this.isConnected = true;
            console.log('Connected to MongoDB Compass');
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await mongoose.disconnect();
            this.isConnected = false;
            console.log('Disconnected from MongoDB');
        } catch (error) {
            console.error('MongoDB disconnection error:', error);
        }
    }

    getConnectionStatus() {
        return this.isConnected;
    }
}

export default new MongoDBService();