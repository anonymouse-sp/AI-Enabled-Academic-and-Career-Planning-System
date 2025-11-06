// Test the exact API response structure to debug frontend issue
const testAPIResponse = async () => {
  try {
    console.log('🔍 Testing exact API response structure...\n');

    // Admin login
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

    // Fetch pending registrations and log exact structure
    const pendingResponse = await fetch('http://localhost:5000/api/admin/pending-registrations', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await pendingResponse.text();
    console.log('📡 Raw API Response:');
    console.log('Status:', pendingResponse.status);
    console.log('Headers:', Object.fromEntries(pendingResponse.headers.entries()));
    console.log('Raw Response Text:', responseText);

    try {
      const pendingData = JSON.parse(responseText);
      console.log('\n📊 Parsed JSON Structure:');
      console.log('Type of response:', typeof pendingData);
      console.log('Keys in response:', Object.keys(pendingData));
      console.log('Full response object:');
      console.log(JSON.stringify(pendingData, null, 2));

      if (pendingData.pendingRegistrations) {
        console.log('\n✅ pendingRegistrations array found:');
        console.log('Array length:', pendingData.pendingRegistrations.length);
        console.log('Array contents:');
        pendingData.pendingRegistrations.forEach((item, index) => {
          console.log(`  [${index}]:`, JSON.stringify(item, null, 2));
        });
      } else {
        console.log('\n❌ NO pendingRegistrations key found in response!');
        console.log('Available keys:', Object.keys(pendingData));
      }

    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      console.log('Response is not valid JSON');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testAPIResponse();