const mongoose = require('mongoose');
const { QuizQuestion } = require('./models/Quiz');

// Connect to MongoDB
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI);

const quizQuestions = [
  // Aptitude Questions
  {
    questionId: 'apt_01',
    question: 'Which subject do you find most interesting and easy to understand?',
    category: 'aptitude',
    type: 'multiple-choice',
    order: 1,
    options: [
      {
        text: 'Mathematics and Physics',
        weights: { engineering: 25, science: 15, architecture: 10, commerce: 5 }
      },
      {
        text: 'Biology and Chemistry',
        weights: { medical: 30, science: 20, agriculture: 15, engineering: 5 }
      },
      {
        text: 'Economics and Statistics',
        weights: { commerce: 25, management: 20, law: 8, engineering: 5 }
      },
      {
        text: 'Literature and History',
        weights: { arts: 30, law: 15, design: 10, management: 5 }
      },
      {
        text: 'Computer Science and Logic',
        weights: { engineering: 30, science: 15, design: 10, management: 5 }
      }
    ]
  },
  {
    questionId: 'apt_02',
    question: 'What type of problems do you enjoy solving the most?',
    category: 'aptitude',
    type: 'multiple-choice',
    order: 2,
    options: [
      {
        text: 'Mathematical equations and logical puzzles',
        weights: { engineering: 28, science: 18, commerce: 12, architecture: 8 }
      },
      {
        text: 'Understanding how living things work',
        weights: { medical: 30, science: 20, agriculture: 18, engineering: 5 }
      },
      {
        text: 'Analyzing market trends and financial data',
        weights: { commerce: 30, management: 25, law: 8, engineering: 5 }
      },
      {
        text: 'Creative design and artistic challenges',
        weights: { design: 30, arts: 25, architecture: 20, management: 5 }
      },
      {
        text: 'Legal cases and social issues',
        weights: { law: 30, arts: 20, management: 15, commerce: 5 }
      }
    ]
  },
  {
    questionId: 'apt_03',
    question: 'How do you prefer to learn new concepts?',
    category: 'personality',
    type: 'multiple-choice',
    order: 3,
    options: [
      {
        text: 'Through hands-on experiments and practical work',
        weights: { engineering: 8, science: 7, medical: 6, agriculture: 5 }
      },
      {
        text: 'By reading and researching extensively',
        weights: { arts: 8, law: 7, science: 5, medical: 4 }
      },
      {
        text: 'Through visual aids and creative projects',
        weights: { design: 9, arts: 7, architecture: 8 }
      },
      {
        text: 'By discussing and debating with others',
        weights: { law: 8, management: 7, commerce: 5, arts: 6 }
      },
      {
        text: 'Through case studies and real-world examples',
        weights: { management: 9, commerce: 8, law: 6, medical: 5 }
      }
    ]
  },

  // Interest Questions
  {
    questionId: 'int_01',
    question: 'What kind of activities do you enjoy in your free time?',
    category: 'interests',
    type: 'multiple-choice',
    order: 4,
    options: [
      {
        text: 'Building or fixing things, coding, gadgets',
        weights: { engineering: 10, science: 4, design: 3 }
      },
      {
        text: 'Reading about health, nature documentaries',
        weights: { medical: 9, science: 6, agriculture: 7 }
      },
      {
        text: 'Following business news, investing games',
        weights: { commerce: 10, management: 7 }
      },
      {
        text: 'Drawing, writing, music, photography',
        weights: { arts: 10, design: 8, architecture: 5 }
      },
      {
        text: 'Debating, social causes, current affairs',
        weights: { law: 10, arts: 6, management: 5 }
      }
    ]
  },
  {
    questionId: 'int_02',
    question: 'Which type of TV shows or YouTube channels do you prefer?',
    category: 'interests',
    type: 'multiple-choice',
    order: 5,
    options: [
      {
        text: 'Tech reviews, DIY projects, science experiments',
        weights: { engineering: 9, science: 7, design: 3 }
      },
      {
        text: 'Medical dramas, health tips, nature shows',
        weights: { medical: 10, science: 5, agriculture: 6 }
      },
      {
        text: 'Business documentaries, success stories',
        weights: { commerce: 9, management: 8 }
      },
      {
        text: 'Art tutorials, creative content, design shows',
        weights: { design: 10, arts: 9, architecture: 6 }
      },
      {
        text: 'News analysis, documentaries, social issues',
        weights: { law: 9, arts: 7, management: 4 }
      }
    ]
  },

  // Skills Assessment
  {
    questionId: 'skl_01',
    question: 'Rate your comfort level with mathematics (1-5)',
    category: 'skills',
    type: 'rating',
    order: 6,
    options: [
      {
        text: '1 - Very Uncomfortable',
        weights: { arts: 2, design: 1, law: 1 }
      },
      {
        text: '2 - Uncomfortable',
        weights: { arts: 4, design: 2, law: 2, medical: 2 }
      },
      {
        text: '3 - Neutral',
        weights: { medical: 4, management: 4, commerce: 4, agriculture: 3 }
      },
      {
        text: '4 - Comfortable',
        weights: { engineering: 6, science: 5, commerce: 6, architecture: 4 }
      },
      {
        text: '5 - Very Comfortable',
        weights: { engineering: 10, science: 8, commerce: 7, architecture: 6 }
      }
    ]
  },
  {
    questionId: 'skl_02',
    question: 'Rate your communication and presentation skills (1-5)',
    category: 'skills',
    type: 'rating',
    order: 7,
    options: [
      {
        text: '1 - Very Poor',
        weights: { engineering: 1, science: 1 }
      },
      {
        text: '2 - Poor',
        weights: { engineering: 2, science: 2, medical: 2 }
      },
      {
        text: '3 - Average',
        weights: { engineering: 3, science: 4, medical: 4, design: 4 }
      },
      {
        text: '4 - Good',
        weights: { management: 7, commerce: 6, law: 6, arts: 6, medical: 5 }
      },
      {
        text: '5 - Excellent',
        weights: { management: 10, law: 10, arts: 9, commerce: 8, design: 7 }
      }
    ]
  },

  // Career Preferences
  {
    questionId: 'prf_01',
    question: 'What type of work environment appeals to you most?',
    category: 'preferences',
    type: 'multiple-choice',
    order: 8,
    options: [
      {
        text: 'High-tech labs, innovation centers, tech companies',
        weights: { engineering: 10, science: 7, design: 4 }
      },
      {
        text: 'Hospitals, clinics, research facilities',
        weights: { medical: 10, science: 5 }
      },
      {
        text: 'Corporate offices, banks, consulting firms',
        weights: { commerce: 10, management: 9, law: 5 }
      },
      {
        text: 'Creative studios, galleries, media houses',
        weights: { design: 10, arts: 9, architecture: 6 }
      },
      {
        text: 'Courts, law firms, NGOs, government offices',
        weights: { law: 10, arts: 5, management: 4 }
      },
      {
        text: 'Farms, research centers, outdoor environments',
        weights: { agriculture: 10, science: 6, engineering: 3 }
      }
    ]
  },
  {
    questionId: 'prf_02',
    question: 'What motivates you most in choosing a career?',
    category: 'preferences',
    type: 'multiple-choice',
    order: 9,
    options: [
      {
        text: 'Creating innovative solutions and technologies',
        weights: { engineering: 10, science: 6, design: 5, architecture: 4 }
      },
      {
        text: 'Helping people and making a difference in their lives',
        weights: { medical: 10, law: 6, arts: 5, agriculture: 4 }
      },
      {
        text: 'Financial success and business growth',
        weights: { commerce: 10, management: 9, law: 4 }
      },
      {
        text: 'Self-expression and creative fulfillment',
        weights: { arts: 10, design: 10, architecture: 7 }
      },
      {
        text: 'Social justice and making society better',
        weights: { law: 10, arts: 7, management: 4, medical: 5 }
      }
    ]
  },
  {
    questionId: 'prf_03',
    question: 'How do you handle pressure and deadlines?',
    category: 'personality',
    type: 'multiple-choice',
    order: 10,
    options: [
      {
        text: 'I work systematically and follow structured approaches',
        weights: { engineering: 8, science: 7, commerce: 6, medical: 6 }
      },
      {
        text: 'I stay calm and make critical decisions quickly',
        weights: { medical: 10, law: 8, management: 7 }
      },
      {
        text: 'I get creative and find innovative solutions',
        weights: { design: 9, arts: 8, architecture: 7, engineering: 6 }
      },
      {
        text: 'I collaborate with others and delegate effectively',
        weights: { management: 10, commerce: 8, law: 6 }
      },
      {
        text: 'I prefer working at my own pace with flexible deadlines',
        weights: { arts: 7, design: 6, science: 5, agriculture: 6 }
      }
    ]
  },

  // Future Vision Questions
  {
    questionId: 'vis_01',
    question: 'Where do you see yourself making the biggest impact in 10 years?',
    category: 'preferences',
    type: 'multiple-choice',
    order: 11,
    options: [
      {
        text: 'Leading technological innovations or scientific breakthroughs',
        weights: { engineering: 10, science: 9, architecture: 4 }
      },
      {
        text: 'Improving healthcare and saving lives',
        weights: { medical: 10, science: 5, agriculture: 3 }
      },
      {
        text: 'Building successful businesses or managing organizations',
        weights: { management: 10, commerce: 9, law: 4 }
      },
      {
        text: 'Creating meaningful art or influencing culture',
        weights: { arts: 10, design: 9, architecture: 6 }
      },
      {
        text: 'Fighting for justice and protecting rights',
        weights: { law: 10, arts: 6, management: 4 }
      },
      {
        text: 'Solving environmental and food security challenges',
        weights: { agriculture: 10, science: 7, engineering: 5 }
      }
    ]
  },
  {
    questionId: 'vis_02',
    question: 'What type of recognition would make you most proud?',
    category: 'preferences',
    type: 'multiple-choice',
    order: 12,
    options: [
      {
        text: 'Patent for an innovative invention or technology',
        weights: { engineering: 10, science: 7, design: 4 }
      },
      {
        text: 'Medical breakthrough that helps cure diseases',
        weights: { medical: 10, science: 8, agriculture: 3 }
      },
      {
        text: 'Building a successful company or financial empire',
        weights: { commerce: 10, management: 10, engineering: 3 }
      },
      {
        text: 'Creating award-winning art or design',
        weights: { arts: 10, design: 10, architecture: 8 }
      },
      {
        text: 'Winning landmark legal cases for social justice',
        weights: { law: 10, arts: 5, management: 3 }
      },
      {
        text: 'Developing sustainable farming or environmental solutions',
        weights: { agriculture: 10, science: 6, engineering: 4 }
      }
    ]
  }
];

async function seedQuizQuestions() {
  try {
    console.log('Seeding quiz questions...');
    
    // Clear existing questions
    await QuizQuestion.deleteMany({});
    
    // Insert new questions
    await QuizQuestion.insertMany(quizQuestions);
    
    console.log(`Successfully seeded ${quizQuestions.length} quiz questions`);
    
    // Display summary
    const categories = [...new Set(quizQuestions.map(q => q.category))];
    console.log('\nQuestion categories:');
    categories.forEach(category => {
      const count = quizQuestions.filter(q => q.category === category).length;
      console.log(`- ${category}: ${count} questions`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding quiz questions:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedQuizQuestions();
}

module.exports = { quizQuestions, seedQuizQuestions };