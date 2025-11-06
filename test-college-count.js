// Test college counts - check the difference between College and CollegeProfile counts
const testCollegeCounts = async () => {
  const baseURL = 'http://localhost:5001';
  
  console.log('Testing college counts...');
  
  try {
    // Login as a student to test dashboard stats
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'surya@gmail.com',
        password: 'password123',
        expectedRole: 'student'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Student login failed');
      return;
    }

    const loginData = await loginResponse.json();
    const studentToken = loginData.token;
    console.log('✅ Student login successful');

    // Get dashboard stats
    const dashboardResponse = await fetch(`${baseURL}/api/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${studentToken}` },
    });

    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log('\n📊 Dashboard stats:');
      console.log(`Total colleges: ${dashboardData.totalColleges}`);
    } else {
      console.log('❌ Failed to fetch dashboard stats');
    }

    // Get college search results (what students actually see)
    const searchResponse = await fetch(`${baseURL}/api/colleges/search`);
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log('\n🔍 College search results:');
      console.log(`Available colleges in search: ${searchData.total || searchData.colleges?.length || 0}`);
      console.log('Colleges found:');
      searchData.colleges?.forEach((college, index) => {
        console.log(`${index + 1}. ${college.name}`);
      });
    } else {
      console.log('❌ Failed to fetch college search results');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testCollegeCounts();