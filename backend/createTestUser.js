const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');

// Connect to MongoDB
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI);

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Delete existing test user if exists
    await User.deleteOne({ email: 'test@profile.com' });
    await StudentProfile.deleteOne({ userId: { $exists: false } });
    
    // Create new test user
    const hashedPassword = await bcrypt.hash('test123', 12);
    const testUser = new User({
      name: 'Test Profile User',
      email: 'test@profile.com',
      password: hashedPassword,
      role: 'student',
      status: 'approved'  // Make sure user is approved
    });
    
    await testUser.save();
    console.log('Test user created successfully');
    
    // Create a profile with some data for testing
    const testProfile = new StudentProfile({
      userId: testUser._id,
      phone: '9876543210',
      dateOfBirth: new Date('2005-05-15'),
      gender: 'Female',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456'
      },
      currentClass: '12th',
      schoolName: 'Test High School',
      schoolBoard: 'CBSE',
      interestedStreams: ['Engineering', 'Science'],
      careerGoals: 'To become a software engineer',
      hobbies: ['Reading', 'Coding']
    });
    
    await testProfile.save();
    console.log('Test profile created successfully');
    
    // Calculate and show completion percentage
    const completion = testProfile.calculateCompletionPercentage();
    console.log(`Profile completion: ${completion}%`);
    
    console.log('\nTest user credentials:');
    console.log('Email: test@profile.com');
    console.log('Password: test123');
    console.log('Role: student');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();