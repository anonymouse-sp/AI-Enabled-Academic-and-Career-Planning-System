const { QuizQuestion, QuizResponse } = require('./models/Quiz');

class QuizScoringEngine {
  constructor() {
    this.streams = [
      'engineering', 'medical', 'commerce', 'arts', 'science', 
      'law', 'management', 'design', 'architecture', 'agriculture'
    ];
    
    this.streamDetails = {
      engineering: {
        fullName: 'Engineering',
        description: 'Engineering involves applying scientific and mathematical principles to design, build, and maintain structures, machines, systems, and processes.',
        careerOpportunities: [
          'Software Engineer', 'Civil Engineer', 'Mechanical Engineer', 
          'Electrical Engineer', 'Data Scientist', 'Product Manager'
        ],
        topColleges: ['IIT Delhi', 'IIT Bombay', 'IIT Madras', 'NIT Trichy', 'BITS Pilani'],
        averageSalary: '₹6-15 LPA',
        jobMarketTrend: 'High Demand',
        requiredSkills: ['Problem Solving', 'Mathematical Aptitude', 'Logical Thinking', 'Innovation'],
        personalityTraits: ['Analytical', 'Detail-oriented', 'Patient', 'Creative Problem Solver']
      },
      medical: {
        fullName: 'Medical Science',
        description: 'Medical science focuses on maintaining and restoring human health through the study, diagnosis, treatment, and prevention of disease.',
        careerOpportunities: [
          'Doctor', 'Surgeon', 'Medical Researcher', 'Pharmacist', 
          'Physiotherapist', 'Medical Officer'
        ],
        topColleges: ['AIIMS Delhi', 'CMC Vellore', 'JIPMER', 'King George Medical University'],
        averageSalary: '₹8-25 LPA',
        jobMarketTrend: 'High Demand',
        requiredSkills: ['Compassion', 'Attention to Detail', 'Strong Memory', 'Communication'],
        personalityTraits: ['Empathetic', 'Patient', 'Dedicated', 'Strong under pressure']
      },
      commerce: {
        fullName: 'Commerce & Finance',
        description: 'Commerce involves the study of trade, business activities, and financial systems that drive economic growth.',
        careerOpportunities: [
          'Chartered Accountant', 'Financial Analyst', 'Investment Banker', 
          'Tax Consultant', 'Auditor', 'Business Analyst'
        ],
        topColleges: ['SRCC Delhi', 'LSR Delhi', 'St. Xaviers Mumbai', 'Loyola Chennai'],
        averageSalary: '₹4-12 LPA',
        jobMarketTrend: 'Stable',
        requiredSkills: ['Numerical Ability', 'Analytical Thinking', 'Attention to Detail', 'Communication'],
        personalityTraits: ['Organized', 'Methodical', 'Goal-oriented', 'Professional']
      },
      arts: {
        fullName: 'Liberal Arts & Humanities',
        description: 'Arts and humanities explore human culture, creativity, critical thinking, and expression through various mediums.',
        careerOpportunities: [
          'Journalist', 'Writer', 'Teacher', 'Social Worker', 
          'Historian', 'Psychologist', 'Content Creator'
        ],
        topColleges: ['JNU Delhi', 'BHU Varanasi', 'Jamia Millia Islamia', 'Delhi University'],
        averageSalary: '₹3-8 LPA',
        jobMarketTrend: 'Growing',
        requiredSkills: ['Communication', 'Critical Thinking', 'Research', 'Creativity'],
        personalityTraits: ['Curious', 'Empathetic', 'Articulate', 'Open-minded']
      },
      science: {
        fullName: 'Pure Sciences',
        description: 'Pure sciences involve the systematic study of natural phenomena through observation, experimentation, and theoretical analysis.',
        careerOpportunities: [
          'Research Scientist', 'Lab Technician', 'Environmental Scientist', 
          'Food Technologist', 'Quality Control Analyst', 'Science Teacher'
        ],
        topColleges: ['IISc Bangalore', 'St. Stephens Delhi', 'Presidency Kolkata', 'Fergusson Pune'],
        averageSalary: '₹4-10 LPA',
        jobMarketTrend: 'Moderate Demand',
        requiredSkills: ['Analytical Thinking', 'Research Skills', 'Precision', 'Patience'],
        personalityTraits: ['Methodical', 'Curious', 'Persistent', 'Detail-oriented']
      },
      law: {
        fullName: 'Law & Legal Studies',
        description: 'Law involves the study of legal systems, justice, and the application of legal principles to resolve disputes and maintain order.',
        careerOpportunities: [
          'Lawyer', 'Judge', 'Legal Advisor', 'Corporate Counsel', 
          'Legal Journalist', 'Civil Services Officer'
        ],
        topColleges: ['NLSIU Bangalore', 'NALSAR Hyderabad', 'NLU Delhi', 'Gujarat NLU'],
        averageSalary: '₹5-20 LPA',
        jobMarketTrend: 'Growing',
        requiredSkills: ['Communication', 'Critical Analysis', 'Research', 'Persuasion'],
        personalityTraits: ['Argumentative', 'Ethical', 'Confident', 'Justice-oriented']
      },
      management: {
        fullName: 'Management & Business Administration',
        description: 'Management focuses on planning, organizing, leading, and controlling resources to achieve organizational goals efficiently.',
        careerOpportunities: [
          'Management Consultant', 'Business Manager', 'HR Manager', 
          'Marketing Manager', 'Operations Manager', 'Entrepreneur'
        ],
        topColleges: ['IIM Ahmedabad', 'IIM Bangalore', 'IIM Calcutta', 'FMS Delhi', 'XLRI Jamshedpur'],
        averageSalary: '₹8-25 LPA',
        jobMarketTrend: 'High Demand',
        requiredSkills: ['Leadership', 'Communication', 'Strategic Thinking', 'Team Management'],
        personalityTraits: ['Leadership-oriented', 'Confident', 'Strategic', 'People-focused']
      },
      design: {
        fullName: 'Design & Creative Arts',
        description: 'Design involves creating visual, functional, and aesthetic solutions for various communication and user experience challenges.',
        careerOpportunities: [
          'Graphic Designer', 'UI/UX Designer', 'Product Designer', 
          'Fashion Designer', 'Interior Designer', 'Creative Director'
        ],
        topColleges: ['NID Ahmedabad', 'IIT IDC Bombay', 'Pearl Academy', 'Srishti Institute'],
        averageSalary: '₹3-12 LPA',
        jobMarketTrend: 'Growing',
        requiredSkills: ['Creativity', 'Visual Thinking', 'Technical Skills', 'Innovation'],
        personalityTraits: ['Creative', 'Artistic', 'Innovative', 'Visual-oriented']
      },
      architecture: {
        fullName: 'Architecture & Planning',
        description: 'Architecture combines art, science, and technology to design and construct buildings and spaces that serve human needs.',
        careerOpportunities: [
          'Architect', 'Urban Planner', 'Landscape Architect', 
          'Interior Designer', 'Construction Manager', 'Heritage Conservator'
        ],
        topColleges: ['IIT Kharagpur', 'SPA Delhi', 'CEPT Ahmedabad', 'Jadavpur University'],
        averageSalary: '₹4-15 LPA',
        jobMarketTrend: 'Stable',
        requiredSkills: ['Spatial Thinking', 'Technical Drawing', 'Creativity', 'Project Management'],
        personalityTraits: ['Creative', 'Detail-oriented', 'Visionary', 'Technical-minded']
      },
      agriculture: {
        fullName: 'Agriculture & Allied Sciences',
        description: 'Agriculture focuses on crop production, livestock management, and sustainable farming practices to ensure food security.',
        careerOpportunities: [
          'Agricultural Officer', 'Farm Manager', 'Agricultural Scientist', 
          'Food Technologist', 'Rural Development Officer', 'Agribusiness Manager'
        ],
        topColleges: ['IARI Delhi', 'Tamil Nadu Agricultural University', 'Punjab Agricultural University'],
        averageSalary: '₹3-8 LPA',
        jobMarketTrend: 'Growing',
        requiredSkills: ['Scientific Knowledge', 'Problem Solving', 'Practical Skills', 'Innovation'],
        personalityTraits: ['Nature-loving', 'Patient', 'Practical', 'Community-oriented']
      }
    };
  }

  // Calculate scores based on user responses
  calculateScores(responses) {
    const scores = {};
    
    // Initialize scores for all streams
    this.streams.forEach(stream => {
      scores[stream] = 0;
    });

    // Process each response
    responses.forEach(response => {
      const { questionId, selectedOption } = response;
      
      // Find the question and selected option weights
      // Note: This would need to be integrated with the actual question data
      // For now, we'll assume the weights are passed with the response
      if (response.weights) {
        Object.keys(response.weights).forEach(stream => {
          if (scores[stream] !== undefined) {
            scores[stream] += response.weights[stream];
          }
        });
      }
    });

    return scores;
  }

  // Generate recommendations based on scores
  generateRecommendations(scores) {
    const recommendations = [];
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    // Convert scores to percentages and create recommendation objects
    Object.entries(scores).forEach(([stream, score]) => {
      const percentage = totalScore > 0 ? Math.round((score / totalScore) * 100) : 0;
      
      recommendations.push({
        stream: stream,
        score: score,
        percentage: percentage,
        fullName: this.streamDetails[stream]?.fullName || stream,
        description: this.streamDetails[stream]?.description || '',
        careerOpportunities: this.streamDetails[stream]?.careerOpportunities || [],
        topColleges: this.streamDetails[stream]?.topColleges || [],
        averageSalary: this.streamDetails[stream]?.averageSalary || '',
        jobMarketTrend: this.streamDetails[stream]?.jobMarketTrend || '',
        requiredSkills: this.streamDetails[stream]?.requiredSkills || [],
        personalityTraits: this.streamDetails[stream]?.personalityTraits || []
      });
    });

    // Sort by score in descending order
    recommendations.sort((a, b) => b.score - a.score);

    // Add rank to each recommendation
    recommendations.forEach((rec, index) => {
      rec.rank = index + 1;
    });

    return recommendations;
  }

