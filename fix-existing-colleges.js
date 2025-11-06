// Fix existing college users without profiles using new admin endpoint
const fixExistingColleges = async () => {
  const baseURL = 'http://localhost:5001';
  
  console.log('Creating profiles for existing college users...');
  
  try {
    // Login as admin
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@college-finder.com',
        password: 'admin123',
        expectedRole: 'admin'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Admin login failed');
      return;
    }

    const loginData = await loginResponse.json();
    const adminToken = loginData.token;
    console.log('✅ Admin login successful');

    // Call the new endpoint to create profiles
    const createProfilesResponse = await fetch(`${baseURL}/api/admin/create-college-profiles`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
    });

    if (createProfilesResponse.ok) {
      const result = await createProfilesResponse.json();
      console.log('✅ Profile creation completed:');
      console.log(`- Total colleges: ${result.results.total}`);
      console.log(`- Profiles created: ${result.results.created}`);
      console.log(`- Profiles skipped (already exist): ${result.results.skipped}`);
      console.log(`- Errors: ${result.results.errors}`);
      
      // Now test the search
      console.log('\n🔍 Testing college search after profile creation...');
      const searchResponse = await fetch(`${baseURL}/api/colleges/search`);
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        console.log(`Found ${searchData.colleges?.length || 0} colleges in search:`);
        searchData.colleges?.forEach(college => {
          console.log(`- ${college.name || college.collegeName}`);
        });
      }
      
    } else {
      const errorData = await createProfilesResponse.json();
      console.log('❌ Failed to create profiles:', errorData);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

fixExistingColleges();