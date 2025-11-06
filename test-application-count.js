// Test application count for students
const testApplicationCount = async () => {
  const baseURL = 'http://localhost:5000';
  
  console.log('Testing student application count...');
  
  try {
    // Login as a student
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
      console.log('Response:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    const studentToken = loginData.token;
    console.log('✅ Student login successful');

    // Get dashboard stats (this should now show actual application count)
    const dashboardResponse = await fetch(`${baseURL}/api/dashboard/stats`, {
      headers: { 
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
      },
    });

    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log('📊 Dashboard stats:', dashboardData);
      console.log('🎯 My Applications Count:', dashboardData.totalApplications || dashboardData.pendingQueries || 0);
      console.log('📝 Pending Applications:', dashboardData.pendingApplications || 0);
      console.log('✅ Approved Applications:', dashboardData.approvedApplications || 0);
      console.log('❌ Rejected Applications:', dashboardData.rejectedApplications || 0);
    } else {
      console.log('❌ Failed to fetch dashboard stats');
      console.log('Response:', await dashboardResponse.text());
    }

    // Get actual applications to verify the count
    const applicationsResponse = await fetch(`${baseURL}/api/applications/my-applications`, {
      headers: { 
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
      },
    });

    if (applicationsResponse.ok) {
      const applicationsData = await applicationsResponse.json();
      console.log('📋 Actual applications:', applicationsData);
      console.log('🔢 Actual application count:', applicationsData.total || applicationsData.applications?.length || 0);
    } else {
      console.log('❌ Failed to fetch applications');
      console.log('Response:', await applicationsResponse.text());
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testApplicationCount();