const mongoose = require('mongoose');

const StudentProfile = require('./models/StudentProfile');
const User = require('./models/User');

// Connect to MongoDB
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI);

async function testProfileCompletion() {
  try {
    console.log('Testing profile completion calculation...');
    
    // Find all student profiles
    const profiles = await StudentProfile.find().populate('userId', 'name email');
    
    console.log(`Found ${profiles.length} student profiles:`);
    
    profiles.forEach((profile, index) => {
      const completion = profile.calculateCompletionPercentage();
      console.log(`\nProfile ${index + 1}:`);
      console.log(`- User: ${profile.userId?.name || 'Unknown'} (${profile.userId?.email || 'No email'})`);
      console.log(`- Completion: ${completion}%`);
      
      // Show filled fields
      console.log('- Filled fields:');
      if (profile.phone) console.log(`  * Phone: ${profile.phone}`);
      if (profile.dateOfBirth) console.log(`  * Date of Birth: ${profile.dateOfBirth}`);
      if (profile.gender) console.log(`  * Gender: ${profile.gender}`);
      if (profile.address?.street) console.log(`  * Address: ${profile.address.street}`);
      if (profile.currentClass) console.log(`  * Current Class: ${profile.currentClass}`);
      if (profile.schoolName) console.log(`  * School: ${profile.schoolName}`);
      if (profile.interestedStreams?.length) console.log(`  * Interested Streams: ${profile.interestedStreams.join(', ')}`);
      if (profile.careerGoals) console.log(`  * Career Goals: ${profile.careerGoals}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing profile completion:', error);
    process.exit(1);
  }
}

testProfileCompletion();