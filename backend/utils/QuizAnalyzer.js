// Quiz scoring and recommendation system
class QuizAnalyzer {
  constructor() {
    this.streamInfo = {
      engineering: {
        name: 'Engineering',
        description: 'Perfect for problem-solvers who love technology, mathematics, and creating innovative solutions.',
        suggestedCourses: [
          'Computer Science Engineering', 'Mechanical Engineering', 'Electrical Engineering',
          'Civil Engineering', 'Electronics & Communication', 'Aerospace Engineering',
          'Chemical Engineering', 'Biomedical Engineering', 'Information Technology',
          'Automobile Engineering', 'Petroleum Engineering', 'Mining Engineering',
          'Environmental Engineering', 'Agricultural Engineering', 'Marine Engineering',
          'Robotics Engineering', 'AI & Machine Learning', 'Cybersecurity Engineering'
        ],
        careerPaths: ['Software Developer', 'Mechanical Engineer', 'Data Scientist', 'Robotics Engineer', 'AI Engineer', 'Cybersecurity Expert'],
        minPercentage: 20
      },
      medical: {
        name: 'Medical & Health Sciences',
        description: 'Ideal for those passionate about helping others, biology, and making a difference in healthcare.',
        suggestedCourses: [
          'MBBS', 'BDS', 'BAMS', 'BHMS', 'Physiotherapy', 'Nursing',
          'Pharmacy', 'Medical Laboratory Technology', 'BUMS', 'Veterinary Science',
          'Occupational Therapy', 'Speech Therapy', 'Optometry', 'Radiology Technology',
          'Operation Theater Technology', 'Anesthesia Technology', 'Cardiac Technology',
          'Dialysis Technology', 'Medical Imaging Technology', 'Biotechnology',
          'Microbiology', 'Biochemistry', 'Public Health', 'Hospital Administration'
        ],
        careerPaths: ['Doctor', 'Surgeon', 'Pharmacist', 'Medical Researcher', 'Physiotherapist', 'Medical Technologist'],
        minPercentage: 20
      },
      commerce: {
        name: 'Commerce & Finance',
        description: 'Great for analytical minds interested in business, finance, and economic systems.',
        suggestedCourses: [
          'B.Com', 'BBA', 'Chartered Accountancy (CA)', 'Cost Accounting (CMA)',
          'Company Secretary (CS)', 'Bachelor of Economics', 'B.Com (Hons)',
          'BBA (Hons)', 'Financial Markets', 'Banking & Insurance', 'International Business',
          'Business Economics', 'Corporate Secretaryship', 'Financial Planning',
          'Investment Management', 'Risk Management', 'Actuarial Science',
          'Financial Engineering', 'Quantitative Finance', 'Digital Marketing',
          'E-Commerce', 'Supply Chain Management', 'Logistics Management'
        ],
        careerPaths: ['Chartered Accountant', 'Investment Banker', 'Financial Analyst', 'Business Analyst', 'Financial Planner', 'Risk Manager'],
        minPercentage: 20
      },
      arts: {
        name: 'Arts & Humanities',
        description: 'Perfect for creative minds who love literature, social sciences, and human expression.',
        suggestedCourses: [
          'BA English', 'BA Psychology', 'BA History', 'BA Political Science',
          'BA Sociology', 'Journalism & Mass Communication', 'Social Work',
          'BA Philosophy', 'BA Geography', 'BA Anthropology', 'BA Linguistics',
          'Cultural Studies', 'Gender Studies', 'International Relations',
          'Public Administration', 'Criminology', 'Human Rights', 'Film Studies',
          'Theatre Arts', 'Music', 'Dance', 'Creative Writing', 'Translation Studies'
        ],
        careerPaths: ['Writer', 'Psychologist', 'Journalist', 'Social Worker', 'Teacher', 'Counselor', 'Diplomat'],
        minPercentage: 20
      },
      science: {
        name: 'Pure Sciences',
        description: 'Ideal for curious minds who want to understand how the world works through research and discovery.',
        suggestedCourses: [
          'BSc Physics', 'BSc Chemistry', 'BSc Mathematics', 'BSc Biology',
          'BSc Environmental Science', 'BSc Biotechnology', 'BSc Microbiology',
          'BSc Biochemistry', 'BSc Botany', 'BSc Zoology', 'BSc Geology',
          'BSc Statistics', 'BSc Computer Science', 'BSc Electronics',
          'BSc Instrumentation', 'BSc Forensic Science', 'BSc Food Technology',
          'BSc Applied Sciences', 'BSc Research', 'BSc Data Science'
        ],
        careerPaths: ['Research Scientist', 'Lab Technician', 'Environmental Consultant', 'Science Teacher', 'Data Analyst', 'Quality Control Analyst'],
        minPercentage: 20
      },
      law: {
        name: 'Law & Legal Studies',
        description: 'Perfect for those who want to fight for justice, have strong communication skills, and analytical thinking.',
        suggestedCourses: [
          'LLB', 'BA LLB', 'BBA LLB', 'Integrated Law Programs',
          'Legal Studies', 'Criminology', 'Constitutional Law', 'Corporate Law',
          'Criminal Law', 'Cyber Law', 'Intellectual Property Law', 'Environmental Law',
          'Tax Law', 'Labor Law', 'International Law', 'Human Rights Law',
          'Maritime Law', 'Aviation Law', 'Patent Law', 'Family Law',
          'Commercial Law', 'Banking Law', 'Insurance Law', 'Real Estate Law'
        ],
        careerPaths: ['Lawyer', 'Judge', 'Legal Advisor', 'Human Rights Activist', 'Corporate Counsel', 'Legal Consultant', 'Public Prosecutor'],
        minPercentage: 20
      },
      management: {
        name: 'Management & Business Administration',
        description: 'Great for natural leaders who want to manage organizations and drive business growth.',
        suggestedCourses: [
          'BBA', 'BMS', 'BBM', 'Hotel Management', 'Event Management',
          'Human Resource Management', 'International Business', 'Supply Chain Management',
          'Operations Management', 'Strategic Management', 'Project Management',
          'Digital Marketing', 'Brand Management', 'Retail Management', 'Sales Management',
          'Quality Management', 'Risk Management', 'Change Management', 'Leadership Studies',
          'Organizational Behavior', 'Business Analytics', 'Corporate Communications'
        ],
        careerPaths: ['Business Manager', 'HR Manager', 'Marketing Manager', 'Consultant', 'Entrepreneur', 'Operations Manager', 'Project Manager'],
        minPercentage: 20
      },
      design: {
        name: 'Design & Creative Arts',
        description: 'Ideal for creative individuals who want to express themselves through visual and artistic mediums.',
        suggestedCourses: [
          'Graphic Design', 'Fashion Design', 'Interior Design', 'Industrial Design',
          'Animation', 'Fine Arts', 'Digital Media Design', 'UI/UX Design',
          'Web Design', 'Product Design', 'Game Design', 'Motion Graphics',
          'Visual Communication', 'Textile Design', 'Jewelry Design', 'Furniture Design',
          'Packaging Design', 'Brand Design', 'Typography', 'Illustration',
          'Photography', 'Video Production', 'Sound Design', '3D Modeling'
        ],
        careerPaths: ['Graphic Designer', 'Fashion Designer', 'Interior Designer', 'Animator', 'Art Director', 'UI/UX Designer', 'Creative Director'],
        minPercentage: 20
      },
      architecture: {
        name: 'Architecture & Planning',
        description: 'Perfect for those who combine creativity with technical skills to design buildings and spaces.',
        suggestedCourses: [
          'B.Arch', 'Bachelor of Planning', 'Landscape Architecture',
          'Interior Architecture', 'Urban Planning', 'Sustainable Architecture',
          'Green Building Design', 'Smart City Planning', 'Heritage Conservation',
          'Transportation Planning', 'Environmental Planning', 'Housing Planning',
          'Regional Planning', 'Construction Management', 'Building Technology',
          'Architectural Engineering', 'Real Estate Development', 'Space Planning'
        ],
        careerPaths: ['Architect', 'Urban Planner', 'Landscape Designer', 'Interior Architect', 'Construction Manager', 'Real Estate Developer'],
        minPercentage: 20
      },
      agriculture: {
        name: 'Agriculture & Life Sciences',
        description: 'Great for those interested in sustainable farming, food security, and environmental conservation.',
        suggestedCourses: [
          'BSc Agriculture', 'Agricultural Engineering', 'Horticulture',
          'Forestry', 'Food Technology', 'Veterinary Science', 'Organic Farming',
          'Precision Agriculture', 'Agricultural Biotechnology', 'Soil Science',
          'Plant Pathology', 'Entomology', 'Agronomy', 'Agricultural Economics',
          'Rural Development', 'Fisheries Science', 'Dairy Technology',
          'Poultry Science', 'Sericulture', 'Beekeeping', 'Greenhouse Technology',
          'Hydroponics', 'Agricultural Marketing', 'Farm Management'
        ],
        careerPaths: ['Agricultural Scientist', 'Farming Consultant', 'Food Technologist', 'Veterinarian', 'Agricultural Engineer', 'Rural Development Officer'],
        minPercentage: 20
      }
    };
  }

