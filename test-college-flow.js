// Test College Approval and Search
const testCollegeFlow = async () => {
  const baseURL = 'http://localhost:5001';
  
  console.log('Testing college approval and search flow...');
  
  try {
    // 1. Login as admin
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@college-finder.com',
        password: 'admin123',
        expectedRole: 'admin'
      })
    });

    const loginData = await loginResponse.json();
    const adminToken = loginData.token;
    console.log('✅ Admin login successful');

    // 2. Get pending registrations
    const pendingResponse = await fetch(`${baseURL}/api/admin/pending-registrations`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    const pendingData = await pendingResponse.json();
    console.log('📋 Pending registrations:', pendingData.pendingRegistrations.length);
    
    const pendingCollege = pendingData.pendingRegistrations.find(reg => reg.role === 'college');
    
    if (pendingCollege) {
      console.log(`📍 Found pending college: ${pendingCollege.name} (${pendingCollege.email})`);
      
      // 3. Approve the college
      const approveResponse = await fetch(`${baseURL}/api/admin/approve-registration/${pendingCollege.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (approveResponse.ok) {
        const approveData = await approveResponse.json();
        console.log('✅ College approved successfully:', approveData.message);
        
        // 4. Wait a moment for profile creation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 5. Search for colleges to see if the new college appears
        const searchResponse = await fetch(`${baseURL}/api/colleges/search`);
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          console.log('🔍 College search results:', searchData.colleges?.length || 0, 'colleges found');
          
          const foundCollege = searchData.colleges?.find(college => 
            college.name?.toLowerCase().includes(pendingCollege.name.toLowerCase()) ||
            college.collegeName?.toLowerCase().includes(pendingCollege.name.toLowerCase())
          );
          
          if (foundCollege) {
            console.log('✅ Newly approved college found in search:', foundCollege.name || foundCollege.collegeName);
          } else {
            console.log('❌ Newly approved college NOT found in search results');
            console.log('Available colleges:', searchData.colleges?.map(c => c.name || c.collegeName));
          }
        } else {
          console.error('❌ College search failed');
        }
        
      } else {
        const errorData = await approveResponse.json();
        console.error('❌ Failed to approve college:', errorData);
      }
    } else {
      console.log('ℹ️ No pending college registrations found');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

testCollegeFlow();