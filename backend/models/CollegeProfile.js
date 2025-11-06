const mongoose = require('mongoose');

const collegeProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Basic Information
  collegeName: {
    type: String,
    required: [true, 'College name is required'],
    trim: true,
    maxlength: [100, 'College name cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Location Details
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^\d{6}$/, 'Please provide a valid 6-digit pincode']
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  
  // Contact Information
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\+?[1-9]\d{9,14}$/, 'Please provide a valid phone number']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please provide a valid website URL']
    }
  },
  
  // Institution Details
  establishedYear: {
    type: Number,
    min: [1800, 'Established year must be after 1800'],
    max: [new Date().getFullYear(), 'Established year cannot be in the future']
  },
  
  affiliatedTo: {
    type: String,
    trim: true
  },
  
  type: {
    type: String,
    enum: ['Government', 'Private', 'Autonomous', 'Deemed', 'Central University', 'State University'],
    required: [true, 'College type is required']
  },
  
  // Courses Offered
  courses: [{
    name: {
      type: String,
      required: true
    },
    degree: {
      type: String,
      required: true,
      enum: ['Certificate', 'Diploma', 'B.Tech', 'B.E', 'B.Sc', 'B.Com', 'B.A', 'M.Tech', 'M.E', 'M.Sc', 'M.Com', 'M.A', 'MBA', 'MCA', 'Ph.D', 'Other']
    },
    duration: {
      type: String,
      required: true
    },
    seats: {
      type: Number,
      min: [1, 'Seats must be at least 1']
    },
    eligibility: {
      type: String
    }
  }],
  
  // Fee Structure
  fees: {
    tuition: {
      type: Number,
      default: 0,
      min: [0, 'Fee cannot be negative']
    },
    accommodation: {
      type: Number,
      default: 0,
      min: [0, 'Fee cannot be negative']
    },
    other: {
      type: Number,
      default: 0,
      min: [0, 'Fee cannot be negative']
    }
  },
  
  // Facilities
  facilities: [{
    type: String,
    enum: [
      'Library', 'Laboratory', 'Sports Complex', 'Gym', 'Swimming Pool', 
      'Hostel', 'Cafeteria', 'Medical Center', 'Wi-Fi Campus', 'Auditorium',
      'Computer Center', 'Placement Cell', 'Research Center', 'Transportation',
      'Banking', 'ATM', 'Parking', 'Security', 'Canteen', 'Guest House'
    ]
  }],
  
  // Placement Information
  placements: {
    averagePackage: {
      type: Number,
      min: [0, 'Package cannot be negative']
    },
    highestPackage: {
      type: Number,
      min: [0, 'Package cannot be negative']
    },
    placementRate: {
      type: Number,
      min: [0, 'Placement rate cannot be negative'],
      max: [100, 'Placement rate cannot exceed 100%']
    },
    topRecruiters: [String]
  },
  
  // Rankings and Accreditation
  rankings: {
    national: {
      type: Number,
      min: [1, 'Ranking must be positive']
    },
    international: {
      type: Number,
      min: [1, 'Ranking must be positive']
    }
  },
  
  accreditation: [{
    body: String, // e.g., "NAAC", "NBA"
    grade: String, // e.g., "A++", "Gold"
    validUntil: Date
  }],
  
  // Media
  images: [{
    url: String,
    caption: String,
    type: {
      type: String,
      enum: ['campus', 'infrastructure', 'facilities', 'events', 'other'],
      default: 'campus'
    }
  }],
  
  // Campus Gallery - Dedicated field for infrastructure display
  campusGallery: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      default: ''
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    filename: {
      type: String,
      required: true
    }
  }],
  
  logo: {
    type: String
  },
  
  profilePicture: {
    type: String
  },
  
  // Status
  isVerified: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Social Media
  socialMedia: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String,
    youtube: String
  }
}, {
  timestamps: true
});

// Create text index for search functionality
collegeProfileSchema.index({
  collegeName: 'text',
  'location.city': 'text',
  'location.state': 'text',
  'courses.name': 'text',
  description: 'text'
});

// Other indexes for performance
collegeProfileSchema.index({ 'location.city': 1 });
collegeProfileSchema.index({ 'location.state': 1 });
collegeProfileSchema.index({ 'courses.name': 1 });
collegeProfileSchema.index({ 'fees.tuition': 1 });
collegeProfileSchema.index({ 'placements.placementRate': -1 });
collegeProfileSchema.index({ isActive: 1 });
collegeProfileSchema.index({ isVerified: 1 });

// Virtual for total fees
collegeProfileSchema.virtual('totalFees').get(function() {
  return this.fees.tuition + this.fees.accommodation + this.fees.other;
});

