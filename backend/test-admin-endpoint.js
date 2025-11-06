// Test admin login and users endpoint
const testAdminLogin = async () => {
  try {
    console.log('🔐 Testing admin login...');
    
    // First, login as admin
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@college-finder.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Admin login successful:', loginData);
    
    const token = loginData.token;
    
    // Test the users/detailed endpoint
    console.log('\n📡 Testing users/detailed endpoint...');
    const usersResponse = await fetch('http://localhost:5000/api/admin/users/detailed?page=1&limit=20', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!usersResponse.ok) {
      throw new Error(`Users fetch failed: ${usersResponse.status}`);
    }
    
    const usersData = await usersResponse.json();
    console.log('👥 Users data:', usersData);
    console.log(`📊 Total users found: ${usersData.users?.length || 0}`);
    
    if (usersData.users) {
      console.log('\n📚 Students found:');
      const students = usersData.users.filter(u => u.role === 'student');
      students.forEach((student, index) => {
        console.log(`${index + 1}. ${student.name} (${student.email}) - Active: ${student.isActive}`);
      });
      
      console.log('\n🏫 Colleges found:');
      const colleges = usersData.users.filter(u => u.role === 'college');
      colleges.forEach((college, index) => {
        console.log(`${index + 1}. ${college.name} (${college.email}) - Active: ${college.isActive}`);
      });
      
      console.log('\n⚙️ Admins found:');
      const admins = usersData.users.filter(u => u.role === 'admin');
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name} (${admin.email}) - Active: ${admin.isActive}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testAdminLogin();