const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollegeProfile',
    required: true
  },
  collegeName: {
    type: String,
    required: true
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'waitlisted'],
    default: 'pending'
  },
  
  // Student Information
  studentInfo: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other']
    },
    nationality: {
      type: String,
      default: 'Indian'
    }
  },
  
  // Academic Information
  academicInfo: {
    currentEducation: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    graduationYear: {
      type: Number,
      required: true
    }
  },
  
  // Course Information
  courseInfo: {
    preferredCourse: {
      type: String,
      required: true
    },
    alternativeCourse: {
      type: String
    }
  },
  
  // Additional Information
  additionalInfo: {
    extracurriculars: String,
    achievements: String,
    statement: {
      type: String,
      required: true,
      maxlength: 2500
    }
  },
  
  // Documents (for future enhancement)
  documents: {
    marksheets: [String],
    certificates: [String],
    idProof: String,
    photos: [String]
  },
  
  // Application tracking
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  
  // Communication history
  communications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'notification']
    },
    subject: String,
    message: String,
    sentAt: {
      type: Date,
      default: Date.now
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
applicationSchema.index({ studentId: 1, applicationDate: -1 });
applicationSchema.index({ collegeId: 1, status: 1, applicationDate: -1 });
applicationSchema.index({ status: 1, applicationDate: -1 });

// Virtual for full student name
applicationSchema.virtual('studentFullName').get(function() {
  return `${this.studentInfo.firstName} ${this.studentInfo.lastName}`;
});

// Method to update application status
applicationSchema.methods.updateStatus = function(newStatus, reviewerId, notes) {
  this.status = newStatus;
  this.reviewedAt = new Date();
  this.reviewedBy = reviewerId;
  if (notes) {
    this.notes = notes;
  }
  return this.save();
};

// Method to add communication record
applicationSchema.methods.addCommunication = function(type, subject, message, sentBy) {
  this.communications.push({
    type,
    subject,
    message,
    sentBy,
    sentAt: new Date()
  });
  return this.save();
};

// Static method to get applications by college
applicationSchema.statics.getByCollege = function(collegeId, options = {}) {
  const query = { collegeId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('studentId', 'name email')
    .sort({ applicationDate: -1 })
    .limit(options.limit || 50);
};

// Static method to get applications by student
applicationSchema.statics.getByStudent = function(studentId, options = {}) {
  const query = { studentId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('collegeId')
    .sort({ applicationDate: -1 })
    .limit(options.limit || 50);
};

// Pre-save middleware to validate application
applicationSchema.pre('save', function(next) {
  // Ensure required fields are present
  if (!this.studentInfo.firstName || !this.studentInfo.lastName) {
    next(new Error('Student name is required'));
  }
  
  if (!this.courseInfo.preferredCourse) {
    next(new Error('Preferred course is required'));
  }
  
  if (!this.additionalInfo.statement || this.additionalInfo.statement.trim().length < 50) {
    next(new Error('Personal statement must be at least 50 characters long'));
  }
  
  next();
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;