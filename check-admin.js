// Check admin user in database
const checkAdminUser = async () => {
  const baseURL = 'http://localhost:5001';
  
  console.log('Checking admin user details...');
  
  try {
    // Login first
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
    console.log('Admin user details:', loginData.user);
    
    // Check all users (admin endpoint)
    const token = loginData.token;
    const usersResponse = await fetch(`${baseURL}/api/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('\nUsers response:', usersData);
      if (Array.isArray(usersData)) {
        console.log('\nAll users in system:');
        usersData.forEach(user => {
          console.log(`- ${user.name} (${user.email}) - Role: ${user.role}, Status: ${user.status}, HeadAdmin: ${user.isHeadAdmin || false}`);
        });
      } else if (usersData.users && Array.isArray(usersData.users)) {
        console.log('\nAll users in system:');
        usersData.users.forEach(user => {
          console.log(`- ${user.name} (${user.email}) - Role: ${user.role}, Status: ${user.status}, HeadAdmin: ${user.isHeadAdmin || false}`);
        });
      }
    } else {
      console.error('Failed to fetch users');
    }

  } catch (error) {
    console.error('Error:', error);
  }
};

checkAdminUser();