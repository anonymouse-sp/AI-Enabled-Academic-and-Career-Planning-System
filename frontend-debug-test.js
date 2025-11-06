// Frontend Debug Script - Test React Admin Dashboard API calls
const API_BASE = 'http://localhost:5000';

async function testReactFrontendAPI() {
    console.log('🔍 FRONTEND DEBUG - Testing React Admin Dashboard API Integration');
    console.log('==============================================================');
    
    // Step 1: Test admin login
    console.log('\n1️⃣ Testing Admin Login...');
    try {
        const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@college-finder.com',
                password: 'admin123',
                expectedRole: 'admin'
            })
        });
        
        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ Admin login successful:', loginData.user.name);
            
            const token = loginData.token;
            
            // Step 2: Test pending registrations API (same as React frontend would call)
            console.log('\n2️⃣ Testing Pending Registrations API (React Frontend style)...');
            const pendingResponse = await fetch(`${API_BASE}/api/admin/pending-registrations`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            
            console.log('📡 Response status:', pendingResponse.status);
            console.log('📡 Response headers:', Object.fromEntries(pendingResponse.headers.entries()));
            
            if (pendingResponse.ok) {
                const pendingData = await pendingResponse.json();
                console.log('✅ Pending registrations data structure:', pendingData);
                console.log('📊 Keys in response:', Object.keys(pendingData));
                
                if (pendingData.pendingRegistrations && Array.isArray(pendingData.pendingRegistrations)) {
                    console.log('📋 Pending registrations array:', pendingData.pendingRegistrations);
                    console.log('📊 Array length:', pendingData.pendingRegistrations.length);
                    
                    // Check each registration
                    pendingData.pendingRegistrations.forEach((reg, index) => {
                        console.log(`👤 Registration ${index + 1}:`, {
                            id: reg.id,
                            name: reg.name,
                            email: reg.email,
                            role: reg.role,
                            createdAt: reg.createdAt
                        });
                    });
                    
                    // Step 3: Test CORS and React-specific issues
                    console.log('\n3️⃣ Testing React Frontend Environment Compatibility...');
                    console.log('🌐 API Base URL:', API_BASE);
                    console.log('🔑 Token format:', token.substring(0, 20) + '...');
                    console.log('📊 Data ready for React state:', {
                        totalPending: pendingData.pendingRegistrations.length,
                        colleges: pendingData.pendingRegistrations.filter(r => r.role === 'college').length,
                        admins: pendingData.pendingRegistrations.filter(r => r.role === 'admin').length
                    });
                    
                } else {
                    console.error('❌ Invalid data structure - pendingRegistrations not found or not array');
                }
            } else {
                const errorText = await pendingResponse.text();
                console.error('❌ Pending registrations API failed:', errorText);
            }
            
        } else {
            const loginError = await loginResponse.text();
            console.error('❌ Admin login failed:', loginError);
        }
        
    } catch (error) {
        console.error('💥 Network error:', error);
    }
    
    console.log('\n🏁 Frontend debug test completed');
}

// Step 4: Test what React frontend sees
console.log('🚀 Starting React Frontend API Debug Test...');
testReactFrontendAPI();

// Also test environment variables (simulating React)
console.log('\n🔧 Simulated React Environment:');
console.log('VITE_API_URL equivalent:', 'http://localhost:5000');
console.log('Expected frontend URL:', 'http://localhost:5173');
console.log('Cross-origin request from 5173 to 5000:', 'Should work with CORS enabled');