import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Divider,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Alert,
  CircularProgress,
  LinearProgress,
  Collapse,
  IconButton,
} from '@mui/material';
import { Edit, Save, Cancel, Person, Quiz, TrendingUp, School, ExpandMore, ExpandLess, PhotoCamera, Delete } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';

interface StudentProfile {
  // Personal Information
  id: number;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  profilePicture?: string;
  profilePictureUrl?: string;
  
  // Educational Background
  currentClass?: string;
  schoolName?: string;
  schoolBoard?: string;
  previousMarks?: {
    class10?: number;
    class12?: number;
  };
  
  // Interests and Preferences
  interestedStreams?: string[];
  preferredLocation?: string[];
  careerGoals?: string;
  hobbies?: string[];
  
  // Additional Info
  fatherName?: string;
  motherName?: string;
  parentOccupation?: string;
  familyIncome?: string;
  
  // Career Quiz Results
  careerQuizResults?: {
    lastTaken?: string;
    recommendations?: Array<{
      stream: string;
      streamName: string;
      percentage: number;
      reason: string;
      suggestedCourses: string[];
      careerPaths: string[];
    }>;
    topRecommendation?: {
      stream: string;
      percentage: number;
    };
    quizId?: string;
  };
  
  // Profile completion
  completionPercentage?: number;
}

const STREAMS = [
  'Engineering', 'Medical', 'Commerce', 'Arts', 'Science', 'Law', 
  'Management', 'Design', 'Architecture', 'Pharmacy', 'Agriculture',
  'Mass Communication', 'Hotel Management', 'Fashion Design'
];

const LOCATIONS = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur',
  'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara'
];

const HOBBIES = [
  'Reading', 'Sports', 'Music', 'Dance', 'Art', 'Photography',
  'Coding', 'Gaming', 'Traveling', 'Cooking', 'Writing', 'Debate'
];

