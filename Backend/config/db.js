import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

async function connect() {
  try {
    // Production-ready connection options
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 50, // Maintain up to 50 socket connections
    };

    await mongoose.connect(MONGODB_URI, options);
    console.log(`✅ MongoDB Atlas connected successfully — DB: ${mongoose.connection.name}`);
  } catch (err) {
    console.error('\n❌ MongoDB Connection Error Detected:');
    
    const errorMessage = err.message || '';
    
    // Safely parse and explain common Atlas errors
    if (errorMessage.includes('bad auth') || errorMessage.includes('Authentication failed')) {
      console.error('👉 REASON: Authentication Failed.');
      console.error('💡 ACTION: Check if your MongoDB Atlas username and password in the .env URI are correct.');
      console.error('           Ensure password special characters are URL-encoded.');
    } else if (errorMessage.includes('IP isn\'t whitelisted') || errorMessage.includes('Could not connect to any servers')) {
      console.error('👉 REASON: Network Access / IP Whitelist Issue.');
      console.error('💡 ACTION: Your current IP address is not whitelisted in MongoDB Atlas.');
      console.error('   1. Go to MongoDB Atlas Dashboard -> Security -> Network Access.');
      console.error('   2. Click "Add IP Address" and select "Allow Access From Anywhere" (0.0.0.0/0) or add your current IP.');
      console.error('   3. Wait 1-2 minutes for the changes to propagate.');
    } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('querySrv ETIMEOUT')) {
      console.error('👉 REASON: DNS or Network Issue.');
      console.error('💡 ACTION: Could not resolve the Atlas cluster hostname. Check your internet connection or flush DNS.');
    } else {
      console.error(`👉 REASON: ${errorMessage}`);
      console.error('💡 ACTION: Verify your MongoDB Atlas cluster status and connection string format.');
    }
    
    console.error('\n⚠️ Backend shutting down safely to prevent unstable state.');
    process.exit(1); // Exit cleanly instead of crashing with unhandled rejection
  }

  // Graceful connection event listeners
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected. Attempting to maintain stability...');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB runtime error:', err.message);
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected successfully.');
  });
}

export default connect;
