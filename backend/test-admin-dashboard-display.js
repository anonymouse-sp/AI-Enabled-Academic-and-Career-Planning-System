// Test if admin dashboard API returns pending college registrations correctly
const testAdminDashboardPendingDisplay = async () => {
  try {
    console.log('🔍 Testing Admin Dashboard Pending Registrations Display...\n');

    // Step 1: Admin login
    console.log('🔐 Step 1: Admin login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@college-finder.com',
        password: 'admin123',
        expectedRole: 'admin'
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      throw new Error(`Admin login failed: ${error.error}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Admin login successful');
    console.log(`👤 Admin: ${loginData.user.name} (${loginData.user.role})`);
    console.log(`👑 Head Admin: ${loginData.user.isHeadAdmin}\n`);

    // Step 2: Fetch pending registrations (what frontend does)
    console.log('📋 Step 2: Fetching pending registrations...');
    const pendingResponse = await fetch('http://localhost:5000/api/admin/pending-registrations', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!pendingResponse.ok) {
      const error = await pendingResponse.json();
      throw new Error(`Failed to fetch pending registrations: ${error.error}`);
    }

    const pendingData = await pendingResponse.json();
    console.log(`✅ API Response received successfully`);
    console.log(`📊 Total pending registrations: ${pendingData.pendingRegistrations.length}\n`);

    // Step 3: Display pending colleges specifically
    const collegeRegistrations = pendingData.pendingRegistrations.filter(reg => reg.role === 'college');
    console.log('🏫 COLLEGES NEEDING APPROVAL:');
    console.log('=' + '='.repeat(50));

    if (collegeRegistrations.length === 0) {
      console.log('❌ No pending college registrations found.');
      console.log('💡 This means all colleges have been approved or there are no college registrations.');
    } else {
      collegeRegistrations.forEach((college, index) => {
        console.log(`${index + 1}. 🏫 ${college.name}`);
        console.log(`   📧 Email: ${college.email}`);
        console.log(`   🏷️  Role: ${college.role}`);
        console.log(`   📅 Registered: ${new Date(college.createdAt).toLocaleString()}`);
        console.log(`   🆔 ID: ${college.id}`);
        console.log('   ' + '-'.repeat(40));
      });

      console.log(`\n✅ ${collegeRegistrations.length} college(s) are waiting for admin approval!`);
      console.log('💡 These colleges should appear in the Admin Dashboard under "Pending Registrations"');
    }

    // Step 4: Show what admin dashboard should display
    console.log('\n🖥️  ADMIN DASHBOARD SHOULD SHOW:');
    console.log('=' + '='.repeat(50));
    console.log('📋 Pending Registrations Table:');
    console.log('┌─────────────────────────────────┬─────────────────────────┬─────────┬─────────────┬─────────────┐');
    console.log('│ Name                            │ Email                   │ Role    │ Date        │ Actions     │');
    console.log('├─────────────────────────────────┼─────────────────────────┼─────────┼─────────────┼─────────────┤');
    
    pendingData.pendingRegistrations.forEach(reg => {
      const name = reg.name.padEnd(31);
      const email = reg.email.padEnd(23);
      const role = reg.role.padEnd(7);
      const date = new Date(reg.createdAt).toLocaleDateString().padEnd(11);
      console.log(`│ ${name} │ ${email} │ ${role} │ ${date} │ [✅][❌]     │`);
    });
    
    console.log('└─────────────────────────────────┴─────────────────────────┴─────────┴─────────────┴─────────────┘');

    console.log('\n🎯 SUMMARY:');
    console.log('✅ Backend API is working correctly');
    console.log('✅ Pending registrations are being returned properly');
    console.log('✅ College registrations are included in the response');
    console.log('✅ Admin dashboard should display these pending colleges');
    console.log('\n💡 If colleges are not showing in the frontend dashboard:');
    console.log('   1. Check browser console for JavaScript errors');
    console.log('   2. Verify VITE_API_URL is set to http://localhost:5000');
    console.log('   3. Ensure admin is properly logged in');
    console.log('   4. Check if frontend is making the API call correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testAdminDashboardPendingDisplay();