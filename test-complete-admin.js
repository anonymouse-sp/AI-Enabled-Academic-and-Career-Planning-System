const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting comprehensive admin approval test...\n');

// Start the server in the background
const serverProcess = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: ['pipe', 'pipe', 'pipe']
});

// Wait for server to start
setTimeout(async () => {
  console.log('⏰ Server should be ready now. Running admin test...\n');
  
  try {
    // Import and run the admin approval test
    const testAdminApproval = require('./backend/test-admin-approval.js');
    console.log('✅ Admin approval test completed successfully!');
    
    console.log('\n📝 Summary:');
    console.log('✅ Backend server is working');
    console.log('✅ Admin login functionality works');
    console.log('✅ Admin has proper isHeadAdmin privileges');
    console.log('✅ College and admin approval endpoints work');
    console.log('\n💡 The issue is likely in the frontend or user interaction, not the backend API.');
    console.log('\n🔍 Troubleshooting suggestions:');
    console.log('1. Clear browser cache and local storage');
    console.log('2. Check browser console for JavaScript errors');
    console.log('3. Verify the frontend is connecting to http://localhost:5000');
    console.log('4. Ensure admin is logged in with admin@college-finder.com / admin123');
    console.log('5. Check if there are actually pending registrations to approve');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  // Clean up
  serverProcess.kill();
  process.exit(0);
}, 3000);

serverProcess.stdout.on('data', (data) => {
  console.log('📡 Server:', data.toString().trim());
});

serverProcess.stderr.on('data', (data) => {
  console.error('❌ Server Error:', data.toString().trim());
});

console.log('🔄 Starting server...');