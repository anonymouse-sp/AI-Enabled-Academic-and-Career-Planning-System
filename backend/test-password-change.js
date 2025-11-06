// Test admin password change functionality
const testPasswordChange = async () => {
  try {
    console.log('🔐 Testing admin password change functionality...');
    
    // First, login as admin
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@college-finder.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Admin login successful');
    
    const token = loginData.token;
    
    // Get users to find a test user
    console.log('\n📡 Fetching users to test password change...');
    const usersResponse = await fetch('http://localhost:5000/api/admin/users/detailed?page=1&limit=20', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!usersResponse.ok) {
      throw new Error(`Users fetch failed: ${usersResponse.status}`);
    }
    
    const usersData = await usersResponse.json();
    console.log(`👥 Found ${usersData.users?.length || 0} users`);
    
    // Find a non-admin user to test password change
    const testUser = usersData.users?.find(u => u.role !== 'admin');
    
    if (!testUser) {
      console.log('⚠️ No non-admin users found to test password change');
      return;
    }
    
    console.log(`\n🎯 Testing password change for user: ${testUser.name} (${testUser.email})`);
    
    // Test password change
    const passwordChangeResponse = await fetch(`http://localhost:5000/api/admin/users/${testUser._id}/change-password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        newPassword: 'newpassword123'
      })
    });
    
    if (passwordChangeResponse.ok) {
      const result = await passwordChangeResponse.json();
      console.log('✅ Password change successful:', result.message);
      console.log(`🔑 Password for ${testUser.name} has been changed to: newpassword123`);
    } else {
      const errorData = await passwordChangeResponse.json();
      console.log('❌ Password change failed:', errorData.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testPasswordChange();