  calculateScores(responses, questions) {
    const scores = {
      engineering: 0, medical: 0, commerce: 0, arts: 0, science: 0,
      law: 0, management: 0, design: 0, architecture: 0, agriculture: 0
    };

    responses.forEach(response => {
      const question = questions.find(q => q.questionId === response.questionId);
      if (!question) return;

      if (question.type === 'multiple-choice') {
        const selectedOption = question.options.find(opt => opt.text === response.selectedOption);
        if (selectedOption) {
          Object.keys(selectedOption.weights).forEach(stream => {
            scores[stream] += selectedOption.weights[stream] || 0;
          });
        }
      } else if (question.type === 'rating' && response.rating) {
        // For rating questions, find the option that matches the rating
        const ratingOption = question.options[response.rating - 1];
        if (ratingOption) {
          Object.keys(ratingOption.weights).forEach(stream => {
            scores[stream] += ratingOption.weights[stream] || 0;
          });
        }
      }
    });

    return scores;
  }

  generateRecommendations(scores) {
    const maxScore = Math.max(...Object.values(scores));
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    if (totalScore === 0) {
      return [{
        stream: 'general',
        percentage: 0,
        reason: 'Please complete the quiz to get personalized recommendations.',
        suggestedCourses: []
      }];
    }

    // Calculate percentages
    const percentages = {};
    Object.keys(scores).forEach(stream => {
      percentages[stream] = Math.round((scores[stream] / totalScore) * 100);
    });

    // Generate recommendations for streams above minimum threshold
    const recommendations = [];
    Object.keys(this.streamInfo).forEach(stream => {
      const percentage = percentages[stream];
      const streamData = this.streamInfo[stream];
      
      if (percentage >= streamData.minPercentage) {
        let reason = this.generateReason(stream, percentage, scores);
        
        recommendations.push({
          stream: streamData.name,
          percentage,
          reason,
          suggestedCourses: streamData.suggestedCourses.slice(0, 4) // Top 4 courses
        });
      }
    });

    // Sort by percentage descending
    recommendations.sort((a, b) => b.percentage - a.percentage);

    // If no recommendations meet threshold, recommend top 3 streams
    if (recommendations.length === 0) {
      const sortedStreams = Object.entries(percentages)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

      sortedStreams.forEach(([stream, percentage]) => {
        const streamData = this.streamInfo[stream];
        recommendations.push({
          stream: streamData.name,
          percentage,
          reason: `Based on your responses, you show some interest in ${streamData.name}. Consider exploring this field further.`,
          suggestedCourses: streamData.suggestedCourses.slice(0, 3)
        });
      });
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  generateReason(stream, percentage, scores) {
    const streamData = this.streamInfo[stream];
    let reason = `${streamData.description} `;

    // Add specific reasons based on score ranges
    if (percentage >= 80) {
      reason += `Your responses show a very strong alignment (${percentage}%) with ${streamData.name}. This field seems to match your interests, skills, and career aspirations perfectly.`;
    } else if (percentage >= 70) {
      reason += `You show strong potential (${percentage}%) for ${streamData.name}. Your aptitude and interests align well with this field.`;
    } else if (percentage >= 60) {
      reason += `You have good compatibility (${percentage}%) with ${streamData.name}. This could be a great career path to explore.`;
    } else {
      reason += `You show some interest (${percentage}%) in ${streamData.name}. Consider learning more about this field to see if it matches your goals.`;
    }

    return reason;
  }

  generateDetailedAnalysis(scores, recommendations) {
    const analysis = {
      strengths: [],
      suggestions: [],
      nextSteps: []
    };

    // Identify strengths based on top scores
    const sortedScores = Object.entries(scores).sort(([,a], [,b]) => b - a);
    const topStream = sortedScores[0][0];
    const secondStream = sortedScores[1][0];

    analysis.strengths.push(`Strong aptitude for ${this.streamInfo[topStream].name}`);
    if (scores[secondStream] > 0) {
      analysis.strengths.push(`Secondary interest in ${this.streamInfo[secondStream].name}`);
    }

    // Generate suggestions
    analysis.suggestions.push('Take advanced courses in your areas of interest');
    analysis.suggestions.push('Seek internships or volunteer opportunities in recommended fields');
    analysis.suggestions.push('Talk to professionals working in these areas');

    // Next steps
    analysis.nextSteps.push('Research admission requirements for recommended courses');
    analysis.nextSteps.push('Identify top colleges offering these programs');
    analysis.nextSteps.push('Prepare for relevant entrance exams');
    analysis.nextSteps.push('Consider taking aptitude tests specific to your chosen field');

    return analysis;
  }
}

module.exports = QuizAnalyzer;