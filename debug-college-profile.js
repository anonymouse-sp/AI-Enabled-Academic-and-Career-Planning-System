// Debug college profile creation
const debugCollegeProfile = async () => {
  const baseURL = 'http://localhost:5001';
  
  console.log('Debugging college profile creation...');
  
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

    const loginData = await loginResponse.json();
    const adminToken = loginData.token;

    // Check all users
    const usersResponse = await fetch(`${baseURL}/api/admin/users`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('\n📊 All users in system:');
      if (Array.isArray(usersData)) {
        usersData.forEach(user => {
          console.log(`- ${user.name} (${user.email}) - Role: ${user.role}, Status: ${user.status}`);
        });
      } else {
        console.log('Users data:', usersData);
      }
      
      // Find our test college user
      const users = usersData.users || usersData;
      const testCollege = Array.isArray(users) ? 
        users.find(user => user.email === 'test.college@example.com') : null;
      
      if (testCollege) {
        console.log(`\n✅ Found test college user: ${testCollege.name} - Status: ${testCollege.status}`);
        
        // Try to login as the college user to test profile access
        const collegeLoginResponse = await fetch(`${baseURL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test.college@example.com',
            password: 'password123',
            expectedRole: 'college'
          })
        });

        if (collegeLoginResponse.ok) {
          const collegeLoginData = await collegeLoginResponse.json();
          const collegeToken = collegeLoginData.token;
          console.log('✅ College login successful');
          
          // Check if college profile exists
          const profileResponse = await fetch(`${baseURL}/api/college/profile`, {
            headers: {
              'Authorization': `Bearer ${collegeToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('✅ College profile found:', profileData.collegeName);
            console.log('Profile active status:', profileData.isActive);
          } else {
            const errorData = await profileResponse.json();
            console.log('❌ College profile not found:', errorData);
          }
        } else {
          const errorData = await collegeLoginResponse.json();
          console.log('❌ College login failed:', errorData);
        }
      } else {
        console.log('❌ Test college user not found');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

debugCollegeProfile();