// Check detailed college profile data
const checkCollegeProfileDetails = async () => {
  const baseURL = 'http://localhost:5001';
  
  console.log('Checking detailed college profile data...');
  
  try {
    // Login as the test college
    const collegeLoginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test.college@example.com',
        password: 'password123',
        expectedRole: 'college'
      })
    });

    if (collegeLoginResponse.ok) {
      const collegeLoginData = await collegeLoginResponse.json();
      const collegeToken = collegeLoginData.token;
      
      // Get full profile details
      const profileResponse = await fetch(`${baseURL}/api/college/profile`, {
        headers: {
          'Authorization': `Bearer ${collegeToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('\n📋 Full profile data:');
        console.log(JSON.stringify(profileData, null, 2));
      } else {
        const errorData = await profileResponse.json();
        console.log('❌ Profile fetch failed:', errorData);
      }
    }
    
    // Also check what the search endpoint sees
    console.log('\n🔍 Checking what search endpoint returns:');
    const searchResponse = await fetch(`${baseURL}/api/colleges/search`);
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log('Search results:', JSON.stringify(searchData, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

checkCollegeProfileDetails();