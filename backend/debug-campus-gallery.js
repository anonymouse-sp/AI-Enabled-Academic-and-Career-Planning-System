// Debug Campus Gallery - Check existing data
require('dotenv').config();
const mongoose = require('mongoose');
const CollegeProfile = require('./models/CollegeProfile');

async function debugCampusGallery() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-finder');
    console.log('Connected to MongoDB successfully!');

    // Find all colleges and check campus gallery data
    console.log('\n🔍 Checking campus gallery data in all college profiles...\n');
    
    const colleges = await CollegeProfile.find({}).select('collegeName campusGallery');
    
    console.log(`Found ${colleges.length} college profiles in database\n`);
    
    let collegesWithGallery = 0;
    let totalImages = 0;
    
    colleges.forEach((college, index) => {
      console.log(`${index + 1}. ${college.collegeName || 'Unnamed College'}`);
      console.log(`   ID: ${college._id}`);
      
      if (college.campusGallery && college.campusGallery.length > 0) {
        console.log(`   ✅ Campus Gallery: ${college.campusGallery.length} images`);
        college.campusGallery.forEach((img, imgIndex) => {
          console.log(`      - Image ${imgIndex + 1}: ${img.url} (${img.caption || 'No caption'})`);
        });
        collegesWithGallery++;
        totalImages += college.campusGallery.length;
      } else {
        console.log(`   ❌ Campus Gallery: No images`);
      }
      console.log('');
    });
    
    console.log(`📊 Summary:`);
    console.log(`   - Total colleges: ${colleges.length}`);
    console.log(`   - Colleges with gallery images: ${collegesWithGallery}`);
    console.log(`   - Total gallery images: ${totalImages}`);
    
    if (collegesWithGallery === 0) {
      console.log('\n⚠️  No colleges have campus gallery images uploaded yet.');
      console.log('   To test the system:');
      console.log('   1. Login as a college user');
      console.log('   2. Go to College Profile Manager');
      console.log('   3. Upload images in the Campus Gallery section');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugCampusGallery();