// Check database content for testing
const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-finder');
    
    // Check users
    const User = mongoose.model('User', new mongoose.Schema({}, { collection: 'users', strict: false }));
    const users = await User.find({ role: 'student' }).limit(3);
    console.log('\n📱 Sample Students:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Status: ${user.status || 'N/A'}`);
    });
    
    // Check applications
    const Application = mongoose.model('Application', new mongoose.Schema({}, { collection: 'applications', strict: false }));
    const applications = await Application.find({}).limit(5);
    console.log('\n📝 Sample Applications:');
    applications.forEach(app => {
      console.log(`- Student: ${app.studentId} -> College: ${app.collegeId} (${app.status})`);
    });
    
    // Count applications by student
    const applicationCounts = await Application.aggregate([
      { $group: { _id: '$studentId', count: { $sum: 1 } } },
      { $limit: 5 }
    ]);
    console.log('\n🔢 Applications per student:');
    applicationCounts.forEach(count => {
      console.log(`- Student ID: ${count._id} has ${count.count} applications`);
    });
    
    mongoose.disconnect();
    console.log('\n✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabase();