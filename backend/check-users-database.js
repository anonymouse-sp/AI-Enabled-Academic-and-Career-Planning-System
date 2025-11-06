const mongoose = require('mongoose');
const College = require('./models/College');

// Database connection - try both database names
const databases = ['mongodb://localhost:27017/ai-career-planning', 'mongodb://localhost:27017/college-finder'];

async function deleteStaticColleges() {
  let connected = false;
  
  for (const dbUrl of databases) {
    try {
      console.log(`� Trying to connect to: ${dbUrl}`);
      await mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      console.log('✅ Connected to MongoDB successfully!');
      connected = true;
      break;
    } catch (error) {
      console.log(`❌ Failed to connect to ${dbUrl}`);
      console.log('Error:', error.message);
    }
  }
  
  if (!connected) {
    console.log('❌ Could not connect to any database');
    return;
  }

  try {
    // First, let's see what static colleges exist
    const colleges = await College.find({});
    console.log(`\n📊 Found ${colleges.length} static colleges:`);
    
    if (colleges.length > 0) {
      colleges.forEach((college, index) => {
        console.log(`${index + 1}. ${college.name} - ${college.location.city}, ${college.location.state}`);
      });

      // Delete all static colleges
      const result = await College.deleteMany({});
      console.log(`\n�️ Deleted ${result.deletedCount} static colleges from the database`);
      console.log('✅ Static colleges deletion completed successfully!');
    } else {
      console.log('\n⚠️ No static colleges found to delete');
    }
    
  } catch (error) {
    console.error('❌ Error deleting colleges:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

deleteStaticColleges();