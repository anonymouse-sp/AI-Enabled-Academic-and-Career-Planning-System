const mongoose = require('mongoose');
const User = require('./models/User');
const CollegeProfile = require('./models/CollegeProfile');
const Application = require('./models/Application');
const College = require('./models/College');

// Database connection - try both database names
const databases = ['mongodb://localhost:27017/ai-career-planning', 'mongodb://localhost:27017/college-finder'];

async function testCascadingDeletion() {
  let connected = false;
  
  for (const dbUrl of databases) {
    try {
      console.log(`🔍 Trying to connect to: ${dbUrl}`);
      await mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      console.log('✅ Connected to MongoDB successfully!');
      connected = true;
      break;
    } catch (error) {
      console.log(`❌ Failed to connect to ${dbUrl}`);
    }
  }
  
  if (!connected) {
    console.log('❌ Could not connect to any database');
    return;
  }

  try {
    console.log('\n📊 Current Database State:');
    
    // Count all existing records
    const userCount = await User.countDocuments();
    const collegeProfileCount = await CollegeProfile.countDocuments();
    const staticCollegeCount = await College.countDocuments();
    const applicationCount = await Application.countDocuments();
    
    console.log(`👥 Users: ${userCount}`);
    console.log(`🏫 College Profiles: ${collegeProfileCount}`);
    console.log(`📚 Static Colleges: ${staticCollegeCount}`);
    console.log(`📝 Applications: ${applicationCount}`);
    
    // List college users specifically
    const collegeUsers = await User.find({ role: 'college' }).select('name email');
    if (collegeUsers.length > 0) {
      console.log('\n🏫 College Users:');
      collegeUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - ID: ${user._id}`);
      });
    }
    
    // List college profiles
    const collegeProfiles = await CollegeProfile.find({}).populate('userId', 'name email');
    if (collegeProfiles.length > 0) {
      console.log('\n🏫 College Profiles:');
      collegeProfiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.collegeName} - User: ${profile.userId?.name} (${profile.userId?.email}) - Profile ID: ${profile._id}`);
      });
    }
    
    // List applications
    const applications = await Application.find({}).populate('studentId', 'name email').populate('collegeId', 'collegeName');
    if (applications.length > 0) {
      console.log('\n📝 Applications:');
      applications.forEach((app, index) => {
        console.log(`${index + 1}. Student: ${app.studentId?.name} → College: ${app.collegeId?.collegeName || app.collegeName} - Status: ${app.status}`);
      });
    }
    
    console.log('\n🔧 Cascading Deletion Test Complete!');
    console.log('To test the deletion functionality:');
    console.log('1. Use the admin interface to delete a college');
    console.log('2. Or make a DELETE request to: /api/admin/colleges/{collegeId}');
    console.log('3. Check that all associated data is removed (user account, profile, applications, files)');
    
  } catch (error) {
    console.error('❌ Error testing cascading deletion:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

testCascadingDeletion();