// Test script to verify strict role-based login validation
const testRoleBasedLogin = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🧪 Testing Strict Role-Based Login Validation\n');
  
  try {
    // First, create test users for each role
    console.log('📝 Step 1: Creating test student...');
    const studentRegisterResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: 'student@test.com',
        password: 'password123',
        role: 'student'
      })
    });
    const studentResult = await studentRegisterResponse.json();
    console.log('Student registration:', studentResult.message);

    console.log('\n📝 Step 2: Creating test college (pending approval)...');
    const collegeRegisterResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test College',
        email: 'college@test.com',
        password: 'password123',
        role: 'college'
      })
    });
    const collegeResult = await collegeRegisterResponse.json();
    console.log('College registration:', collegeResult.message);

    // Login as admin to approve college
    console.log('\n🔑 Step 3: Admin logging in to approve college...');
    const adminLoginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@college-finder.com',
        password: 'admin123',
        expectedRole: 'admin'
      })
    });
    const adminLogin = await adminLoginResponse.json();
    console.log('Admin login successful');

    // Get pending registrations
    const pendingResponse = await fetch(`${baseURL}/admin/pending-registrations`, {
      headers: { 'Authorization': `Bearer ${adminLogin.token}` }
    });
    const pendingData = await pendingResponse.json();
    
    if (pendingData.pendingRegistrations.length > 0) {
      const collegeId = pendingData.pendingRegistrations[0].id;
      console.log('Approving college registration...');
      
      const approveResponse = await fetch(`${baseURL}/admin/approve-registration/${collegeId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminLogin.token}` }
      });
      const approveResult = await approveResponse.json();
      console.log('College approved:', approveResult.message);
    }

    // Now test the strict role-based login validation
    console.log('\n🔒 Step 4: Testing Role-Based Login Validation...');
    
    // Test 1: Student trying to login through correct student login (should work)
    console.log('\n✅ Test 1: Student login through Student page...');
    const studentLoginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@test.com',
        password: 'password123',
        expectedRole: 'student'
      })
    });
    if (studentLoginResponse.ok) {
      console.log('✅ SUCCESS: Student can login through Student page');
    } else {
      const error = await studentLoginResponse.json();
      console.log('❌ FAILED:', error.error);
    }

    // Test 2: Student trying to login through college page (should fail)
    console.log('\n❌ Test 2: Student login through College page (should fail)...');
    const studentWrongLoginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@test.com',
        password: 'password123',
        expectedRole: 'college'
      })
    });
    if (!studentWrongLoginResponse.ok) {
      const error = await studentWrongLoginResponse.json();
      console.log('✅ SUCCESS: Student correctly blocked from College page');
      console.log('   Error message:', error.error);
    } else {
      console.log('❌ FAILED: Student should not be able to login through College page!');
    }

    // Test 3: College trying to login through correct college page (should work)
    console.log('\n✅ Test 3: College login through College page...');
    const collegeLoginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'college@test.com',
        password: 'password123',
        expectedRole: 'college'
      })
    });
    if (collegeLoginResponse.ok) {
      console.log('✅ SUCCESS: College can login through College page');
    } else {
      const error = await collegeLoginResponse.json();
      console.log('❌ FAILED:', error.error);
    }

    // Test 4: College trying to login through student page (should fail)
    console.log('\n❌ Test 4: College login through Student page (should fail)...');
    const collegeWrongLoginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'college@test.com',
        password: 'password123',
        expectedRole: 'student'
      })
    });
    if (!collegeWrongLoginResponse.ok) {
      const error = await collegeWrongLoginResponse.json();
      console.log('✅ SUCCESS: College correctly blocked from Student page');
      console.log('   Error message:', error.error);
    } else {
      console.log('❌ FAILED: College should not be able to login through Student page!');
    }

    // Test 5: Admin trying to login through student page (should fail)
    console.log('\n❌ Test 5: Admin login through Student page (should fail)...');
    const adminWrongLoginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@college-finder.com',
        password: 'admin123',
        expectedRole: 'student'
      })
    });
    if (!adminWrongLoginResponse.ok) {
      const error = await adminWrongLoginResponse.json();
      console.log('✅ SUCCESS: Admin correctly blocked from Student page');
      console.log('   Error message:', error.error);
    } else {
      console.log('❌ FAILED: Admin should not be able to login through Student page!');
    }

    console.log('\n🎉 Role-based login validation tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
console.log('Starting role-based login validation tests...\n');
testRoleBasedLogin();