import mongoose from "mongoose";

function connect() {
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB Compass');
        console.log('Database:', mongoose.connection.name);
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
        console.error('MongoDB error:', err);
    });
}

export default connect;