const StudentProfile = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedQuizResults, setExpandedQuizResults] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = sessionStorage.getItem('token');
      console.log('Fetching profile with token:', token ? 'Token exists' : 'No token');
      console.log('API URL:', `${import.meta.env.VITE_API_URL}/api/student/profile`);
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/student/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Profile fetch response:', response.data);
      setProfile(response.data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Initialize with basic user data if profile doesn't exist
      setProfile({
        id: typeof user?.id === 'string' ? parseInt(user.id) : (user?.id || 0),
        name: user?.name || '',
        email: user?.email || '',
        interestedStreams: [],
        preferredLocation: [],
        hobbies: [],
        previousMarks: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const token = sessionStorage.getItem('token');
      console.log('Saving profile:', profile);
      console.log('API URL:', `${import.meta.env.VITE_API_URL}/api/student/profile`);
      
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/student/profile`, profile, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Profile save response:', response.data);
      
      // Update profile with the latest data including completion percentage
      if (response.data.profile) {
        setProfile(response.data.profile);
        
        // Dispatch custom event to notify Dashboard to refresh stats
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      }
      
      showSuccess('✅ Profile updated successfully!');
      setEditMode(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        showError('❌ Session expired. Please login again.');
      } else if (error.response?.status === 403) {
        showError('❌ Access denied. Please check your permissions.');
      } else if (error.response?.data?.error) {
        showError(`❌ ${error.response.data.error}`);
      } else {
        showError('❌ Failed to update profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    fetchProfile(); // Reset to original data
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showError('❌ Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('❌ Image size should be less than 5MB');
      return;
    }

    setUploadingPicture(true);
    try {
      const token = sessionStorage.getItem('token');
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/student/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Profile picture upload response:', response.data);
      
      // Update profile state with new picture
      if (profile) {
        setProfile({
          ...profile,
          profilePicture: response.data.profilePicture,
          profilePictureUrl: response.data.profilePictureUrl
        });
      }

      showSuccess('✅ Profile picture updated successfully!');
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('profilePictureUpdate', {
        detail: { profilePictureUrl: response.data.profilePictureUrl }
      }));
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      if (error.response?.data?.error) {
        showError(`❌ ${error.response.data.error}`);
      } else {
        showError('❌ Failed to upload profile picture. Please try again.');
      }
    } finally {
      setUploadingPicture(false);
      // Clear the input value to allow re-uploading the same file
      event.target.value = '';
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!profile?.profilePicture) return;

    setUploadingPicture(true);
    try {
      const token = sessionStorage.getItem('token');
      
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/student/profile-picture`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Profile picture deletion response:', response.data);
      
      // Update profile state to remove picture
      setProfile({
        ...profile,
        profilePicture: undefined,
        profilePictureUrl: undefined
      });

      showSuccess('✅ Profile picture removed successfully!');
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('profilePictureUpdate', {
        detail: { profilePictureUrl: null }
      }));
    } catch (error: any) {
      console.error('Error removing profile picture:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.data?.error) {
        showError(`❌ ${error.response.data.error}`);
      } else if (error.response?.status === 404) {
        showError('❌ No profile picture found to delete.');
      } else if (error.response?.status === 401) {
        showError('❌ Authentication failed. Please login again.');
      } else if (error.response?.status >= 500) {
        showError('❌ Server error. Please try again later.');
      } else {
        showError(`❌ Failed to remove profile picture. Error: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleInputChange = (field: keyof StudentProfile, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handleMarksChange = (exam: 'class10' | 'class12', value: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      previousMarks: {
        ...profile.previousMarks,
        [exam]: value ? parseFloat(value) : undefined
      }
    });
  };

  const handleMultiSelectChange = (field: keyof StudentProfile, event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    handleInputChange(field, value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Alert severity="error">
        Failed to load profile. Please refresh the page.
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={{ position: 'relative' }}>
                <Avatar 
                  sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
                  src={profile.profilePictureUrl ? `${import.meta.env.VITE_API_URL}${profile.profilePictureUrl}` : undefined}
                >
                  {!profile.profilePictureUrl && <Person sx={{ fontSize: 40 }} />}
                </Avatar>
                {editMode && (
                  <Box sx={{ position: 'absolute', top: -8, right: -8, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="profile-picture-upload"
                      type="file"
                      onChange={handleProfilePictureUpload}
                    />
                    <label htmlFor="profile-picture-upload">
                      <IconButton
                        color="primary"
                        component="span"
                        size="small"
                        disabled={uploadingPicture}
                        sx={{ 
                          bgcolor: 'background.paper', 
                          boxShadow: 1,
                          '&:hover': { bgcolor: 'grey.100' }
                        }}
                      >
                        {uploadingPicture ? <CircularProgress size={16} /> : <PhotoCamera fontSize="small" />}
                      </IconButton>
                    </label>
                    {profile.profilePictureUrl && (
                      <IconButton
                        color="error"
                        size="small"
                        onClick={handleDeleteProfilePicture}
                        disabled={uploadingPicture}
                        sx={{ 
                          bgcolor: 'background.paper', 
                          boxShadow: 1,
                          '&:hover': { bgcolor: 'grey.100' }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                )}
              </Box>
              <Box>
                <Typography variant="h4" color="primary">
                  {profile.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {profile.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Student ID: {profile.id}
                </Typography>
                {profile.completionPercentage !== undefined && (
                  <Box sx={{ mt: 2, width: 300 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Profile Completion
                      </Typography>
                      <Typography variant="body2" color="primary" fontWeight="bold">
                        {profile.completionPercentage}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={profile.completionPercentage} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          bgcolor: profile.completionPercentage < 50 ? 'error.main' : 
                                   profile.completionPercentage < 80 ? 'warning.main' : 'success.main'
                        }
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
            <Box>
              {!editMode ? (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? <CircularProgress size={20} /> : 'Save'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profile.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={profile.dateOfBirth || ''}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    disabled={!editMode}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={profile.gender || ''}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      label="Gender"
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={2}
                    value={profile.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="City"
                    value={profile.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="State"
                    value={profile.state || ''}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Pin Code"
                    value={profile.pincode || ''}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Family Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Family Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Father's Name"
                    value={profile.fatherName || ''}
                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mother's Name"
                    value={profile.motherName || ''}
                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Parent's Occupation"
                    value={profile.parentOccupation || ''}
                    onChange={(e) => handleInputChange('parentOccupation', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Family Income</InputLabel>
                    <Select
                      value={profile.familyIncome || ''}
                      onChange={(e) => handleInputChange('familyIncome', e.target.value)}
                      label="Family Income"
                    >
                      <MenuItem value="Below 2 Lakhs">Below ₹2 Lakhs</MenuItem>
                      <MenuItem value="2-5 Lakhs">₹2-5 Lakhs</MenuItem>
                      <MenuItem value="5-10 Lakhs">₹5-10 Lakhs</MenuItem>
                      <MenuItem value="10-20 Lakhs">₹10-20 Lakhs</MenuItem>
                      <MenuItem value="Above 20 Lakhs">Above ₹20 Lakhs</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Educational Background */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Educational Background
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Current Class/Year"
                    value={profile.currentClass || ''}
                    onChange={(e) => handleInputChange('currentClass', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>School Board</InputLabel>
                    <Select
                      value={profile.schoolBoard || ''}
                      onChange={(e) => handleInputChange('schoolBoard', e.target.value)}
                      label="School Board"
                    >
                      <MenuItem value="CBSE">CBSE</MenuItem>
                      <MenuItem value="ICSE">ICSE</MenuItem>
                      <MenuItem value="State Board">State Board</MenuItem>
                      <MenuItem value="IB">International Baccalaureate</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="School Name"
                    value={profile.schoolName || ''}
                    onChange={(e) => handleInputChange('schoolName', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Class 10 Marks (%)"
                    type="number"
                    value={profile.previousMarks?.class10 || ''}
                    onChange={(e) => handleMarksChange('class10', e.target.value)}
                    disabled={!editMode}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Class 12 Marks (%)"
                    type="number"
                    value={profile.previousMarks?.class12 || ''}
                    onChange={(e) => handleMarksChange('class12', e.target.value)}
                    disabled={!editMode}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Interests and Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Interests & Preferences
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Interested Streams</InputLabel>
                    <Select
                      multiple
                      value={profile.interestedStreams || []}
                      onChange={(e) => handleMultiSelectChange('interestedStreams', e)}
                      input={<OutlinedInput label="Interested Streams" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    >
                      {STREAMS.map((stream) => (
                        <MenuItem key={stream} value={stream}>
                          {stream}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Preferred Locations</InputLabel>
                    <Select
                      multiple
                      value={profile.preferredLocation || []}
                      onChange={(e) => handleMultiSelectChange('preferredLocation', e)}
                      input={<OutlinedInput label="Preferred Locations" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    >
                      {LOCATIONS.map((location) => (
                        <MenuItem key={location} value={location}>
                          {location}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Hobbies</InputLabel>
                    <Select
                      multiple
                      value={profile.hobbies || []}
                      onChange={(e) => handleMultiSelectChange('hobbies', e)}
                      input={<OutlinedInput label="Hobbies" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    >
                      {HOBBIES.map((hobby) => (
                        <MenuItem key={hobby} value={hobby}>
                          {hobby}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Career Goals"
                    multiline
                    rows={3}
                    value={profile.careerGoals || ''}
                    onChange={(e) => handleInputChange('careerGoals', e.target.value)}
                    disabled={!editMode}
                    placeholder="Describe your career aspirations and goals..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Career Quiz Results */}
        {profile.careerQuizResults && profile.careerQuizResults.recommendations && profile.careerQuizResults.recommendations.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Quiz color="primary" />
                    <Typography variant="h6" color="primary">
                      Career Quiz Results
                    </Typography>
                    {profile.careerQuizResults.topRecommendation && (
                      <Chip 
                        label={`Top Match: ${profile.careerQuizResults.topRecommendation.percentage}%`}
                        color="success"
                        variant="filled"
                        size="small"
                      />
                    )}
                  </Box>
                  <Button
                    onClick={() => setExpandedQuizResults(!expandedQuizResults)}
                    endIcon={expandedQuizResults ? <ExpandLess /> : <ExpandMore />}
                    size="small"
                  >
                    {expandedQuizResults ? 'Show Less' : 'View Details'}
                  </Button>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                {profile.careerQuizResults.lastTaken && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Last taken: {new Date(profile.careerQuizResults.lastTaken).toLocaleDateString()}
                  </Typography>
                )}

                {/* Top 3 Recommendations Summary */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {profile.careerQuizResults.recommendations
                    .slice(0, 3)
                    .map((recommendation, index) => (
                    <Grid item xs={12} sm={4} key={recommendation.stream}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                            <TrendingUp fontSize="small" color="primary" />
                            <Typography variant="subtitle2" color="primary">
                              #{index + 1} Match
                            </Typography>
                          </Box>
                          <Typography variant="h6" gutterBottom>
                            {recommendation.streamName}
                          </Typography>
                          <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
                            <Typography variant="h4" color="success.main">
                              {recommendation.percentage}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={recommendation.percentage} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                bgcolor: index === 0 ? 'success.main' : 
                                        index === 1 ? 'info.main' : 'warning.main'
                              }
                            }}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {recommendation.careerPaths.slice(0, 2).join(', ')}
                            {recommendation.careerPaths.length > 2 && '...'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Collapse in={expandedQuizResults}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <School />
                      Detailed Recommendations
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {profile.careerQuizResults.recommendations.map((recommendation) => (
                        <Grid item xs={12} md={6} key={recommendation.stream}>
                          <Card variant="outlined">
                            <CardContent>
                              <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                                <Typography variant="h6" color="primary">
                                  {recommendation.streamName}
                                </Typography>
                                <Typography variant="h6" color="success.main">
                                  {recommendation.percentage}%
                                </Typography>
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {recommendation.reason}
                              </Typography>

                              {recommendation.suggestedCourses && recommendation.suggestedCourses.length > 0 && (
                                <Box mb={2}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Suggested Courses:
                                  </Typography>
                                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                                    {recommendation.suggestedCourses.slice(0, 6).map((course, i) => (
                                      <Chip
                                        key={i}
                                        label={course}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                      />
                                    ))}
                                    {recommendation.suggestedCourses.length > 6 && (
                                      <Chip
                                        label={`+${recommendation.suggestedCourses.length - 6} more`}
                                        size="small"
                                        variant="outlined"
                                        color="default"
                                      />
                                    )}
                                  </Box>
                                </Box>
                              )}

                              {recommendation.careerPaths && recommendation.careerPaths.length > 0 && (
                                <Box>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Career Paths:
                                  </Typography>
                                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                                    {recommendation.careerPaths.map((path, i) => (
                                      <Chip
                                        key={i}
                                        label={path}
                                        size="small"
                                        variant="filled"
                                        color="secondary"
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default StudentProfile;