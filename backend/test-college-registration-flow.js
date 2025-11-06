const API_BASE = 'http://localhost:5000';

async function testCollegeRegistrationFlow() {
  console.log('🏫 Testing Complete College Registration & Approval Flow\n');
  
  try {
    // Step 1: Register a new college
    console.log('📝 Step 1: College Registration...');
    const collegeData = {
      name: 'Test College of Engineering',
      email: `test.college.${Date.now()}@example.com`,
      password: 'password123',
      role: 'college'
    };
    
    console.log(`Registering college: ${collegeData.name} (${collegeData.email})`);
    
    const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collegeData)
    });
    
    if (!registerResponse.ok) {
      throw new Error(`Registration failed: ${registerResponse.status}`);
    }
    
    const registerResult = await registerResponse.json();
    console.log('✅ College registration response:', registerResult);
    
    if (registerResult.status !== 'pending') {
      throw new Error('Expected college registration to have pending status');
    }
    
    // Step 2: Admin login
    console.log('\n🔐 Step 2: Admin Login...');
    const adminLoginResponse = await fetch(`${API_BASE}/api/auth/login`, {
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
      throw new Error(`Admin login failed: ${adminLoginResponse.status} - ${errorData.error || 'Unknown error'}`);
    }
    
    const adminLogin = await adminLoginResponse.json();
    console.log('✅ Admin login successful:', {
      role: adminLogin.user.role,
      isHeadAdmin: adminLogin.user.isHeadAdmin
    });
    
    const adminToken = adminLogin.token;
    
    // Step 3: Check pending registrations
    console.log('\n📋 Step 3: Checking Pending Registrations...');
    const pendingResponse = await fetch(`${API_BASE}/api/admin/pending-registrations`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    if (!pendingResponse.ok) {
      throw new Error('Failed to fetch pending registrations');
    }
    
    const pendingData = await pendingResponse.json();
    console.log(`✅ Found ${pendingData.pendingRegistrations.length} pending registrations:`);
    
    let testCollegeId = null;
    pendingData.pendingRegistrations.forEach((reg, index) => {
      console.log(`  ${index + 1}. ${reg.name} (${reg.email}) - Role: ${reg.role} - Created: ${new Date(reg.createdAt).toLocaleString()}`);
      if (reg.email === collegeData.email) {
        testCollegeId = reg.id;
        console.log(`    🎯 Found our test college with ID: ${testCollegeId}`);
      }
    });
    
    if (!testCollegeId) {
      throw new Error('Test college not found in pending registrations');
    }
    
    // Step 4: Approve the college registration
    console.log('\n✅ Step 4: Approving College Registration...');
    const approveResponse = await fetch(`${API_BASE}/api/admin/approve-registration/${testCollegeId}`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!approveResponse.ok) {
      const errorData = await approveResponse.json();
      throw new Error(`Approval failed: ${errorData.error}`);
    }
    
    const approveResult = await approveResponse.json();
    console.log('✅ College approval successful:', approveResult.message);
    
    // Step 5: Verify college can now login
    console.log('\n🔑 Step 5: Testing College Login After Approval...');
    const collegeLoginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: collegeData.email,
        password: collegeData.password,
        expectedRole: 'college'
      })
    });
    
    if (!collegeLoginResponse.ok) {
      throw new Error('College login failed after approval');
    }
    
    const collegeLogin = await collegeLoginResponse.json();
    console.log('✅ College can now login successfully!', {
      name: collegeLogin.user.name,
      role: collegeLogin.user.role,
      status: collegeLogin.user.status
    });
    
    // Step 6: Verify college no longer appears in pending registrations
    console.log('\n🔍 Step 6: Verifying College Removed from Pending List...');
    const finalPendingResponse = await fetch(`${API_BASE}/api/admin/pending-registrations`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    const finalPendingData = await finalPendingResponse.json();
    const stillPending = finalPendingData.pendingRegistrations.find(reg => reg.email === collegeData.email);
    
    if (stillPending) {
      throw new Error('College still appears in pending registrations after approval');
    }
    
    console.log('✅ College successfully removed from pending registrations list');
    
    console.log('\n🎉 COMPLETE COLLEGE REGISTRATION FLOW TEST PASSED!');
    console.log('\n📋 Summary:');
    console.log('✅ 1. College registration creates pending status');
    console.log('✅ 2. College appears in admin dashboard pending registrations');
    console.log('✅ 3. Admin can approve college registration');
    console.log('✅ 4. Approved college can login successfully');
    console.log('✅ 5. Approved college is removed from pending list');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testCollegeRegistrationFlow();