// Test login with the admin users we found
async function testAdminLogin() {
    const adminUsers = [
        { email: 'admin@college-finder.com', password: 'admin123', expectedRole: 'admin' },
        { email: 'admin@gmail.com', password: 'admin123', expectedRole: 'admin' },
        { email: 'adm@gmail.com', password: 'admin123', expectedRole: 'admin' }
    ];

    for (const admin of adminUsers) {
        try {
            console.log(`🔐 Testing login for: ${admin.email}`);
            
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(admin),
            });

            console.log(`Login response status for ${admin.email}:`, response.status);

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Login successful for ${admin.email}!`);
                
                // Now test password change with this admin
                await testPasswordChangeWithAdmin(data.token);
                return; // Exit after first successful login
            } else {
                const errorData = await response.json();
                console.log(`❌ Login failed for ${admin.email}:`, errorData.error);
            }
        } catch (error) {
            console.error(`Error testing ${admin.email}:`, error.message);
        }
    }
}

async function testPasswordChangeWithAdmin(token) {
    try {
        console.log('📋 Getting users list...');
        
        // Get users list
        const usersResponse = await fetch('http://localhost:5000/api/admin/users/detailed?page=1&limit=10', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!usersResponse.ok) {
            console.log('❌ Failed to get users list');
            const errorText = await usersResponse.text();
            console.log('Error:', errorText);
            return;
        }

        const usersData = await usersResponse.json();
        console.log(`Found ${usersData.users.length} users`);

        // Find a non-admin user to test password change
        const testUser = usersData.users.find(user => user.role !== 'admin');
        if (!testUser) {
            console.log('⚠️ No non-admin users found, using first admin user for test');
            testUser = usersData.users[0];
        }

        console.log(`🎯 Testing password change for: ${testUser.name} (${testUser.email})`);

        // Test password change
        const passwordResponse = await fetch(`http://localhost:5000/api/admin/users/${testUser._id}/change-password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                newPassword: 'newpassword123'
            }),
        });

        console.log('Password change response status:', passwordResponse.status);

        if (passwordResponse.ok) {
            const result = await passwordResponse.json();
            console.log('✅ Password change successful!', result.message);
            console.log('✅ Backend password change endpoint is working correctly!');
        } else {
            const errorData = await passwordResponse.json();
            console.log('❌ Password change failed:', errorData);
        }

    } catch (error) {
        console.error('❌ Error in password change test:', error.message);
    }
}

testAdminLogin();