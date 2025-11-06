// Fix admin user to ensure they have head admin privileges
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function fixAdminUser() {
  try {
    console.log('🔧 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-finder');
    
    console.log('🔍 Looking for admin user...');
    const adminUser = await User.findOne({ 
      email: 'admin@college-finder.com',
      role: 'admin'
    });
    
    if (adminUser) {
      console.log('📋 Current admin user details:');
      console.log(`  Name: ${adminUser.name}`);
      console.log(`  Email: ${adminUser.email}`);
      console.log(`  Role: ${adminUser.role}`);
      console.log(`  Status: ${adminUser.status}`);
      console.log(`  IsHeadAdmin: ${adminUser.isHeadAdmin}`);
      console.log(`  IsActive: ${adminUser.isActive}`);
      
      // Update admin to ensure they have all necessary privileges
      const updatedFields = {};
      
      if (!adminUser.isHeadAdmin) {
        updatedFields.isHeadAdmin = true;
        console.log('🔄 Setting isHeadAdmin to true');
      }
      
      if (adminUser.status !== 'approved') {
        updatedFields.status = 'approved';
        console.log('🔄 Setting status to approved');
      }
      
      if (!adminUser.isActive) {
        updatedFields.isActive = true;
        console.log('🔄 Setting isActive to true');
      }
      
      if (Object.keys(updatedFields).length > 0) {
        await User.findByIdAndUpdate(adminUser._id, updatedFields);
        console.log('✅ Admin user updated successfully');
        
        // Verify the update
        const verifyAdmin = await User.findById(adminUser._id);
        console.log('\n🔍 Verified admin user details after update:');
        console.log(`  IsHeadAdmin: ${verifyAdmin.isHeadAdmin}`);
        console.log(`  Status: ${verifyAdmin.status}`);
        console.log(`  IsActive: ${verifyAdmin.isActive}`);
      } else {
        console.log('✅ Admin user already has correct privileges');
      }
      
    } else {
      console.log('❌ Admin user not found, creating new head admin...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const headAdmin = new User({
        name: 'Head Admin',
        email: 'admin@college-finder.com',
        password: hashedPassword,
        role: 'admin',
        isHeadAdmin: true,
        status: 'approved',
        isActive: true
      });
      
      await headAdmin.save();
      console.log('✅ New head admin created successfully');
    }
    
    // Also check if there are any other admin users that need privileges
    const allAdmins = await User.find({ role: 'admin' });
    console.log(`\n📊 Total admin users found: ${allAdmins.length}`);
    
    allAdmins.forEach(admin => {
      console.log(`  - ${admin.name} (${admin.email}): HeadAdmin=${admin.isHeadAdmin}, Status=${admin.status}, Active=${admin.isActive}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Database operations completed');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAdminUser();