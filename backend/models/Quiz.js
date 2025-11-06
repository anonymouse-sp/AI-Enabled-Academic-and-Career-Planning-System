const mongoose = require('mongoose');

// Quiz Question Schema
const quizQuestionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true
  },
  question: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['aptitude', 'interests', 'personality', 'preferences', 'skills'],
    required: true
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'rating', 'ranking'],
    required: true
  },
  options: [{
    text: String,
    weights: {
      engineering: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      commerce: { type: Number, default: 0 },
      arts: { type: Number, default: 0 },
      science: { type: Number, default: 0 },
      law: { type: Number, default: 0 },
      management: { type: Number, default: 0 },
      design: { type: Number, default: 0 },
      architecture: { type: Number, default: 0 },
      agriculture: { type: Number, default: 0 }
    }
  }],
  order: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Quiz Response Schema
const quizResponseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  responses: [{
    questionId: String,
    selectedOption: String,
    rating: Number // For rating type questions
  }],
  scores: {
    engineering: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    commerce: { type: Number, default: 0 },
    arts: { type: Number, default: 0 },
    science: { type: Number, default: 0 },
    law: { type: Number, default: 0 },
    management: { type: Number, default: 0 },
    design: { type: Number, default: 0 },
    architecture: { type: Number, default: 0 },
    agriculture: { type: Number, default: 0 }
  },
  recommendations: [{
    stream: String,
    percentage: Number,
    reason: String,
    suggestedCourses: [String]
  }],
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes
quizQuestionSchema.index({ order: 1, isActive: 1 });
quizResponseSchema.index({ userId: 1, completedAt: -1 });

const QuizQuestion = mongoose.model('QuizQuestion', quizQuestionSchema);
const QuizResponse = mongoose.model('QuizResponse', quizResponseSchema);

module.exports = { QuizQuestion, QuizResponse };