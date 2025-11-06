// Create a test college registration
const createTestCollege = async () => {
  const baseURL = 'http://localhost:5001';
  
  console.log('Creating test college registration...');
  
  try {
    const registerResponse = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'New Test College 2',
        email: 'newtest.college@example.com',
        password: 'password123',
        role: 'college'
      })
    });

    const registerData = await registerResponse.json();
    
    if (registerResponse.ok) {
      console.log('✅ Test college registered successfully:', registerData.message);
    } else {
      console.log('Registration response:', registerData);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

createTestCollege();