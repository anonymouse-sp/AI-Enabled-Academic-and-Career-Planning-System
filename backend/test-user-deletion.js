// Test admin user deletion functionality
const testUserDeletion = async () => {
  try {
    console.log('🔐 Testing admin user deletion functionality...');
    
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
    console.log('\n📡 Fetching users to test deletion...');
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
    
    // Count users by role before deletion
    const studentsBefore = usersData.users?.filter(u => u.role === 'student').length || 0;
    const collegesBefore = usersData.users?.filter(u => u.role === 'college').length || 0;
    const adminsBefore = usersData.users?.filter(u => u.role === 'admin').length || 0;
    
    console.log(`📊 Before deletion - Students: ${studentsBefore}, Colleges: ${collegesBefore}, Admins: ${adminsBefore}`);
    
    // Find a non-admin user to test deletion (prefer student for testing)
    const testUser = usersData.users?.find(u => u.role === 'student') || usersData.users?.find(u => u.role !== 'admin');
    
    if (!testUser) {
      console.log('⚠️ No non-admin users found to test deletion');
      return;
    }
    
    console.log(`\n🎯 Testing deletion for user: ${testUser.name} (${testUser.email}, ${testUser.role})`);
    
    // Test user deletion
    const deleteResponse = await fetch(`http://localhost:5000/api/admin/users/${testUser._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (deleteResponse.ok) {
      const result = await deleteResponse.json();
      console.log('✅ User deletion successful:', result.message);
      console.log(`🗑️ Deleted user: ${result.deletedUser.name} (${result.deletedUser.email})`);
      
      // Verify user is deleted by fetching users again
      console.log('\n🔍 Verifying user deletion...');
      const verifyResponse = await fetch('http://localhost:5000/api/admin/users/detailed?page=1&limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        const deletedUserStillExists = verifyData.users?.find(u => u._id === testUser._id);
        
        if (!deletedUserStillExists) {
          console.log('✅ User successfully removed from database');
          
          // Count users after deletion
          const studentsAfter = verifyData.users?.filter(u => u.role === 'student').length || 0;
          const collegesAfter = verifyData.users?.filter(u => u.role === 'college').length || 0;
          const adminsAfter = verifyData.users?.filter(u => u.role === 'admin').length || 0;
          
          console.log(`📊 After deletion - Students: ${studentsAfter}, Colleges: ${collegesAfter}, Admins: ${adminsAfter}`);
          console.log(`📈 Total users reduced from ${usersData.users?.length} to ${verifyData.users?.length}`);
        } else {
          console.log('❌ User still exists in database after deletion attempt');
        }
      }
      
      // Test if deleted user can login (should fail)
      console.log('\n🔒 Testing if deleted user can login...');
      const userLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testUser.email,
          password: 'anypassword', 
          expectedRole: testUser.role
        })
      });
      
      if (!userLoginResponse.ok) {
        const errorData = await userLoginResponse.json();
        console.log('✅ Login correctly blocked for deleted user:', errorData.message);
      } else {
        console.log('❌ Deleted user should not be able to login');
      }
      
    } else {
      const errorData = await deleteResponse.json();
      console.log('❌ User deletion failed:', errorData.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testUserDeletion();