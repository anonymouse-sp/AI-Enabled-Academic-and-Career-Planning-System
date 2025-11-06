// Test admin access control functionality
const testAccessControl = async () => {
  try {
    console.log('🔐 Testing admin access control functionality...');
    
    // First, login as admin
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@college-finder.com',
        password: 'admin123',
        expectedRole: 'admin'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Admin login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Admin login successful');
    
    const token = loginData.token;
    
    // Get users to find a test user
    console.log('\n📡 Fetching users to test access control...');
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
    
    // Find a non-admin user to test access control
    const testUser = usersData.users?.find(u => u.role !== 'admin');
    
    if (!testUser) {
      console.log('⚠️ No non-admin users found to test access control');
      return;
    }
    
    console.log(`\n🎯 Testing access control for user: ${testUser.name} (${testUser.email})`);
    console.log(`Current status: ${testUser.isActive ? 'Active' : 'Disabled'}`);
    
    // Test disabling access
    if (testUser.isActive) {
      console.log('\n🚫 Testing disable access...');
      const disableResponse = await fetch(`http://localhost:5000/api/admin/users/${testUser._id}/toggle-access`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: false
        })
      });
      
      if (disableResponse.ok) {
        const result = await disableResponse.json();
        console.log('✅ Access disabled successfully:', result.message);
        
        // Test if user can still login (should fail)
        console.log('\n🔒 Testing if disabled user can login...');
        const userLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: testUser.email,
            password: 'newpassword123', // Using the password we set earlier
            expectedRole: testUser.role
          })
        });
        
        if (!userLoginResponse.ok) {
          const errorData = await userLoginResponse.json();
          console.log('✅ Login correctly blocked:', errorData.message);
        } else {
          console.log('❌ Login should have been blocked but was successful');
        }
        
        // Re-enable access
        console.log('\n✅ Re-enabling access...');
        const enableResponse = await fetch(`http://localhost:5000/api/admin/users/${testUser._id}/toggle-access`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            isActive: true
          })
        });
        
        if (enableResponse.ok) {
          const enableResult = await enableResponse.json();
          console.log('✅ Access re-enabled successfully:', enableResult.message);
        }
      } else {
        const errorData = await disableResponse.json();
        console.log('❌ Access disable failed:', errorData.error);
      }
    } else {
      console.log('\n✅ User is already disabled, testing enable...');
      const enableResponse = await fetch(`http://localhost:5000/api/admin/users/${testUser._id}/toggle-access`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: true
        })
      });
      
      if (enableResponse.ok) {
        const result = await enableResponse.json();
        console.log('✅ Access enabled successfully:', result.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testAccessControl();