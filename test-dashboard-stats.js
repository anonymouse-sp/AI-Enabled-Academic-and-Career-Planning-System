// Test the updated dashboard stats API
async function testCollegeCount() {
    try {
        // First login as a student
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'surya@gmail.com',
                password: 'student123',
                expectedRole: 'student'
            }),
        });

        if (!loginResponse.ok) {
            console.log('❌ Student login failed');
            return;
        }

        const loginData = await loginResponse.json();
        console.log('✅ Student login successful');

        // Test dashboard stats API
        const statsResponse = await fetch('http://localhost:5000/api/dashboard/stats', {
            headers: {
                'Authorization': `Bearer ${loginData.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            console.log('📊 Updated Dashboard Stats:');
            console.log(`🏫 Total Colleges: ${stats.totalColleges}`);
            console.log(`👥 Total Students: ${stats.totalStudents}`);
            console.log(`📋 Profile Completion: ${stats.profileCompletion}%`);
            
            console.log('\n🔍 This count should now represent:');
            console.log('- Static colleges from College collection (5)');
            console.log('- + Registered college profiles from CollegeProfile collection (0)');
            console.log(`- = Total: ${stats.totalColleges} colleges`);
            
            if (stats.totalColleges === 5) {
                console.log('✅ College count matches expected value!');
            } else {
                console.log(`⚠️ Expected 5 colleges but got ${stats.totalColleges}`);
            }
        } else {
            const errorData = await statsResponse.json();
            console.log('❌ Failed to get dashboard stats:', errorData);
        }

    } catch (error) {
        console.error('❌ Error testing college count:', error.message);
    }
}

testCollegeCount();