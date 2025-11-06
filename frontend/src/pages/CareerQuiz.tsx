import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse
} from '@mui/material';
import {
  Quiz,
  Psychology,
  TrendingUp,
  WorkOutline,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  Lightbulb,
  Timeline,
  Assignment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';

interface QuizQuestion {
  questionId: string;
  question: string;
  category: string;
  type: string;
  options: Array<{
    text: string;
    weights: Record<string, number>;
  }>;
  order: number;
}

interface QuizResponse {
  questionId: string;
  selectedOption: string;
  rating?: number;
}

interface Recommendation {
  stream: string;
  percentage: number;
  reason: string;
  suggestedCourses: string[];
}

interface QuizResult {
  scores: Record<string, number>;
  recommendations: Recommendation[];
  analysis: {
    strengths: string[];
    suggestions: string[];
    nextSteps: string[];
  };
  quizId: string;
}

const CareerQuiz: React.FC = () => {
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState<QuizResult | null>(null);
  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchQuizQuestions();
  }, []);

  const fetchQuizQuestions = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quiz/questions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quiz questions');
      }

      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      setError('Failed to load quiz questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, selectedOption: string) => {
    const newResponses = responses.filter(r => r.questionId !== questionId);
    newResponses.push({ questionId, selectedOption });
    setResponses(newResponses);
  };

  const handleRatingSelect = (questionId: string, rating: number) => {
    const newResponses = responses.filter(r => r.questionId !== questionId);
    newResponses.push({ questionId, selectedOption: '', rating });
    setResponses(newResponses);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = async () => {
    if (responses.length !== questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quiz/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ responses })
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      const data = await response.json();
      setResults({
        scores: data.scores,
        recommendations: data.recommendations,
        analysis: data.analysis,
        quizId: data.quizId
      });
      setQuizCompleted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleResultExpansion = (stream: string) => {
    setExpandedResults(prev => ({
      ...prev,
      [stream]: !prev[stream]
    }));
  };



  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setResponses([]);
    setQuizCompleted(false);
    setResults(null);
    setError('');
    setExpandedResults({});
  };

  if (loading) {
    return (
      <DashboardLayout title="Career Guidance Quiz">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading quiz questions...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Career Guidance Quiz">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchQuizQuestions}>
          Retry
        </Button>
      </DashboardLayout>
    );
  }

  if (quizCompleted && results) {
    return (
      <DashboardLayout title="Your Career Recommendations">
        <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
          {/* Results Header */}
          <Card elevation={3} sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircle sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h4" fontWeight="bold">
                  Quiz Completed Successfully!
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Based on your responses, we've identified the best career paths for you.
              </Typography>
            </CardContent>
          </Card>

          {/* Top Recommendations */}
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <TrendingUp sx={{ mr: 1, color: '#1976d2' }} />
            Your Top Career Recommendations
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {results.recommendations.slice(0, 3).map((rec, index) => (
              <Grid item xs={12} md={4} key={rec.stream}>
                <Card 
                  elevation={index === 0 ? 6 : 3}
                  sx={{ 
                    height: '100%',
                    border: index === 0 ? '2px solid #1976d2' : 'none',
                    position: 'relative'
                  }}
                >
                  {index === 0 && (
                    <Chip 
                      label="Best Match" 
                      color="primary" 
                      sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
                    />
                  )}
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {rec.stream}
                    </Typography>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {rec.percentage}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                        match
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={rec.percentage} 
                      sx={{ mb: 2, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {rec.reason}
                    </Typography>
                    
                    <Button
                      size="small"
                      onClick={() => toggleResultExpansion(rec.stream)}
                      endIcon={expandedResults[rec.stream] ? <ExpandLess /> : <ExpandMore />}
                    >
                      View Courses
                    </Button>
                    
                    <Collapse in={expandedResults[rec.stream]}>
                      <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Suggested Courses:
                        </Typography>
                        {rec.suggestedCourses.map((course, i) => (
                          <Chip
                            key={i}
                            label={course}
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Detailed Analysis */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Psychology sx={{ mr: 1, color: '#2e7d32' }} />
                    Your Strengths
                  </Typography>
                  <List dense>
                    {results.analysis.strengths.map((strength, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircle sx={{ fontSize: 20, color: '#2e7d32' }} />
                        </ListItemIcon>
                        <ListItemText primary={strength} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Lightbulb sx={{ mr: 1, color: '#ed6c02' }} />
                    Suggestions
                  </Typography>
                  <List dense>
                    {results.analysis.suggestions.map((suggestion, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Lightbulb sx={{ fontSize: 20, color: '#ed6c02' }} />
                        </ListItemIcon>
                        <ListItemText primary={suggestion} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Timeline sx={{ mr: 1, color: '#9c27b0' }} />
                    Next Steps
                  </Typography>
                  <List dense>
                    {results.analysis.nextSteps.map((step, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Assignment sx={{ fontSize: 20, color: '#9c27b0' }} />
                        </ListItemIcon>
                        <ListItemText primary={step} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="outlined"
              size="large"
              startIcon={<WorkOutline />}
              onClick={() => navigate('/colleges')}
            >
              Find Colleges
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Quiz />}
              onClick={restartQuiz}
            >
              Retake Quiz
            </Button>
          </Box>
        </Box>
      </DashboardLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentResponse = responses.find(r => r.questionId === currentQuestion?.questionId);
  const progress = questions.length > 0 ? (currentQuestionIndex / questions.length) * 100 : 0;

  return (
    <DashboardLayout title="Career Guidance Quiz">
      <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
        {/* Progress Header */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6">
                Question {currentQuestionIndex + 1} of {questions.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {Math.round(progress)}% Complete
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Chip 
                label={currentQuestion?.category} 
                color="primary" 
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>
            
            <Typography variant="h5" gutterBottom fontWeight="medium">
              {currentQuestion?.question}
            </Typography>

            <FormControl component="fieldset" fullWidth sx={{ mt: 3 }}>
              {currentQuestion?.type === 'multiple-choice' ? (
                <RadioGroup
                  value={currentResponse?.selectedOption || ''}
                  onChange={(e) => handleAnswerSelect(currentQuestion.questionId, e.target.value)}
                >
                  {currentQuestion.options.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={option.text}
                      control={<Radio />}
                      label={
                        <Typography variant="body1" sx={{ py: 1 }}>
                          {option.text}
                        </Typography>
                      }
                      sx={{ 
                        mb: 1,
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                        borderRadius: 1,
                        mx: 0
                      }}
                    />
                  ))}
                </RadioGroup>
              ) : (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Rate from 1 (Strongly Disagree) to 5 (Strongly Agree)
                  </Typography>
                  <RadioGroup
                    row
                    value={currentResponse?.rating?.toString() || ''}
                    onChange={(e) => handleRatingSelect(currentQuestion.questionId, parseInt(e.target.value))}
                    sx={{ justifyContent: 'center', mt: 2 }}
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <FormControlLabel
                        key={rating}
                        value={rating.toString()}
                        control={<Radio />}
                        label={rating.toString()}
                        labelPlacement="bottom"
                      />
                    ))}
                  </RadioGroup>
                </Box>
              )}
            </FormControl>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <Box display="flex" justifyContent="between" gap={2}>
          <Button
            variant="outlined"
            onClick={goToPrevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              variant="contained"
              size="large"
              onClick={submitQuiz}
              disabled={!currentResponse || submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircle />}
            >
              {submitting ? 'Submitting...' : 'Complete Quiz'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={goToNextQuestion}
              disabled={!currentResponse}
            >
              Next
            </Button>
          )}
        </Box>

        {/* Question Navigation Stepper */}
        <Box sx={{ mt: 4, display: { xs: 'none', md: 'block' } }}>
          <Stepper activeStep={currentQuestionIndex} alternativeLabel>
            {questions.map((question, index) => {
              const hasResponse = responses.some(r => r.questionId === question.questionId);
              return (
                <Step 
                  key={question.questionId}
                  completed={hasResponse && index < currentQuestionIndex}
                >
                  <StepLabel>
                    <Typography variant="caption">
                      Q{index + 1}
                    </Typography>
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default CareerQuiz;