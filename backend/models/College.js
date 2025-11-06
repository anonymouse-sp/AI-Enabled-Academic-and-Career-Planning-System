const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'College name is required'],
    trim: true,
    maxlength: [100, 'College name cannot exceed 100 characters']
  },
  
  location: {
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    country: {
      type: String,
      default: 'India'
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    }
  },
  
  courses: [{
    name: {
      type: String,
      required: true
    },
    duration: {
      type: String // e.g., "4 years", "2 years"
    },
    eligibility: {
      type: String
    },
    seats: {
      type: Number,
      min: [0, 'Seats cannot be negative']
    }
  }],
  
  fees: {
    tuition: {
      type: Number,
      required: [true, 'Tuition fee is required'],
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
    topRecruiters: [{
      type: String
    }]
  },
  
  infrastructure: {
    campus: {
      area: {
        type: Number, // in acres
        min: [0, 'Area cannot be negative']
      },
      description: String
    },
    library: {
      type: Boolean,
      default: false
    },
    sports: {
      type: Boolean,
      default: false
    },
    laboratory: {
      type: Boolean,
      default: false
    },
    cafeteria: {
      type: Boolean,
      default: false
    },
    wifi: {
      type: Boolean,
      default: false
    },
    hostel: {
      type: Boolean,
      default: false
    }
  },
  
  facilities: [{
    type: String,
    enum: [
      'Library', 'Sports Complex', 'Laboratory', 'Cafeteria',
      'Wi-Fi Campus', 'Hostel', 'Medical Center', 'Gym', 'Auditorium'
    ]
  }],
  
  rankings: {
    national: {
      type: Number,
      min: [1, 'Ranking must be a positive number']
    },
    international: {
      type: Number,
      min: [1, 'Ranking must be a positive number']
    }
  },
  
  admissionCriteria: {
    minScore: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100']
    },
    entranceExams: [{
      type: String
    }],
    requirements: [{
      type: String
    }]
  },
  
  contactInfo: {
    email: {
      type: String,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    phone: {
      type: String,
      match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please provide a valid website URL']
    },
    address: {
      type: String
    }
  },
  
  images: [{
    url: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  establishedYear: {
    type: Number,
    min: [1800, 'Established year seems too old'],
    max: [new Date().getFullYear(), 'Established year cannot be in the future']
  },
  
  type: {
    type: String,
    enum: ['Government', 'Private', 'Deemed', 'Autonomous'],
    default: 'Private'
  },
  
  affiliatedTo: {
    type: String // University name
  },
  
  accreditation: [{
    body: String, // e.g., "NAAC", "NBA"
    grade: String, // e.g., "A++", "Gold"
    validUntil: Date
  }],
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create text index for search functionality
collegeSchema.index({
  name: 'text',
  'location.city': 'text',
  'location.state': 'text',
  'courses.name': 'text'
});

// Create other indexes for better performance
collegeSchema.index({ 'location.city': 1 });
collegeSchema.index({ 'location.state': 1 });
collegeSchema.index({ 'courses.name': 1 });
collegeSchema.index({ 'fees.tuition': 1 });
collegeSchema.index({ 'placements.placementRate': -1 });
collegeSchema.index({ 'rankings.national': 1 });
collegeSchema.index({ isActive: 1 });

// Virtual for total fees
collegeSchema.virtual('totalFees').get(function() {
  return this.fees.tuition + this.fees.accommodation + this.fees.other;
});

// Ensure virtual fields are serialized
collegeSchema.set('toJSON', { virtuals: true });

const College = mongoose.model('College', collegeSchema);

module.exports = College;