// Method to calculate profile completion percentage with weighted scoring
collegeProfileSchema.methods.calculateCompletionPercentage = function() {
  let completedFields = 0;
  let totalFields = 0;
  let weightedScore = 0;
  let totalWeight = 0;
  
  console.log('Calculating completion for profile:', this.collegeName || 'Unnamed College');
  
  // Helper function to check if a field is properly filled
  const isFieldComplete = (field, minLength = 1) => {
    if (typeof field === 'string') {
      return field && field.trim().length >= minLength;
    }
    if (typeof field === 'number') {
      return field && field > 0;
    }
    if (Array.isArray(field)) {
      return field && field.length > 0;
    }
    return !!field;
  };
  
  // CRITICAL FIELDS (Weight: 3) - Essential for college visibility
  const criticalFields = [
    { field: this.collegeName, name: 'College Name' },
    { field: this.description, name: 'Description', minLength: 50 },
    { field: this.type, name: 'College Type' },
    { field: this.location?.city, name: 'City' },
    { field: this.location?.state, name: 'State' },
    { field: this.contact?.phone, name: 'Phone' },
    { field: this.contact?.email, name: 'Email' },
    { field: this.courses?.length > 0, name: 'Courses' }
  ];
  
  criticalFields.forEach(({ field, name, minLength }) => {
    totalFields++;
    totalWeight += 3;
    if (isFieldComplete(field, minLength)) {
      completedFields++;
      weightedScore += 3;
      console.log(`✅ CRITICAL - ${name}: Complete`);
    } else {
      console.log(`❌ CRITICAL - ${name}: Missing`);
    }
  });
  
  // IMPORTANT FIELDS (Weight: 2) - Significant for student decisions
  const importantFields = [
    { field: this.establishedYear, name: 'Established Year' },
    { field: this.location?.address, name: 'Address', minLength: 10 },
    { field: this.location?.pincode, name: 'Pincode' },
    { field: this.fees?.tuition, name: 'Tuition Fee' },
    { field: this.facilities?.length > 0, name: 'Facilities' },
    { field: this.placements?.averagePackage, name: 'Average Package' },
    { field: this.placements?.placementRate, name: 'Placement Rate' },
    { field: this.rankings?.national, name: 'NIRF Ranking' }
  ];
  
  importantFields.forEach(({ field, name, minLength }) => {
    totalFields++;
    totalWeight += 2;
    if (isFieldComplete(field, minLength)) {
      completedFields++;
      weightedScore += 2;
      console.log(`✅ IMPORTANT - ${name}: Complete`);
    } else {
      console.log(`⚠️ IMPORTANT - ${name}: Missing`);
    }
  });
  
  // OPTIONAL FIELDS (Weight: 1) - Nice to have but not critical
  const optionalFields = [
    { field: this.affiliatedTo, name: 'Affiliated To' },
    { field: this.contact?.website, name: 'Website' },
    { field: this.fees?.accommodation, name: 'Accommodation Fee' },
    { field: this.fees?.other, name: 'Other Fees' },
    { field: this.placements?.highestPackage, name: 'Highest Package' },
    { field: this.placements?.topRecruiters?.length > 0, name: 'Top Recruiters' },
    { field: this.socialMedia?.facebook, name: 'Facebook' },
    { field: this.socialMedia?.twitter, name: 'X (Twitter)' },
    { field: this.socialMedia?.linkedin, name: 'LinkedIn' },
    { field: this.socialMedia?.instagram, name: 'Instagram' },
    { field: this.socialMedia?.youtube, name: 'YouTube' },
    { field: this.profilePicture, name: 'Profile Picture' },
    { field: this.campusGallery?.length > 0, name: 'Campus Gallery' }
  ];
  
  optionalFields.forEach(({ field, name, minLength }) => {
    totalFields++;
    totalWeight += 1;
    if (isFieldComplete(field, minLength)) {
      completedFields++;
      weightedScore += 1;
      console.log(`✅ OPTIONAL - ${name}: Complete`);
    } else {
      console.log(`⚪ OPTIONAL - ${name}: Missing`);
    }
  });
  
  // Calculate both simple and weighted percentages
  const simplePercentage = Math.round((completedFields / totalFields) * 100);
  const weightedPercentage = Math.round((weightedScore / totalWeight) * 100);
  
  // Use weighted percentage as it better reflects profile quality
  const finalPercentage = weightedPercentage;
  
  console.log(`Profile completion summary:`);
  console.log(`- Simple: ${completedFields}/${totalFields} fields = ${simplePercentage}%`);
  console.log(`- Weighted: ${weightedScore}/${totalWeight} points = ${weightedPercentage}%`);
  console.log(`- Final Score: ${finalPercentage}%`);
  
  // Provide completion guidance
  if (finalPercentage < 50) {
    console.log('🔴 Profile Status: Incomplete - Focus on critical fields first');
  } else if (finalPercentage < 80) {
    console.log('🟡 Profile Status: Good - Add important fields to improve visibility');
  } else if (finalPercentage < 95) {
    console.log('🟢 Profile Status: Excellent - Add optional fields for complete profile');
  } else {
    console.log('🌟 Profile Status: Outstanding - Profile is comprehensive!');
  }
  
  return finalPercentage;
};

// Ensure virtual fields are serialized
collegeProfileSchema.set('toJSON', { virtuals: true });

const CollegeProfile = mongoose.model('CollegeProfile', collegeProfileSchema);

module.exports = CollegeProfile;