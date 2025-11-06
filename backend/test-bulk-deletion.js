// Test bulk user deletion with comprehensive cleanup
const testBulkDeletion = async () => {
  try {
    console.log('🗑️ Testing bulk user deletion with comprehensive cleanup...');
    
    // Login as admin
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@college-finder.com',
        password: 'admin123',
        expectedRole: 'admin'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Admin login successful');
    
    // Get users for bulk deletion
    const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const usersData = await usersResponse.json();
    console.log(`👥 Found ${usersData.users?.length || 0} total users`);
    
    // Select multiple non-admin users for bulk deletion
    const nonAdminUsers = usersData.users?.filter(u => u.role !== 'admin') || [];
    const usersToDelete = nonAdminUsers.slice(0, Math.min(3, nonAdminUsers.length)); // Delete up to 3 users
    
    if (usersToDelete.length === 0) {
      console.log('⚠️ No non-admin users found for bulk deletion test');
      return;
    }
    
    const userIds = usersToDelete.map(u => u._id);
    
    console.log(`\n🎯 Selected ${usersToDelete.length} users for bulk deletion:`);
    usersToDelete.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}, ${user.role})`);
    });
    
    // Count data before deletion
    console.log('\n📊 Counting existing data before bulk deletion...');
    
    // Perform bulk deletion
    console.log('\n🗑️ Performing bulk deletion...');
    const bulkDeleteResponse = await fetch('http://localhost:5000/api/admin/users/bulk-action', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userIds: userIds,
        action: 'delete'
      })
    });
    
    if (bulkDeleteResponse.ok) {
      const result = await bulkDeleteResponse.json();
      console.log('✅ Bulk deletion successful:', result.message);
      console.log('📊 Users affected:', result.affected);
      
      if (result.cleanupSummary) {
        console.log('🧹 Comprehensive Cleanup Summary:');
        console.log(`   - Users deleted: ${result.cleanupSummary.users}`);
        console.log(`   - Profiles deleted: ${result.cleanupSummary.profiles}`);
        console.log(`   - Applications deleted: ${result.cleanupSummary.applications}`);
        console.log(`   - Quiz responses deleted: ${result.cleanupSummary.quizResponses}`);
        console.log(`   - Total records deleted: ${Object.values(result.cleanupSummary).reduce((sum, count) => sum + count, 0)}`);
      }
    } else {
      const errorData = await bulkDeleteResponse.json();
      console.log('❌ Bulk deletion failed:', errorData.error);
      return;
    }
    
    // Verify deletion
    console.log('\n🔍 Verifying bulk deletion results...');
    const verifyResponse = await fetch('http://localhost:5000/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      const remainingUsers = verifyData.users?.length || 0;
      
      console.log(`📊 Users remaining after bulk deletion: ${remainingUsers}`);
      
      // Check if any of the deleted users still exist
      let stillExisting = 0;
      usersToDelete.forEach(user => {
        const exists = verifyData.users?.find(u => u._id === user._id);
        if (exists) {
          stillExisting++;
          console.log(`❌ User ${user.name} still exists in database`);
        }
      });
      
      if (stillExisting === 0) {
        console.log('✅ All selected users successfully removed from database');
      } else {
        console.log(`❌ ${stillExisting} users still exist after bulk deletion`);
      }
    }
    
    console.log('\n✅ Bulk deletion test completed!');
    
  } catch (error) {
    console.error('❌ Bulk deletion test failed:', error);
  }
};

testBulkDeletion();