  // Generate personalized advice based on top recommendations
  generatePersonalizedAdvice(recommendations) {
    const topThree = recommendations.slice(0, 3);
    const advice = [];

    // Primary recommendation advice
    const primary = topThree[0];
    if (primary.percentage >= 25) {
      advice.push({
        type: 'primary_recommendation',
        title: `${primary.fullName} is your best match!`,
        message: `Based on your responses, you show strong alignment with ${primary.fullName}. Your interests and skills suggest you would thrive in this field.`,
        actionItems: [
          `Research top colleges for ${primary.fullName}`,
          `Connect with professionals in ${primary.careerOpportunities.slice(0, 2).join(' or ')}`,
          `Explore internship opportunities in this field`,
          `Consider taking advanced courses in relevant subjects`
        ]
      });
    }

    // Secondary options
    if (topThree.length > 1 && topThree[1].percentage >= 15) {
      advice.push({
        type: 'secondary_option',
        title: `${topThree[1].fullName} is also worth considering`,
        message: `You also show good compatibility with ${topThree[1].fullName}. This could be an excellent alternative or complementary field.`,
        actionItems: [
          `Compare career prospects between your top two choices`,
          `Look for interdisciplinary programs that combine both fields`,
          `Attend career fairs and information sessions`
        ]
      });
    }

    // Skills development advice
    const allRequiredSkills = topThree.reduce((skills, rec) => {
      return [...skills, ...rec.requiredSkills];
    }, []);
    
    const uniqueSkills = [...new Set(allRequiredSkills)];
    
    if (uniqueSkills.length > 0) {
      advice.push({
        type: 'skill_development',
        title: 'Focus on developing these key skills',
        message: 'Based on your top career matches, these skills will be crucial for your success.',
        actionItems: uniqueSkills.slice(0, 4).map(skill => `Improve your ${skill} abilities`)
      });
    }

    return advice;
  }

  // Main function to process quiz and generate complete results
  async processQuizResults(userId, responses) {
    try {
      // Calculate scores from responses
      const scores = this.calculateScores(responses);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(scores);
      
      // Generate personalized advice
      const personalizedAdvice = this.generatePersonalizedAdvice(recommendations);
      
      // Create quiz response record
      const quizResponse = new QuizResponse({
        userId,
        responses,
        scores,
        recommendations: recommendations.map(rec => ({
          stream: rec.stream,
          percentage: rec.percentage,
          reason: `${rec.percentage}% match based on your interests and aptitude`,
          suggestedCourses: rec.careerOpportunities.slice(0, 3)
        }))
      });

      // Save to database
      await quizResponse.save();

      // Return complete results
      return {
        success: true,
        results: {
          userId,
          scores,
          recommendations,
          personalizedAdvice,
          completedAt: new Date(),
          quizId: quizResponse._id
        }
      };

    } catch (error) {
      console.error('Error processing quiz results:', error);
      return {
        success: false,
        error: 'Failed to process quiz results',
        details: error.message
      };
    }
  }
}

module.exports = QuizScoringEngine;