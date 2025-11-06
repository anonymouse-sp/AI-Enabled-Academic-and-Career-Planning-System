const mongoose = require('mongoose');
const User = require('./models/User');

async function checkPendingRegistrations() {
  try {
    await mongoose.connect('mongodb://localhost:27017/college-finder', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('📋 Checking pending registrations...\n');
    
    const pendingUsers = await User.find({ status: 'pending' }).select('name email role createdAt');
    
    if (pendingUsers.length === 0) {
      console.log('❌ No pending registrations found.');
      console.log('\n💡 This might be why admin cannot approve anything - there are no pending requests!');
      console.log('\n🔧 To test admin approval functionality:');
      console.log('1. Register a new college or admin user (don\'t login yet)');
      console.log('2. Then try to approve the registration as admin');
    } else {
      console.log(`✅ Found ${pendingUsers.length} pending registrations:`);
      pendingUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - Created: ${user.createdAt.toLocaleDateString()}`);
      });
      console.log('\n✅ There are pending registrations available for admin approval!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkPendingRegistrations();