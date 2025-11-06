// Test health endpoint
async function testHealth() {
    try {
        const response = await fetch('http://localhost:5000/api/health');
        console.log('Health endpoint status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Health response:', data);
        } else {
            const errorText = await response.text();
            console.log('Health error:', errorText);
        }
    } catch (error) {
        console.error('Health check error:', error.message);
    }
}

testHealth();