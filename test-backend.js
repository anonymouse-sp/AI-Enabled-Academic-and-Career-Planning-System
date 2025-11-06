// Simple test to check backend availability
async function checkBackend() {
    try {
        // Test basic connectivity
        const response = await fetch('http://localhost:5000/api');
        console.log('API base response status:', response.status);
        
        if (response.ok) {
            const data = await response.text();
            console.log('API response:', data);
        }
        
        // Test auth endpoint specifically
        const authResponse = await fetch('http://localhost:5000/api/auth');
        console.log('Auth endpoint status:', authResponse.status);
        
    } catch (error) {
        console.error('Connection error:', error.message);
    }
}

checkBackend();