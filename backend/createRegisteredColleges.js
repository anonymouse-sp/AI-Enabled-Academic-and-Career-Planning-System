const mongoose = require('mongoose');
const User = require('./models/User');
const CollegeProfile = require('./models/CollegeProfile');
require('dotenv').config();

async function createRegisteredColleges() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Create test college users
    const collegeUsers = [
      {
        name: 'Indian Institute of Technology Delhi',
        email: 'admin@iitd.ac.in',
        password: 'college123',
        role: 'college',
        status: 'approved'
      },
      {
        name: 'Delhi University',
        email: 'admin@du.ac.in', 
        password: 'college123',
        role: 'college',
        status: 'approved'
      },
      {
        name: 'Jawaharlal Nehru University',
        email: 'admin@jnu.ac.in',
        password: 'college123',
        role: 'college',
        status: 'approved'
      },
      {
        name: 'National Institute of Technology Delhi',
        email: 'admin@nitd.ac.in',
        password: 'college123',
        role: 'college',
        status: 'approved'
      },
      {
        name: 'Indraprastha University',
        email: 'admin@ipu.ac.in',
        password: 'college123',
        role: 'college',
        status: 'approved'
      }
    ];
    
    console.log('Creating college users...');
    const createdUsers = [];
    
    for (const userData of collegeUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        createdUsers.push(user);
        console.log('✅ Created user:', userData.name);
      } else {
        createdUsers.push(existingUser);
        console.log('⚠️ User already exists:', userData.name);
      }
    }
    
    // Create college profiles
    const collegeProfilesData = [
      {
        collegeName: 'Indian Institute of Technology Delhi',
        description: 'Premier engineering and technology institute in India, known for excellence in research and education.',
        location: {
          address: 'Hauz Khas',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110016',
          country: 'India'
        },
        contact: {
          phone: '911126591785',
          email: 'admin@iitd.ac.in',
          website: 'https://home.iitd.ac.in'
        },
        establishedYear: 1961,
        type: 'Autonomous',
        courses: [
          { name: 'Computer Science and Engineering', degree: 'B.Tech', duration: '4 years', seats: 120 },
          { name: 'Electrical Engineering', degree: 'B.Tech', duration: '4 years', seats: 100 },
          { name: 'Mechanical Engineering', degree: 'B.Tech', duration: '4 years', seats: 110 }
        ],
        fees: {
          tuition: 200000,
          accommodation: 15000,
          other: 35000
        },
        facilities: ['Library', 'Laboratory', 'Sports Complex', 'Wi-Fi Campus', 'Hostel', 'Medical Center'],
        placements: {
          averagePackage: 1800000,
          highestPackage: 5000000,
          placementRate: 95,
          topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs']
        },
        rankings: {
          national: 2,
          international: 45
        },
        isVerified: true,
        isActive: true
      },
      {
        collegeName: 'Delhi University',
        description: 'One of India\'s premier universities offering diverse undergraduate and postgraduate programs.',
        location: {
          address: 'Vice-Regal Lodge, University of Delhi',
          city: 'New Delhi', 
          state: 'Delhi',
          pincode: '110007',
          country: 'India'
        },
        contact: {
          phone: '911127667090',
          email: 'admin@du.ac.in',
          website: 'https://www.du.ac.in'
        },
        establishedYear: 1922,
        type: 'Central University',
        courses: [
          { name: 'Bachelor of Arts', degree: 'B.A', duration: '3 years', seats: 500 },
          { name: 'Bachelor of Science', degree: 'B.Sc', duration: '3 years', seats: 300 },
          { name: 'Bachelor of Commerce', degree: 'B.Com', duration: '3 years', seats: 400 }
        ],
        fees: {
          tuition: 50000,
          accommodation: 25000,
          other: 15000
        },
        facilities: ['Library', 'Sports Complex', 'Cafeteria', 'Wi-Fi Campus', 'Auditorium', 'Computer Center'],
        placements: {
          averagePackage: 600000,
          highestPackage: 1500000,
          placementRate: 75,
          topRecruiters: ['TCS', 'Infosys', 'HDFC Bank', 'Wipro']
        },
        rankings: {
          national: 12,
          international: 150
        },
        isVerified: true,
        isActive: true
      },
      {
        collegeName: 'Jawaharlal Nehru University',
        description: 'Leading research university known for social sciences, languages, and international studies.',
        location: {
          address: 'New Mehrauli Road',
          city: 'New Delhi',
          state: 'Delhi', 
          pincode: '110067',
          country: 'India'
        },
        contact: {
          phone: '911126704016',
          email: 'admin@jnu.ac.in',
          website: 'https://www.jnu.ac.in'
        },
        establishedYear: 1969,
        type: 'Central University',
        courses: [
          { name: 'International Relations', degree: 'M.A', duration: '2 years', seats: 50 },
          { name: 'Economics', degree: 'M.A', duration: '2 years', seats: 60 },
          { name: 'Political Science', degree: 'Ph.D', duration: '3-5 years', seats: 30 }
        ],
        fees: {
          tuition: 40000,
          accommodation: 12000,
          other: 8000
        },
        facilities: ['Library', 'Research Center', 'Hostel', 'Wi-Fi Campus', 'Guest House', 'Medical Center'],
        placements: {
          averagePackage: 800000,
          highestPackage: 2000000,
          placementRate: 85,
          topRecruiters: ['UN', 'World Bank', 'IAS', 'Foreign Service']
        },
        rankings: {
          national: 8,
          international: 120
        },
        isVerified: true,
        isActive: true
      },
      {
        collegeName: 'National Institute of Technology Delhi',
        description: 'Leading technical institute offering undergraduate and postgraduate programs in engineering and technology.',
        location: {
          address: 'A-7, Institutional Area, Sector 62',
          city: 'Noida',
          state: 'Uttar Pradesh',
          pincode: '201309',
          country: 'India'
        },
        contact: {
          phone: '911202401000',
          email: 'admin@nitd.ac.in',
          website: 'https://www.nitdelhi.ac.in'
        },
        establishedYear: 2010,
        type: 'Autonomous',
        courses: [
          { name: 'Computer Science and Engineering', degree: 'B.Tech', duration: '4 years', seats: 80 },
          { name: 'Electronics and Communication', degree: 'B.Tech', duration: '4 years', seats: 60 },
          { name: 'Civil Engineering', degree: 'B.Tech', duration: '4 years', seats: 50 }
        ],
        fees: {
          tuition: 150000,
          accommodation: 20000,
          other: 25000
        },
        facilities: ['Library', 'Laboratory', 'Sports Complex', 'Wi-Fi Campus', 'Hostel', 'Cafeteria'],
        placements: {
          averagePackage: 1200000,
          highestPackage: 3500000,
          placementRate: 88,
          topRecruiters: ['Adobe', 'Samsung', 'Oracle', 'Deloitte']
        },
        rankings: {
          national: 25,
          international: 200
        },
        isVerified: true,
        isActive: true
      },
      {
        collegeName: 'Indraprastha University',
        description: 'State university offering professional courses in engineering, management, law, and medicine.',
        location: {
          address: 'Sector 16C, Dwarka',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110078',
          country: 'India'
        },
        contact: {
          phone: '911125342208',
          email: 'admin@ipu.ac.in',
          website: 'http://www.ipu.ac.in'
        },
        establishedYear: 1998,
        type: 'State University',
        courses: [
          { name: 'Information Technology', degree: 'B.Tech', duration: '4 years', seats: 200 },
          { name: 'Business Administration', degree: 'MBA', duration: '2 years', seats: 120 },
          { name: 'Law', degree: 'Other', duration: '3 years', seats: 150 }
        ],
        fees: {
          tuition: 80000,
          accommodation: 30000,
          other: 20000
        },
        facilities: ['Library', 'Computer Center', 'Sports Complex', 'Wi-Fi Campus', 'Medical Center', 'Auditorium'],
        placements: {
          averagePackage: 500000,
          highestPackage: 1200000,
          placementRate: 70,
          topRecruiters: ['Accenture', 'IBM', 'Tech Mahindra', 'HCL']
        },
        rankings: {
          national: 35,
          international: 300
        },
        isVerified: true,
        isActive: true
      }
    ];
    
    console.log('\nCreating college profiles...');
    for (let i = 0; i < collegeProfilesData.length; i++) {
      const profileData = collegeProfilesData[i];
      const user = createdUsers[i];
      
      // Check if profile already exists
      const existingProfile = await CollegeProfile.findOne({ userId: user._id });
      if (!existingProfile) {
        const profile = new CollegeProfile({
          ...profileData,
          userId: user._id
        });
        await profile.save();
        console.log('✅ Created profile:', profileData.collegeName);
      } else {
        console.log('⚠️ Profile already exists:', profileData.collegeName);
      }
    }
    
    // Verify the data
    const totalProfiles = await CollegeProfile.countDocuments();
    console.log(`\n📊 Total college profiles in database: ${totalProfiles}`);
    
    // List all active college profiles
    const activeProfiles = await CollegeProfile.find({ isActive: true })
      .populate('userId', 'name email')
      .select('collegeName location.city establishedYear type');
    
    console.log('\n📋 Active College Profiles:');
    activeProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.collegeName} (${profile.location.city}) - ${profile.type}`);
    });
    
    await mongoose.connection.close();
    console.log('\n✅ Test colleges created successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

createRegisteredColleges();