// Simple test to check if campus gallery data is being returned by API
const axios = require('axios');

async function testCollegeAPI() {
  try {
    console.log('🔍 Testing College Details API...\n');
    
    const collegeId = '68e91a8ea2e6b0fb7af8ae6d'; // ID from database
    const apiUrl = 'http://localhost:5000/api/colleges/' + collegeId;
    
    console.log('Making API request to:', apiUrl);
    
    const response = await axios.get(apiUrl);
    const college = response.data;
    
    console.log('\n✅ API Response received');
    console.log('College Name:', college.name);
    console.log('College ID:', college.id);
    
    console.log('\n📸 Campus Gallery Data:');
    if (college.campusGallery && college.campusGallery.length > 0) {
      console.log(`✅ Found ${college.campusGallery.length} campus gallery images:`);
      college.campusGallery.forEach((img, index) => {
        console.log(`   ${index + 1}. URL: ${img.url}`);
        console.log(`      Caption: ${img.caption || 'No caption'}`);
        console.log(`      Uploaded: ${img.uploadedAt}`);
      });
    } else {
      console.log('❌ No campus gallery data found in API response');
      console.log('Available fields:', Object.keys(college));
    }
    
    console.log('\n🏗️ Infrastructure Data:');
    if (college.infrastructure) {
      console.log('✅ Infrastructure data available');
      console.log('Campus area:', college.infrastructure.campus?.area);
      console.log('Campus description:', college.infrastructure.campus?.description);
    } else {
      console.log('❌ No infrastructure data found');
    }
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testCollegeAPI();