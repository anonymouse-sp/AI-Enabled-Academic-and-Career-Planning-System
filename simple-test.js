// Simple test
const test = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/admin/pending-registrations', {
      headers: { 'Authorization': 'Bearer test' }
    });
    console.log('Server responding:', response.status);
  } catch (error) {
    console.log('Server not responding:', error.message);
  }
};
test();