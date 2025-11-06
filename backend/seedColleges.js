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
      country: "India"
    },
    establishedYear: 1958,
    affiliatedTo: "Autonomous Institution",
    courses: [
      {
        name: "Computer Science and Engineering",
        degree: "B.Tech",
        duration: "4 years"
      },
      {
        name: "Mechanical Engineering",
        degree: "B.Tech",
        duration: "4 years"
      }
    ],
    fees: {
      tuition: 215000,
      accommodation: 18000,
      other: 42000
    },
    placements: {
      averagePackage: 2100000,
      highestPackage: 5500000,
      placementRate: 98,
      topRecruiters: ["Google", "Microsoft", "Goldman Sachs", "McKinsey"]
    },
    facilities: ["Library", "Sports Complex", "Laboratory", "Wi-Fi Campus", "Hostel", "Medical Center", "Gym"],
    rankings: {
      national: 1,
      international: 40
    },
    description: "Leading engineering institute known for innovation, research excellence and outstanding placements."
  },
  {
    name: "Delhi University",
    type: "Government",
    location: {
      city: "New Delhi",
      state: "Delhi",
      country: "India"
    },
    establishedYear: 1922,
    affiliatedTo: "Central University",
    courses: [
      {
        name: "English Honors",
        degree: "B.A",
        duration: "3 years"
      },
      {
        name: "Economics Honors",
        degree: "B.A",
        duration: "3 years"
      }
    ],
    fees: {
      tuition: 15000,
      accommodation: 8000,
      other: 18000
    },
    placements: {
      averagePackage: 800000,
      highestPackage: 2500000,
      placementRate: 75,
      topRecruiters: ["TCS", "Infosys", "Wipro", "Deloitte"]
    },
    facilities: ["Library", "Sports Complex", "Cafeteria", "Wi-Fi Campus", "Auditorium"],
    rankings: {
      national: 12,
      international: 200
    },
    description: "One of the premier central universities in India with diverse academic programs and strong alumni network."
  },
  {
    name: "Jawaharlal Nehru University",
    type: "Government",
    location: {
      city: "New Delhi",
      state: "Delhi",
      country: "India"
    },
    establishedYear: 1969,
    affiliatedTo: "Central University",
    courses: [
      {
        name: "International Relations",
        degree: "M.A",
        duration: "2 years"
      },
      {
        name: "Computer Science",
        degree: "M.Sc",
        duration: "2 years"
      }
    ],
    fees: {
      tuition: 20000,
      accommodation: 5000,
      other: 17000
    },
    placements: {
      averagePackage: 900000,
      highestPackage: 2800000,
      placementRate: 70,
      topRecruiters: ["UN", "Ministry of External Affairs", "Research Organizations", "NGOs"]
    },
    facilities: ["Library", "Sports Complex", "Wi-Fi Campus", "Hostel", "Medical Center"],
    rankings: {
      national: 18,
      international: 350
    },
    description: "Renowned for social sciences, international studies and research with a vibrant campus life."
  },
  {
    name: "Manipal Institute of Technology",
    type: "Private",
    location: {
      city: "Manipal",
      state: "Karnataka",
      country: "India"
    },
    establishedYear: 1957,
    affiliatedTo: "Manipal Academy of Higher Education",
    courses: [
      {
        name: "Information Technology",
        degree: "B.Tech",
        duration: "4 years"
      },
      {
        name: "Biotechnology",
        degree: "B.Tech",
        duration: "4 years"
      }
    ],
    fees: {
      tuition: 350000,
      accommodation: 25000,
      other: 50000
    },
    placements: {
      averagePackage: 1200000,
      highestPackage: 4500000,
      placementRate: 88,
      topRecruiters: ["Amazon", "Microsoft", "Accenture", "TCS"]
    },
    facilities: ["Library", "Sports Complex", "Laboratory", "Wi-Fi Campus", "Hostel", "Medical Center", "Cafeteria"],
    rankings: {
      national: 35,
      international: 500
    },
    description: "Leading private engineering institute with excellent infrastructure and industry connections."
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