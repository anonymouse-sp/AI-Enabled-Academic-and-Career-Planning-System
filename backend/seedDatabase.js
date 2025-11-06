require('dotenv').config();

const mongoose = require('mongoose');
const College = require('./models/College');
const connectDB = require('./config/database');

const sampleColleges = [
  {
    name: "Indian Institute of Technology Delhi",
    type: "Autonomous",
    location: {
      city: "New Delhi",
      state: "Delhi",
      country: "India"
    },
    establishedYear: 1961,
    affiliatedTo: "Autonomous Institution",
    courses: [
      {
        name: "Computer Science and Engineering",
        degree: "B.Tech",
        duration: "4 years"
      },
      {
        name: "Electrical Engineering",
        degree: "B.Tech", 
        duration: "4 years"
      }
    ],
    fees: {
      tuition: 200000,
      accommodation: 15000,
      other: 35000
    },
    placements: {
      averagePackage: 1800000,
      highestPackage: 5000000,
      placementRate: 95,
      topRecruiters: ["Google", "Microsoft", "Amazon", "Goldman Sachs"]
    },
    facilities: ["Library", "Sports Complex", "Laboratory", "Wi-Fi Campus", "Hostel", "Medical Center"],
    rankings: {
      national: 2,
      international: 45
    },
    description: "Premier engineering and technology institute in India, known for excellence in research and education."
  },
  {
    name: "Indian Institute of Technology Bombay",
    type: "Autonomous",
    location: {
      city: "Mumbai",
      state: "Maharashtra", 
      country: "India",
      pincode: "400076"
    },
    establishedYear: 1958,
    affiliation: "Autonomous",
    courses: [
      {
        name: "Computer Science and Engineering",
        degree: "B.Tech",
        duration: 4,
        fees: {
          tuition: 215000,
          hostel: 18000,
          mess: 30000,
          other: 12000
        }
      },
      {
        name: "Mechanical Engineering",
        degree: "B.Tech",
        duration: 4,
        fees: {
          tuition: 215000,
          hostel: 18000,
          mess: 30000,
          other: 12000
        }
      }
    ],
    placements: {
      averagePackage: 2100000,
      highestPackage: 5500000,
      placementPercentage: 98,
      topRecruiters: ["Google", "Microsoft", "Goldman Sachs", "McKinsey"]
    },
    infrastructure: {
      totalArea: "550 acres",
      hostels: 16,
      libraries: 4,
      laboratories: 65,
      sportsComplex: true,
      medicalFacility: true
    },
    ratings: {
      overall: 4.9,
      academics: 4.9,
      infrastructure: 4.8,
      placements: 5.0,
      faculty: 4.8
    },
    contact: {
      phone: "+91-22-2572-2545",
      email: "registrar@iitb.ac.in",
      website: "https://www.iitb.ac.in"
    }
  },
  {
    name: "Indian Institute of Science Bangalore",
    type: "Research",
    location: {
      city: "Bangalore",
      state: "Karnataka",
      country: "India", 
      pincode: "560012"
    },
    establishedYear: 1909,
    affiliation: "Deemed University",
    courses: [
      {
        name: "Physics",
        degree: "M.Sc",
        duration: 2,
        fees: {
          tuition: 25000,
          hostel: 12000,
          mess: 20000,
          other: 5000
        }
      },
      {
        name: "Computer Science",
        degree: "M.Tech",
        duration: 2,
        fees: {
          tuition: 50000,
          hostel: 12000,
          mess: 20000,
          other: 8000
        }
      }
    ],
    placements: {
      averagePackage: 2500000,
      highestPackage: 6000000,
      placementPercentage: 92,
      topRecruiters: ["Google Research", "Microsoft Research", "IBM Research", "Intel"]
    },
    infrastructure: {
      totalArea: "400 acres",
      hostels: 12,
      libraries: 2,
      laboratories: 80,
      sportsComplex: true,
      medicalFacility: true
    },
    ratings: {
      overall: 4.9,
      academics: 5.0,
      infrastructure: 4.6,
      placements: 4.7,
      faculty: 5.0
    },
    contact: {
      phone: "+91-80-2293-2001",
      email: "registrar@iisc.ac.in",
      website: "https://www.iisc.ac.in"
    }
  },
  {
    name: "Delhi University",
    type: "University",
    location: {
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      pincode: "110007"
    },
    establishedYear: 1922,
    affiliation: "Central University",
    courses: [
      {
        name: "English Honors",
        degree: "B.A",
        duration: 3,
        fees: {
          tuition: 15000,
          hostel: 8000,
          mess: 15000,
          other: 3000
        }
      },
      {
        name: "Economics Honors",
        degree: "B.A",
        duration: 3,
        fees: {
          tuition: 15000,
          hostel: 8000,
          mess: 15000,
          other: 3000
        }
      }
    ],
    placements: {
      averagePackage: 800000,
      highestPackage: 2500000,
      placementPercentage: 75,
      topRecruiters: ["TCS", "Infosys", "Wipro", "Deloitte"]
    },
    infrastructure: {
      totalArea: "69 acres",
      hostels: 8,
      libraries: 15,
      laboratories: 25,
      sportsComplex: true,
      medicalFacility: true
    },
    ratings: {
      overall: 4.2,
      academics: 4.5,
      infrastructure: 3.8,
      placements: 3.9,
      faculty: 4.3
    },
    contact: {
      phone: "+91-11-2766-7049",
      email: "registrar@du.ac.in",
      website: "https://www.du.ac.in"
    }
  },
  {
    name: "Jawaharlal Nehru University",
    type: "University",
    location: {
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      pincode: "110067"
    },
    establishedYear: 1969,
    affiliation: "Central University",
    courses: [
      {
        name: "International Relations",
        degree: "M.A",
        duration: 2,
        fees: {
          tuition: 20000,
          hostel: 5000,
          mess: 12000,
          other: 2000
        }
      },
      {
        name: "Computer Science",
        degree: "M.Sc",
        duration: 2,
        fees: {
          tuition: 25000,
          hostel: 5000,
          mess: 12000,
          other: 3000
        }
      }
    ],
    placements: {
      averagePackage: 900000,
      highestPackage: 2800000,
      placementPercentage: 70,
      topRecruiters: ["UN", "Ministry of External Affairs", "Research Organizations", "NGOs"]
    },
    infrastructure: {
      totalArea: "1000 acres",
      hostels: 18,
      libraries: 8,
      laboratories: 20,
      sportsComplex: true,
      medicalFacility: true
    },
    ratings: {
      overall: 4.3,
      academics: 4.6,
      infrastructure: 4.0,
      placements: 3.8,
      faculty: 4.7
    },
    contact: {
      phone: "+91-11-2670-4016",
      email: "registrar@mail.jnu.ac.in", 
      website: "https://www.jnu.ac.in"
    }
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    console.log('Connected to MongoDB. Starting database seeding...');
    
    // Clear existing colleges
    await College.deleteMany({});
    console.log('Cleared existing college data.');
    
    // NOTE: Static college seeding has been disabled as per admin request
    // The system now relies only on registered college profiles
    console.log('⚠️ Static college seeding disabled - system will use only registered college profiles');
    
    // Uncomment the lines below if you want to re-enable static college seeding:
    // const insertedColleges = await College.insertMany(sampleColleges);
    // console.log(`Successfully inserted ${insertedColleges.length} colleges.`);
    // insertedColleges.forEach((college, index) => {
    //   console.log(`${index + 1}. ${college.name} - ${college.location.city}, ${college.location.state}`);
    // });
    
    console.log('\nDatabase seeding completed successfully! (No static colleges added)');
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase();