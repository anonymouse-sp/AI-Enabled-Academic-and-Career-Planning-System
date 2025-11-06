// Test admin approval functionality
const testAdminApproval = async () => {
  try {
    console.log('🔧 Testing admin approval functionality...');
    
    // 1. First, login as admin to check current admin status
    const adminLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@college-finder.com',
        password: 'admin123',
        expectedRole: 'admin'
      })
    });
    
    if (!adminLoginResponse.ok) {
      const errorData = await adminLoginResponse.json();
      console.log('❌ Admin login failed:', errorData);
      return;
    }
    
    const adminLoginData = await adminLoginResponse.json();
    const token = adminLoginData.token;
    console.log('✅ Admin login successful');
    console.log('🔍 Admin user details:', adminLoginData.user);
    console.log('👑 Is Head Admin:', adminLoginData.user.isHeadAdmin);
    
    // 2. Check admin profile for isHeadAdmin flag
    const profileResponse = await fetch('http://localhost:5000/api/user/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('📋 Admin profile isHeadAdmin:', profileData.isHeadAdmin);
    }
    
    // 3. Create a test college registration to approve
    console.log('\n📝 Step 1: Creating test college registration...');
    const collegeRegResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test College for Approval',
        email: 'test-college-approval@example.com',
        password: 'password123',
        role: 'college'
      })
    });
    
    const collegeRegData = await collegeRegResponse.json();
    console.log('📋 College registration result:', collegeRegData);
    
    // 4. Create a test admin registration to approve
    console.log('\n👤 Step 2: Creating test admin registration...');
    const adminRegResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Admin for Approval',
        email: 'test-admin-approval@example.com',
        password: 'password123',
        role: 'admin'
      })
    });
    
    const adminRegData = await adminRegResponse.json();
    console.log('👥 Admin registration result:', adminRegData);
    
    // 5. Get pending registrations
    console.log('\n📋 Step 3: Getting pending registrations...');
    const pendingResponse = await fetch('http://localhost:5000/api/admin/pending-registrations', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!pendingResponse.ok) {
      const errorData = await pendingResponse.json();
      console.log('❌ Failed to get pending registrations:', errorData);
      return;
    }
    
    const pendingData = await pendingResponse.json();
    console.log('📊 Pending registrations count:', pendingData.pendingRegistrations.length);
    
    // Find our test registrations
    const testCollege = pendingData.pendingRegistrations.find(r => 
      r.email === 'test-college-approval@example.com'
    );
    const testAdmin = pendingData.pendingRegistrations.find(r => 
      r.email === 'test-admin-approval@example.com'
    );
    
    console.log('🎯 Found test college:', !!testCollege);
    console.log('🎯 Found test admin:', !!testAdmin);
    
    // 6. Test college approval
    if (testCollege) {
      console.log('\n🏫 Step 4: Testing college approval...');
      const approveCollegeResponse = await fetch(`http://localhost:5000/api/admin/approve-registration/${testCollege.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (approveCollegeResponse.ok) {
        const result = await approveCollegeResponse.json();
        console.log('✅ College approval successful:', result.message);
      } else {
        const errorData = await approveCollegeResponse.json();
        console.log('❌ College approval failed:', errorData);
      }
    }
    
    // 7. Test admin approval (should work if current user is head admin)
    if (testAdmin) {
      console.log('\n👤 Step 5: Testing admin approval...');
      const approveAdminResponse = await fetch(`http://localhost:5000/api/admin/approve-registration/${testAdmin.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (approveAdminResponse.ok) {
        const result = await approveAdminResponse.json();
        console.log('✅ Admin approval successful:', result.message);
      } else {
        const errorData = await approveAdminResponse.json();
        console.log('❌ Admin approval failed:', errorData);
        
        if (errorData.error.includes('head admin')) {
          console.log('🔍 Issue: Current admin user does not have head admin privileges');
        }
      }
    }
    
    // 8. Test rejection functionality
    if (pendingData.pendingRegistrations.length > 0) {
      const firstPending = pendingData.pendingRegistrations[0];
      console.log(`\n❌ Step 6: Testing rejection for ${firstPending.name}...`);
      
      const rejectResponse = await fetch(`http://localhost:5000/api/admin/reject-registration/${firstPending.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (rejectResponse.ok) {
        const result = await rejectResponse.json();
        console.log('✅ Rejection successful:', result.message);
      } else {
        const errorData = await rejectResponse.json();
        console.log('❌ Rejection failed:', errorData);
      }
    }
    
    console.log('\n✅ Admin approval functionality test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testAdminApproval();