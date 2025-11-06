const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Profile Picture
  profilePicture: {
    type: String, // This will store the filename/path of the uploaded image
    default: null
  },
  // Personal Information
  phone: {
    type: String,
    match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: {
      type: String,
      match: [/^\d{6}$/, 'Please provide a valid 6-digit pincode']
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  
  // Educational Background
  currentClass: {
    type: String
  },
  schoolName: {
    type: String
  },
  schoolBoard: {
    type: String,
    enum: ['CBSE', 'ICSE', 'State Board', 'IB', 'Other']
  },
  previousMarks: {
    class10: {
      type: Number,
      min: [0, 'Marks cannot be negative'],
      max: [100, 'Marks cannot exceed 100']
    },
    class12: {
      type: Number,
      min: [0, 'Marks cannot be negative'],
      max: [100, 'Marks cannot exceed 100']
    }
  },
  
  // Family Information
  fatherName: {
    type: String
  },
  motherName: {
    type: String
  },
  parentOccupation: {
    type: String
  },
  familyIncome: {
    type: String,
    enum: ['Below 2 Lakhs', '2-5 Lakhs', '5-10 Lakhs', '10-20 Lakhs', 'Above 20 Lakhs']
  },
  
  // Interests and Preferences
  interestedStreams: [{
    type: String,
    enum: [
      'Engineering', 'Medical', 'Commerce', 'Arts', 'Science', 'Law',
      'Management', 'Design', 'Architecture', 'Pharmacy', 'Agriculture',
      'Mass Communication', 'Hotel Management', 'Fashion Design'
    ]
  }],
  preferredLocation: [{
    type: String
  }],
  careerGoals: {
    type: String,
    maxlength: [500, 'Career goals cannot exceed 500 characters']
  },
  hobbies: [{
    type: String,
    enum: [
      'Reading', 'Sports', 'Music', 'Dance', 'Art', 'Photography',
      'Coding', 'Gaming', 'Traveling', 'Cooking', 'Writing', 'Debate'
    ]
  }],
  
  // Additional Information
  achievements: [{
    title: String,
    description: String,
    date: Date
  }],
  extracurricularActivities: [{
    activity: String,
    role: String,
    duration: String
  }],
  
  // Career Quiz Results
  careerQuizResults: {
    lastTaken: {
      type: Date
    },
    recommendations: [{
      stream: String,
      streamName: String,
      percentage: Number,
      reason: String,
      suggestedCourses: [String],
      careerPaths: [String]
    }],
    topRecommendation: {
      stream: String,
      percentage: Number
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizResponse'
    }
  }
}, {
  timestamps: true
});

// Method to calculate profile completion percentage
studentProfileSchema.methods.calculateCompletionPercentage = function() {
  // Define all the fields that contribute to profile completion
  const profileFields = [
    // Personal Information (30% weight)
    { field: 'phone', weight: 5 },
    { field: 'dateOfBirth', weight: 5 },
    { field: 'gender', weight: 5 },
    { field: 'address.street', weight: 3 },
    { field: 'address.city', weight: 3 },
    { field: 'address.state', weight: 3 },
    { field: 'address.pincode', weight: 6 },
    
    // Educational Background (25% weight)
    { field: 'currentClass', weight: 5 },
    { field: 'schoolName', weight: 5 },
    { field: 'schoolBoard', weight: 5 },
    { field: 'previousMarks.class10', weight: 5 },
    { field: 'previousMarks.class12', weight: 5 },
    
    // Family Information (15% weight)
    { field: 'fatherName', weight: 4 },
    { field: 'motherName', weight: 4 },
    { field: 'parentOccupation', weight: 4 },
    { field: 'familyIncome', weight: 3 },
    
    // Interests and Preferences (25% weight)
    { field: 'interestedStreams', weight: 8 },
    { field: 'preferredLocation', weight: 5 },
    { field: 'careerGoals', weight: 7 },
    { field: 'hobbies', weight: 5 },
    
    // Additional Information (5% weight)
    { field: 'achievements', weight: 2.5 },
    { field: 'extracurricularActivities', weight: 2.5 }
  ];
  
  let completedWeight = 0;
  const totalWeight = profileFields.reduce((sum, field) => sum + field.weight, 0);
  
  profileFields.forEach(({ field, weight }) => {
    const fieldValue = this.get(field);
    
    // Check if field is filled
    if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
      // Handle arrays (like interestedStreams, hobbies)
      if (Array.isArray(fieldValue)) {
        if (fieldValue.length > 0) {
          completedWeight += weight;
        }
      }
      // Handle nested objects (like address, previousMarks)
      else if (typeof fieldValue === 'object' && !Array.isArray(fieldValue) && !(fieldValue instanceof Date)) {
        // For nested objects, check if it has meaningful content
        const hasContent = Object.values(fieldValue).some(val => 
          val !== undefined && val !== null && val !== ''
        );
        if (hasContent) {
          completedWeight += weight;
        }
      }
      // Handle regular fields (strings, numbers, dates)
      else {
        completedWeight += weight;
      }
    }
  });
  
  return Math.round((completedWeight / totalWeight) * 100);
};

// Create indexes for better performance
studentProfileSchema.index({ userId: 1 });
studentProfileSchema.index({ interestedStreams: 1 });
studentProfileSchema.index({ preferredLocation: 1 });

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

module.exports = StudentProfile;