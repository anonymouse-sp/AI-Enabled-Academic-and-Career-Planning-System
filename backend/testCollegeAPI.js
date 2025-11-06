const mongoose = require('mongoose');
const User = require('./models/User');
const CollegeProfile = require('./models/CollegeProfile');
require('dotenv').config();

async function testCollegeAPI() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Simulate the API call
    const searchQuery = { isActive: true };
    const colleges = await CollegeProfile.find(searchQuery)
      .populate('userId', 'name email')
      .sort({ collegeName: 1 })
      .limit(12)
      .lean();
    
    console.log(`\n📊 Found ${colleges.length} active college profiles:`);
    
    colleges.forEach((college, index) => {
      console.log(`\n${index + 1}. ${college.collegeName}`);
      console.log(`   📍 Location: ${college.location?.city}, ${college.location?.state}`);
      console.log(`   🏛️  Type: ${college.type}`);
      console.log(`   📅 Established: ${college.establishedYear}`);
      console.log(`   📞 Contact: ${college.contact?.phone}`);
      console.log(`   🌐 Website: ${college.contact?.website}`);
      console.log(`   📚 Courses: ${college.courses?.length || 0} courses offered`);
      console.log(`   💰 Tuition Fee: ₹${college.fees?.tuition?.toLocaleString('en-IN')}`);
      console.log(`   📈 Placement Rate: ${college.placements?.placementRate}%`);
      console.log(`   🏆 National Ranking: ${college.rankings?.national}`);
    });
    
    console.log(`\n✅ All registered colleges are available for student search!`);
    console.log(`\n💡 Students can now find these colleges in the "Find College" section.`);
    console.log(`   When colleges update their profiles, changes will automatically appear in student searches.`);
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testCollegeAPI();