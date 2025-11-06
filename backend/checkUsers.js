const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI);

async function checkUsers() {
  try {
    console.log('Checking existing users...');
    
    const users = await User.find();
    console.log(`Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`- ID: ${user._id}`);
      console.log(`- Name: ${user.name}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Role: ${user.role}`);
      console.log(`- Created: ${user.createdAt}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking users:', error);
    process.exit(1);
  }
}

checkUsers();