// Test Admin Login
const testAdminLogin = async () => {
  const baseURL = 'http://localhost:5001';
  
  console.log('Testing admin login...');
  
  try {
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@college-finder.com',
        password: 'admin123',
        expectedRole: 'admin'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.error('Login failed:', loginData);
      return;
    }
    
    console.log('Login successful:', loginData);
    const token = loginData.token;

    // Test admin dashboard stats
    console.log('\nTesting admin dashboard stats...');
    const statsResponse = await fetch(`${baseURL}/api/admin/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('Dashboard stats:', statsData);
    } else {
      const errorData = await statsResponse.json();
      console.error('Stats request failed:', errorData);
    }

    // Test pending registrations
    console.log('\nTesting pending registrations...');
    const pendingResponse = await fetch(`${baseURL}/api/admin/pending-registrations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (pendingResponse.ok) {
      const pendingData = await pendingResponse.json();
      console.log('Pending registrations:', pendingData);
    } else {
      const errorData = await pendingResponse.json();
      console.error('Pending registrations request failed:', errorData);
    }

  } catch (error) {
    console.error('Test error:', error);
  }
};

testAdminLogin();