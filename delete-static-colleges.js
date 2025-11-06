require('dotenv').config();
const College = require('./backend/models/College');
const connectDB = require('./backend/config/database');

async function deleteStaticColleges() {
    try {
        // Connect to MongoDB using the backend configuration
        await connectDB();
        console.log('Connected to MongoDB');

        // First, let's see what static colleges exist
        const colleges = await College.find({});
        console.log(`\nFound ${colleges.length} static colleges:`);
        colleges.forEach((college, index) => {
            console.log(`${index + 1}. ${college.name} - ${college.location.city}, ${college.location.state}`);
        });

        if (colleges.length > 0) {
            // Delete all static colleges
            const result = await College.deleteMany({});
            console.log(`\nDeleted ${result.deletedCount} static colleges from the database`);
        } else {
            console.log('\nNo static colleges found to delete');
        }

        console.log('Static colleges deletion completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

deleteStaticColleges();