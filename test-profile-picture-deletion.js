// Test script to verify profile picture deletion behavior
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000';
const TEST_EMAIL = 'test@student.com';
const TEST_PASSWORD = 'password123';

// Test student profile picture deletion and save
async function testStudentProfilePictureHandling() {
  try {
    console.log('🧪 Testing Student Profile Picture Deletion and Save...\n');
    
    // Step 1: Login as student
    console.log('1. Logging in as student...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');
    
    // Step 2: Get current profile
    console.log('2. Fetching current profile...');
    const profileResponse = await axios.get(`${API_URL}/api/student/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const currentProfile = profileResponse.data;
    console.log('Current profilePicture:', currentProfile.profilePicture);
    console.log('✅ Profile fetched\n');
    
    // Step 3: Delete profile picture (if exists)
    if (currentProfile.profilePicture) {
      console.log('3. Deleting profile picture...');
      await axios.delete(`${API_URL}/api/student/profile-picture`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Profile picture deleted\n');
    } else {
      console.log('3. No profile picture to delete\n');
    }
    
    // Step 4: Update profile data and save
    console.log('4. Saving profile with updated data...');
    const updatedProfileData = {
      ...currentProfile,
      profilePicture: null, // Explicitly set to null
      careerGoals: 'Updated career goals - test'
    };
    
    const saveResponse = await axios.put(`${API_URL}/api/student/profile`, updatedProfileData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Profile saved successfully\n');
    
    // Step 5: Verify profile picture is still null after save
    console.log('5. Verifying profile picture is null after save...');
    const verifyResponse = await axios.get(`${API_URL}/api/student/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const verifiedProfile = verifyResponse.data;
    console.log('ProfilePicture after save:', verifiedProfile.profilePicture);
    console.log('ProfilePictureUrl after save:', verifiedProfile.profilePictureUrl);
    
    if (verifiedProfile.profilePicture === null || verifiedProfile.profilePicture === undefined) {
      console.log('✅ SUCCESS: Profile picture is properly null after save');
    } else {
      console.log('❌ FAILURE: Profile picture was not properly cleared');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testStudentProfilePictureHandling();