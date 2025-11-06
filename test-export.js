// Test script to verify export functionality
const fetch = require('node-fetch');

async function testExport() {
  try {
    console.log('🧪 Testing export functionality...');
    
    // First, login to get admin token
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
      throw new Error('Login failed');
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful, token obtained');
    
    // Test export endpoint
    const exportResponse = await fetch('http://localhost:5000/api/admin/export/users?role=all&format=csv', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (exportResponse.ok) {
      const csvData = await exportResponse.text();
      console.log('✅ Export successful!');
      console.log('📊 CSV Headers:', csvData.split('\n')[0]);
      console.log('📏 Total lines:', csvData.split('\n').length);
    } else {
      const errorText = await exportResponse.text();
      console.error('❌ Export failed:', exportResponse.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testExport();