// Check current college search results
const checkCollegeSearch = async () => {
  const baseURL = 'http://localhost:5001';
  
  console.log('Checking current college search results...');
  
  try {
    // Check both endpoints
    console.log('\n1. Checking /api/colleges endpoint:');
    const colleges1 = await fetch(`${baseURL}/api/colleges`);
    if (colleges1.ok) {
      const data1 = await colleges1.json();
      console.log(`Found ${data1.colleges?.length || 0} colleges`);
      data1.colleges?.forEach(college => {
        console.log(`- ${college.name || college.collegeName} (Active: ${college.isActive})`);
      });
    } else {
      console.log('❌ Failed to fetch from /api/colleges');
    }
    
    console.log('\n2. Checking /api/colleges/search endpoint:');
    const colleges2 = await fetch(`${baseURL}/api/colleges/search`);
    if (colleges2.ok) {
      const data2 = await colleges2.json();
      console.log(`Found ${data2.colleges?.length || 0} colleges`);
      data2.colleges?.forEach(college => {
        console.log(`- ${college.name || college.collegeName} (ID: ${college.id})`);
      });
    } else {
      console.log('❌ Failed to fetch from /api/colleges/search');
    }

    // Check if there are any approved college users without profiles
    console.log('\n3. Checking for approved college users...');
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@college-finder.com',
        password: 'admin123',
        expectedRole: 'admin'
      })
    });

    const loginData = await loginResponse.json();
    const adminToken = loginData.token;

    const usersResponse = await fetch(`${baseURL}/api/admin/users`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      const collegeUsers = usersData.filter ? usersData.filter(user => user.role === 'college') : [];
      console.log(`Found ${collegeUsers.length} college users:`);
      collegeUsers.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - Status: ${user.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

checkCollegeSearch();