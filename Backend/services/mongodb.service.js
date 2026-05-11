import mongoose from 'mongoose';

class MongoDBService {
    constructor() {
        this.isConnected = false;
    }

    async connect() {
        try {
            const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
            if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined');

            // Production-ready connection options
            const options = {
              serverSelectionTimeoutMS: 5000, 
              socketTimeoutMS: 45000, 
              maxPoolSize: 50, 
            };

            await mongoose.connect(MONGODB_URI, options);
            this.isConnected = true;
            console.log('✅ Connected to MongoDB Atlas (Service)');
        } catch (error) {
            console.error('\n❌ MongoDB Service Connection Error:', error.message);
            // We do not exit process here as it might be an optional service connect, 
            // but we throw it safely so the caller knows it failed.
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