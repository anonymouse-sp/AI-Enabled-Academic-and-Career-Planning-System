// Check what colleges exist in the database
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const College = require('./models/College');
const CollegeProfile = require('./models/CollegeProfile');
const User = require('./models/User');

async function checkCollegeData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-finder');
        console.log('Connected to MongoDB');

        // Count different college-related collections
        const collegeCount = await College.countDocuments();
        const collegeProfileCount = await CollegeProfile.countDocuments();
        const collegeUserCount = await User.countDocuments({ role: 'college' });
        
        console.log('=== College Data Summary ===');
        console.log(`College collection count: ${collegeCount}`);
        console.log(`CollegeProfile collection count: ${collegeProfileCount}`);
        console.log(`Users with role 'college': ${collegeUserCount}`);

        // Show actual colleges in College collection
        console.log('\n=== Colleges in College Collection ===');
        const colleges = await College.find().limit(10);
        colleges.forEach((college, index) => {
            console.log(`${index + 1}. ${college.name} - ${college.location}`);
        });

        // Show college profiles
        console.log('\n=== College Profiles ===');
        const collegeProfiles = await CollegeProfile.find().limit(10);
        if (collegeProfiles.length > 0) {
            collegeProfiles.forEach((profile, index) => {
                console.log(`${index + 1}. ${profile.name} - Active: ${profile.isActive}`);
            });
        } else {
            console.log('No college profiles found');
        }

        // Show college users
        console.log('\n=== College Users ===');
        const collegeUsers = await User.find({ role: 'college' }).limit(10);
        collegeUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.email}) - Status: ${user.status || 'N/A'}`);
        });

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
        
    } catch (error) {
        console.error('Error checking college data:', error);
    }
}

checkCollegeData();