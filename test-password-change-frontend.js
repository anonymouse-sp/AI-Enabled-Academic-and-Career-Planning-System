// Test admin password change functionality from frontend perspective
// Using native fetch available in Node.js 18+

async function testPasswordChange() {
    try {
        console.log('🔐 Testing admin password change functionality...');

        // First login as admin
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: 'admin123'
            }),
        });

        if (!loginResponse.ok) {
            console.log('❌ Admin login failed');
            return;
        }

        const loginData = await loginResponse.json();
        console.log('✅ Admin login successful');

        // Get list of users to find a test user
        const usersResponse = await fetch('http://localhost:5000/api/admin/users/detailed?page=1&limit=10', {
            headers: {
                'Authorization': `Bearer ${loginData.token}`,
            },
        });

        if (!usersResponse.ok) {
            console.log('❌ Failed to get users list');
            return;
        }

        const usersData = await usersResponse.json();
        console.log(`📋 Found ${usersData.users.length} users`);

        // Find a non-admin user to test password change
        const testUser = usersData.users.find(user => user.role !== 'admin');
        if (!testUser) {
            console.log('⚠️ No non-admin users found to test password change');
            return;
        }

        console.log(`🎯 Testing password change for user: ${testUser.name} (${testUser.email})`);

        // Test password change
        const passwordChangeResponse = await fetch(`http://localhost:5000/api/admin/users/${testUser._id}/change-password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${loginData.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                newPassword: 'newpassword123'
            }),
        });

        if (passwordChangeResponse.ok) {
            const result = await passwordChangeResponse.json();
            console.log('✅ Password change successful:', result.message);
            console.log(`🔐 Password for ${testUser.name} has been changed`);
            
            // Test login with new password
            const testLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: testUser.email,
                    password: 'newpassword123'
                }),
            });

            if (testLoginResponse.ok) {
                console.log('✅ User can login with new password');
            } else {
                console.log('❌ User cannot login with new password');
            }

        } else {
            const errorData = await passwordChangeResponse.json();
            console.log('❌ Password change failed:', errorData.error);
        }

    } catch (error) {
        console.error('❌ Error testing password change:', error.message);
    }
}

testPasswordChange();