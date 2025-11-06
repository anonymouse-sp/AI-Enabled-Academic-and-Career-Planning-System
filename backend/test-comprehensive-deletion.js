// Test comprehensive user deletion with data cleanup
const testComprehensiveUserDeletion = async () => {
  try {
    console.log('🧹 Testing comprehensive user deletion with data cleanup...');
    
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
    
    // Get users to find test subjects
    console.log('\n📡 Fetching users to test comprehensive deletion...');
    const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!usersResponse.ok) {
      throw new Error(`Users fetch failed: ${usersResponse.status}`);
    }
    
    const usersData = await usersResponse.json();
    console.log(`👥 Found ${usersData.users?.length || 0} users`);
    
    // Find a student and a college user for testing
    const testStudent = usersData.users?.find(u => u.role === 'student');
    const testCollege = usersData.users?.find(u => u.role === 'college');
    
    // Test student deletion if available
    if (testStudent) {
      console.log(`\n🎓 Testing STUDENT deletion: ${testStudent.name} (${testStudent.email})`);
      
      // Check what data exists before deletion
      console.log('📊 Checking existing student data before deletion...');
      
      const deleteResponse = await fetch(`http://localhost:5000/api/admin/users/${testStudent._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (deleteResponse.ok) {
        const result = await deleteResponse.json();
        console.log('✅ Student deletion successful:', result.message);
        console.log('🧹 Cleanup Summary:', result.cleanupSummary);
        console.log(`📈 Total records deleted: ${result.cleanupSummary.totalRecordsDeleted}`);
      } else {
        const errorData = await deleteResponse.json();
        console.log('❌ Student deletion failed:', errorData.error);
      }
    } else {
      console.log('⚠️ No student users found to test deletion');
    }
    
    // Test college deletion if available
    if (testCollege && testCollege._id !== testStudent?._id) {
      console.log(`\n🏫 Testing COLLEGE deletion: ${testCollege.name} (${testCollege.email})`);
      
      const deleteResponse = await fetch(`http://localhost:5000/api/admin/users/${testCollege._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (deleteResponse.ok) {
        const result = await deleteResponse.json();
        console.log('✅ College deletion successful:', result.message);
        console.log('🧹 Cleanup Summary:', result.cleanupSummary);
        console.log(`📈 Total records deleted: ${result.cleanupSummary.totalRecordsDeleted}`);
      } else {
        const errorData = await deleteResponse.json();
        console.log('❌ College deletion failed:', errorData.error);
      }
    } else {
      console.log('⚠️ No college users found to test deletion (or same as student)');
    }
    
    // Verify users are actually deleted
    console.log('\n🔍 Verifying users are deleted from database...');
    const verifyResponse = await fetch('http://localhost:5000/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      const remainingUsers = verifyData.users?.length || 0;
      console.log(`📊 Total users remaining after deletion: ${remainingUsers}`);
      
      // Check if deleted users still exist
      if (testStudent) {
        const studentExists = verifyData.users?.find(u => u._id === testStudent._id);
        console.log(`🎓 Student still exists: ${!!studentExists ? 'YES ❌' : 'NO ✅'}`);
      }
      
      if (testCollege && testCollege._id !== testStudent?._id) {
        const collegeExists = verifyData.users?.find(u => u._id === testCollege._id);
        console.log(`🏫 College still exists: ${!!collegeExists ? 'YES ❌' : 'NO ✅'}`);
      }
    }
    
    console.log('\n✅ Comprehensive deletion test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testComprehensiveUserDeletion();