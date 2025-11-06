// Check college count in database
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const CollegeProfile = require('./models/CollegeProfile');
const College = require('./models/College');

async function checkCollegeCount() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-finder');
        console.log('Connected to MongoDB');

        // Count CollegeProfile documents (what the API uses)
        const collegeProfileCount = await CollegeProfile.countDocuments();
        const activeCollegeProfileCount = await CollegeProfile.countDocuments({ isActive: true });
        
        // Count College documents (if any)
        const collegeCount = await College.countDocuments();
        
        console.log('=== College Count Summary ===');
        console.log(`Total CollegeProfile documents: ${collegeProfileCount}`);
        console.log(`Active CollegeProfile documents: ${activeCollegeProfileCount}`);
        console.log(`Total College documents: ${collegeCount}`);
        
        // Show first few colleges
        const colleges = await CollegeProfile.find().limit(5);
        console.log('\n=== Sample College Profiles ===');
        colleges.forEach((college, index) => {
            console.log(`${index + 1}. ${college.name} (Active: ${college.isActive})`);
        });
        
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
        
    } catch (error) {
        console.error('Error checking college count:', error);
    }
}

checkCollegeCount();