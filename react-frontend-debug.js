// Test React Frontend Admin Dashboard Directly
console.log('🔍 Testing React Frontend Admin Dashboard Integration');

// Simulate the exact environment and API calls the React app makes
const testReactAdminDashboard = async () => {
    const API_URL = 'http://localhost:5000'; // VITE_API_URL
    
    console.log('🚀 1. Simulating Admin Login (React style)...');
    
    try {
        // Step 1: Login as admin (same as React frontend)
        const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@college-finder.com',
                password: 'admin123',
                expectedRole: 'admin'
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status}`);
        }
        
        const loginData = await loginResponse.json();
        console.log('✅ Admin login successful');
        console.log('👤 User data:', {
            name: loginData.user.name,
            role: loginData.user.role,
            isHeadAdmin: loginData.user.isHeadAdmin
        });
        
        const token = loginData.token;
        console.log('🔑 Token received (first 20 chars):', token.substring(0, 20) + '...');
        
        // Step 2: Fetch dashboard data (exactly like AdminDashboard.tsx does)
        console.log('\n🔍 2. Fetching Dashboard Stats...');
        
        try {
            const statsResponse = await fetch(`${API_URL}/api/admin/dashboard/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                console.log('✅ Stats fetched successfully:', statsData);
            } else {
                console.log('⚠️ Stats fetch failed (continuing without stats)');
            }
        } catch (statsError) {
            console.log('⚠️ Stats error (continuing):', statsError.message);
        }
        
        // Step 3: Fetch pending registrations (critical for display)
        console.log('\n🔍 3. Fetching Pending Registrations...');
        const pendingResponse = await fetch(`${API_URL}/api/admin/pending-registrations`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        console.log('📡 Pending registrations response status:', pendingResponse.status);
        
        if (pendingResponse.ok) {
            const pendingData = await pendingResponse.json();
            console.log('✅ Pending registrations received');
            console.log('📊 Response structure:', Object.keys(pendingData));
            console.log('📋 Pending registrations array:', pendingData.pendingRegistrations);
            
            if (pendingData.pendingRegistrations && Array.isArray(pendingData.pendingRegistrations)) {
                console.log('✅ Valid array with', pendingData.pendingRegistrations.length, 'items');
                
                // Simulate React state update
                const pendingRegistrations = pendingData.pendingRegistrations;
                console.log('\n📊 What React state should contain:');
                console.log('- Total pending:', pendingRegistrations.length);
                console.log('- Colleges:', pendingRegistrations.filter(r => r.role === 'college').length);
                console.log('- Admins:', pendingRegistrations.filter(r => r.role === 'admin').length);
                
                // Test each user for display
                console.log('\n👥 Individual registrations for display:');
                pendingRegistrations.forEach((reg, i) => {
                    console.log(`${i + 1}. ${reg.role === 'college' ? '🏫' : '👑'} ${reg.name} (${reg.email}) - ${reg.role}`);
                });
                
                // Check if any college registrations exist (for college approval section)
                const colleges = pendingRegistrations.filter(r => r.role === 'college');
                if (colleges.length > 0) {
                    console.log('\n🏫 College Approval Section should show:');
                    colleges.forEach((college, i) => {
                        console.log(`${i + 1}. ${college.name} - ${college.email}`);
                    });
                } else {
                    console.log('\n⚠️ No college registrations - College approval section should be hidden');
                }
                
                return {
                    success: true,
                    pendingRegistrations,
                    stats: null // stats fetch failed, but that's ok
                };
            } else {
                console.error('❌ Invalid data structure - pendingRegistrations not array');
                return {
                    success: false,
                    error: 'Invalid response format'
                };
            }
        } else {
            const errorText = await pendingResponse.text();
            console.error('❌ Pending registrations API failed:', errorText);
            return {
                success: false,
                error: `API failed: ${pendingResponse.status}`
            };
        }
        
    } catch (error) {
        console.error('💥 Critical error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

// Run the test
console.log('🚀 Starting React Frontend Simulation...');
testReactAdminDashboard().then(result => {
    console.log('\n🏁 Test completed:', result);
    if (result.success) {
        console.log('\n✅ CONCLUSION: API is working correctly!');
        console.log('🔍 If React frontend is not showing pending users, the issue is:');
        console.log('   1. React state update not triggering re-render');
        console.log('   2. Component conditional rendering logic');
        console.log('   3. Authentication token not being passed correctly');
        console.log('   4. Frontend environment variable issues');
    } else {
        console.log('\n❌ CONCLUSION: API has issues that need fixing');
    }
});