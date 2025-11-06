const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB');
    
    // Test the connection with a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name));
    
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Make sure MongoDB is installed and running');
      console.log('2. Check if MongoDB service is started');
      console.log('3. Verify the MongoDB URI in .env file');
      console.log('4. Try installing MongoDB locally or use MongoDB Atlas (cloud)');
    }
    
    process.exit(1);
  }
}

testConnection();