// Test the password change endpoint directly
async function testPasswordChangeEndpoint() {
    try {
        console.log('🔐 Testing password change endpoint...');

        // First, let's test if we can reach the backend
        const healthResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: 'admin123'
            }),
        });

        console.log('Health check response status:', healthResponse.status);
        
        if (!healthResponse.ok) {
            console.log('❌ Backend not responding or admin login failed');
            
            // Let's check what users exist
            console.log('Checking available endpoints...');
            
            const pingResponse = await fetch('http://localhost:5000');
            console.log('Ping response status:', pingResponse.status);
            
            return;
        }

        const loginData = await healthResponse.json();
        console.log('✅ Admin login successful, token received');

        // Get list of users to find someone to test with
        const usersResponse = await fetch('http://localhost:5000/api/admin/users/detailed?page=1&limit=5', {
            headers: {
                'Authorization': `Bearer ${loginData.token}`,
            },
        });

        if (!usersResponse.ok) {
            console.log('❌ Failed to get users list');
            const errorText = await usersResponse.text();
            console.log('Users API error:', errorText);
            return;
        }

        const usersData = await usersResponse.json();
        console.log(`📋 Found ${usersData.users.length} users total`);

        if (usersData.users.length === 0) {
            console.log('⚠️ No users found to test password change');
            return;
        }

        // Use the first user for testing
        const testUser = usersData.users[0];
        console.log(`🎯 Testing password change for: ${testUser.name} (${testUser.email})`);

        // Test password change
        const passwordChangeResponse = await fetch(`http://localhost:5000/api/admin/users/${testUser._id}/change-password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${loginData.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                newPassword: 'testpassword123'
            }),
        });

        console.log('Password change response status:', passwordChangeResponse.status);

        if (passwordChangeResponse.ok) {
            const result = await passwordChangeResponse.json();
            console.log('✅ Password change successful:', result.message);
            console.log('✅ Backend endpoint is working correctly!');
        } else {
            const errorData = await passwordChangeResponse.json();
            console.log('❌ Password change failed:', errorData.error);
            console.log('Response status:', passwordChangeResponse.status);
            console.log('Full error response:', errorData);
        }

    } catch (error) {
        console.error('❌ Error testing password change endpoint:', error.message);
        console.log('Make sure the backend server is running on port 5000');
    }
}

testPasswordChangeEndpoint();