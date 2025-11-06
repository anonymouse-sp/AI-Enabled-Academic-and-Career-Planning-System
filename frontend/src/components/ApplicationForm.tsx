import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Assignment, School, Person } from '@mui/icons-material';
import axios from 'axios';

interface ApplicationFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date | null;
  gender: string;
  nationality: string;
  
  // Academic Information
  currentEducation: string;
  institution: string;
  percentage: number | '';
  graduationYear: number | '';
  
  // Course Information
  preferredCourse: string;
  alternativeCourse: string;
  
  // Additional Information
  extracurriculars: string;
  achievements: string;
  statement: string;
  
  // Documents (file names)
  marksheets: string;
  certificates: string;
}

interface ApplicationFormProps {
  open: boolean;
  onClose: () => void;
  collegeId: string;
  collegeName: string;
  courses: string[] | Array<{name: string; degree: string; duration: string; seats?: number; eligibility?: string;}>;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  open,
  onClose,
  collegeId,
  collegeName,
  courses,
}) => {
  const [formData, setFormData] = useState<ApplicationFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: null,
    gender: '',
    nationality: 'Indian',
    currentEducation: '',
    institution: '',
    percentage: '',
    graduationYear: '',
    preferredCourse: '',
    alternativeCourse: '',
    extracurriculars: '',
    achievements: '',
    statement: '',
    marksheets: '',
    certificates: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleInputChange = (field: keyof ApplicationFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target ? event.target.value : event;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setMessage('');

      console.log('Starting form submission...');
      console.log('College ID:', collegeId);
      console.log('College Name:', collegeName);
      console.log('Form Data:', formData);

      // Validation
      const requiredFields = [
        'firstName', 'lastName', 'email', 'phone',
        'gender', 'currentEducation', 'institution', 'percentage',
        'graduationYear', 'preferredCourse', 'statement'
      ];

      const missingFields = requiredFields.filter(field => {
        const value = formData[field as keyof ApplicationFormData];
        return !value || value === '';
      });

      // Check date of birth separately
      if (!formData.dateOfBirth) {
        missingFields.push('dateOfBirth');
      }

      if (missingFields.length > 0) {
        console.log('Missing fields:', missingFields);
        setMessage('Please fill in all required fields');
        setMessageType('error');
        setLoading(false);
        return;
      }

      // Check statement length
      if (!formData.statement || formData.statement.trim().length < 50) {
        setMessage('Personal statement must be at least 50 characters long');
        setMessageType('error');
        setLoading(false);
        return;
      }

      // Submit application
      const token = sessionStorage.getItem('token');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const apiUrl = import.meta.env.VITE_API_URL;
      console.log('API URL:', apiUrl);

      const applicationData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString() : '',
        collegeId,
        collegeName,
        applicationDate: new Date().toISOString(),
        status: 'pending'
      };

      console.log('Submitting application data:', applicationData);

      const response = await axios.post(
        `${apiUrl}/api/applications/submit`,
        applicationData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Application submitted successfully:', response.data);
      setMessage('Application submitted successfully!');
      setMessageType('success');
      
      // Close dialog after delay
      setTimeout(() => {
        onClose();
        setMessage('');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dateOfBirth: null,
          gender: '',
          nationality: 'Indian',
          currentEducation: '',
          institution: '',
          percentage: '',
          graduationYear: '',
          preferredCourse: '',
          alternativeCourse: '',
          extracurriculars: '',
          achievements: '',
          statement: '',
          marksheets: '',
          certificates: '',
        });
      }, 2000);

    } catch (error: any) {
      console.error('Error submitting application:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error config:', error.config);
      
      setMessage(error.response?.data?.message || error.message || 'Failed to submit application');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Assignment color="primary" />
            <Box>
              <Typography variant="h6">Apply to {collegeName}</Typography>
              <Typography variant="body2" color="text.secondary">
                Fill out this form to submit your application
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          {message && (
            <Alert severity={messageType} sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Personal Information Section */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Person color="primary" />
                <Typography variant="h6">Personal Information</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const dateValue = e.target.value ? new Date(e.target.value) : null;
                  handleInputChange('dateOfBirth')(dateValue);
                }}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={handleInputChange('gender')}
                  label="Gender"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nationality"
                value={formData.nationality}
                onChange={handleInputChange('nationality')}
              />
            </Grid>

            {/* Academic Information Section */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 2 }}>
                <School color="primary" />
                <Typography variant="h6">Academic Information</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Current Education Level</InputLabel>
                <Select
                  value={formData.currentEducation}
                  onChange={handleInputChange('currentEducation')}
                  label="Current Education Level"
                >
                  <MenuItem value="12th Grade">12th Grade</MenuItem>
                  <MenuItem value="Diploma">Diploma</MenuItem>
                  <MenuItem value="Bachelor's">Bachelor's Degree</MenuItem>
                  <MenuItem value="Master's">Master's Degree</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Institution"
                value={formData.institution}
                onChange={handleInputChange('institution')}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Percentage/CGPA"
                type="number"
                value={formData.percentage}
                onChange={handleInputChange('percentage')}
                required
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Graduation Year</InputLabel>
                <Select
                  value={formData.graduationYear}
                  onChange={handleInputChange('graduationYear')}
                  label="Graduation Year"
                >
                  {years.map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Course Selection */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Preferred Course</InputLabel>
                <Select
                  value={formData.preferredCourse}
                  onChange={handleInputChange('preferredCourse')}
                  label="Preferred Course"
                >
                  {courses.map((course, index) => {
                    const courseName = typeof course === 'string' ? course : course.name;
                    return (
                      <MenuItem key={index} value={courseName}>{courseName}</MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Alternative Course</InputLabel>
                <Select
                  value={formData.alternativeCourse}
                  onChange={handleInputChange('alternativeCourse')}
                  label="Alternative Course"
                >
                  {courses.map((course, index) => {
                    const courseName = typeof course === 'string' ? course : course.name;
                    return (
                      <MenuItem key={`alt-${index}`} value={courseName}>{courseName}</MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Extracurricular Activities"
                multiline
                rows={3}
                value={formData.extracurriculars}
                onChange={handleInputChange('extracurriculars')}
                helperText="List your sports, clubs, volunteer work, etc."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Achievements & Awards"
                multiline
                rows={3}
                value={formData.achievements}
                onChange={handleInputChange('achievements')}
                helperText="Academic awards, competitions, certifications, etc."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Personal Statement"
                multiline
                rows={4}
                value={formData.statement}
                onChange={handleInputChange('statement')}
                required
                helperText={`${formData.statement.length}/50 minimum characters. Why do you want to join this college? (Max 500 words)`}
                error={formData.statement.length > 0 && formData.statement.trim().length < 50}
                sx={{
                  '& .MuiFormHelperText-root': {
                    color: formData.statement.length > 0 && formData.statement.trim().length < 50 ? 'error.main' : 'text.secondary'
                  }
                }}
                inputProps={{ maxLength: 2500 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                * Required fields. You will be able to upload documents after submitting this form.
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Assignment />}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default ApplicationForm;