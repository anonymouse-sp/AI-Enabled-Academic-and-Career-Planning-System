// Test script to verify registration and approval system
const testRegistrationApproval = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    // 1. First register a test student
    console.log('Step 1: Registering test student...');
    const registerResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: 'teststudent@example.com',
        password: 'password123',
        role: 'student'
      })
    });
    
    const registerResult = await registerResponse.json();
    console.log('Registration result:', registerResult);
    
    // 2. Login as admin
    console.log('Step 2: Logging in as admin...');
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@college-finder.com',
        password: 'admin123'
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log('Login result:', loginResult);
    const token = loginResult.token;
    
    // 3. Get pending registrations
    console.log('Step 3: Getting pending registrations...');
    const pendingResponse = await fetch(`${baseURL}/admin/pending-registrations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const pendingResult = await pendingResponse.json();
    console.log('Pending registrations:', pendingResult);
    
    if (pendingResult.pendingRegistrations && pendingResult.pendingRegistrations.length > 0) {
      const firstPending = pendingResult.pendingRegistrations[0];
      console.log('First pending registration ID:', firstPending.id, 'Type:', typeof firstPending.id);
      
      // 4. Try to approve the first pending registration
      console.log('Step 4: Approving first pending registration...');
      const approveResponse = await fetch(`${baseURL}/admin/approve-registration/${firstPending.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const approveResult = await approveResponse.json();
      console.log('Approval result:', approveResult);
      console.log('Approval response status:', approveResponse.status);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the test
console.log('Starting registration approval test...');
testRegistrationApproval();