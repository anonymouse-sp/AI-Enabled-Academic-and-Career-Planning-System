import { Box, Typography, Paper, Chip, Stack, Grid, Divider } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { College } from '../../types/college';

interface DepartmentsTabProps {
  college: College;
}

export const DepartmentsTab = ({ college }: DepartmentsTabProps) => {

  // Helper function to get degree level color
  const getDegreeColor = (degree: string) => {
    if (degree.includes('Ph.D') || degree.includes('Doctorate')) return 'error';
    if (degree.includes('M.') || degree.includes('Master') || degree.includes('MBA') || degree.includes('MCA')) return 'warning';
    if (degree.includes('B.') || degree.includes('Bachelor')) return 'success';
    if (degree.includes('Diploma') || degree.includes('Certificate')) return 'info';
    return 'default';
  };

  // Helper function to get eligibility criteria
  const getEligibilityCriteria = (course: any) => {
    if (typeof course === 'object' && course.eligibility) {
      return course.eligibility;
    }
    
    // Default eligibility based on degree type
    const degree = typeof course === 'object' ? course.degree : '';
    if (degree.includes('Ph.D')) return '12th + Bachelor\'s + Master\'s Degree + Research Experience';
    if (degree.includes('M.') || degree.includes('Master') || degree.includes('MBA') || degree.includes('MCA')) return '12th + Bachelor\'s Degree in relevant field';
    if (degree.includes('B.') || degree.includes('Bachelor')) return '12th Pass with minimum 50% marks';
    if (degree.includes('Diploma')) return '10th Pass or equivalent';
    return '12th Pass or equivalent';
  };

  // Helper function to calculate total semesters
  const getTotalSemesters = (duration: string) => {
    const years = parseFloat(duration) || 4;
    return years * 2;
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {college.courses.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No Department Information Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This college hasn't provided detailed course information yet.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {college.courses.map((course, index) => {
            const courseData = typeof course === 'object' ? course : { name: course, degree: 'Bachelor', duration: '4 Years' };
            const courseName = courseData.name || (typeof course === 'string' ? course : 'Unknown Course');
            const degree = courseData.degree || 'Bachelor';
            const duration = courseData.duration || '4 Years';
            const seats = courseData.seats;
            const eligibility = getEligibilityCriteria(courseData);
            const totalSemesters = getTotalSemesters(duration);

            return (
              <Paper elevation={2} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }} key={index}>
                {/* Header Section */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {courseName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <EmojiEventsIcon color="warning" fontSize="small" />
                      <Chip 
                        label={degree} 
                        color={getDegreeColor(degree)}
                        size="medium"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                  </Box>
                  <Chip 
                    label="Full-time Program" 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Quick Info Section */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 2, color: 'primary.contrastText' }}>
                      <AccessTimeIcon sx={{ fontSize: 30, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {duration}
                      </Typography>
                      <Typography variant="caption">
                        Duration
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2, color: 'success.contrastText' }}>
                      <GroupIcon sx={{ fontSize: 30, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {seats ? seats : 'N/A'}
                      </Typography>
                      <Typography variant="caption">
                        Seats/Year
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 2, color: 'info.contrastText' }}>
                      <MenuBookIcon sx={{ fontSize: 30, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {totalSemesters}
                      </Typography>
                      <Typography variant="caption">
                        Semesters
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Detailed Information */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={1} sx={{ p: 2, height: '100%', bgcolor: 'grey.50' }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon color="success" />
                        Eligibility Criteria
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {eligibility}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={1} sx={{ p: 2, height: '100%', bgcolor: 'grey.50' }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmojiEventsIcon color="warning" />
                        Program Highlights
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                          • Industry-relevant curriculum
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • Experienced faculty members
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • Practical training & internships
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • {degree.includes('Bachelor') ? 'Career-focused education' : degree.includes('Master') ? 'Advanced specialization' : 'Research opportunities'}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
};