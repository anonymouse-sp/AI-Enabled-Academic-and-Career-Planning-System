const axios = require('axios');

async function testProfileAPI() {
  try {
    console.log('Testing profile API endpoints...');
    
    // Login with test user
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@profile.com',
      password: 'test123',
      expectedRole: 'student'
    });
    
    console.log('Login successful');
    const token = loginResponse.data.token;
    
    // Test profile GET endpoint
    console.log('\nTesting GET /api/student/profile...');
    const profileResponse = await axios.get('http://localhost:5000/api/student/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Profile data received:');
    console.log('- Completion Percentage:', profileResponse.data.completionPercentage);
    console.log('- Name:', profileResponse.data.name);
    console.log('- Phone:', profileResponse.data.phone);
    
    // Test dashboard stats endpoint
    console.log('\nTesting GET /api/dashboard/stats...');
    const statsResponse = await axios.get('http://localhost:5000/api/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Dashboard stats received:');
    console.log('- Profile Completion:', statsResponse.data.profileCompletion);
    console.log('- Total Colleges:', statsResponse.data.totalColleges);
    
  } catch (error) {
    console.error('API Test Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testProfileAPI();