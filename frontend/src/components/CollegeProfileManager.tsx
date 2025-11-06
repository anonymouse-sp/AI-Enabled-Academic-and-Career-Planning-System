import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  HomeWork as FacilitiesIcon,
  TrendingUp as PlacementIcon,
  EmojiEvents as RankingIcon,
  Share as SocialIcon,
  PhotoLibrary as PhotoLibraryIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Course {
  name: string;
  degree: string;
  duration: string;
  seats?: number;
  eligibility?: string;
}

interface CollegeProfileData {
  collegeName: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  establishedYear: number | '';
  affiliatedTo: string;
  type: string;
  courses: Course[];
  tuition: number | '';
  accommodation: number | '';
  otherFees: number | '';
  facilities: string[];
  averagePackage: number | '';
  highestPackage: number | '';
  placementRate: number | '';
  topRecruiters: string[];
  nationalRanking: number | '';
  facebook: string;
  twitter: string;
  linkedin: string;
  instagram: string;
  youtube: string;
  profilePicture?: string;
  campusGallery?: Array<{
    url: string;
    caption: string;
    uploadedAt: string;
    filename: string;
    _id?: string;
  }>;
  completionPercentage?: number;
}

const CollegeProfileManager: React.FC = () => {
  const {} = useAuth();
  const [profile, setProfile] = useState<CollegeProfileData>({
    collegeName: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    establishedYear: '',
    affiliatedTo: '',
    type: '',
    courses: [],
    tuition: '',
    accommodation: '',
    otherFees: '',
    facilities: [],
    averagePackage: '',
    highestPackage: '',
    placementRate: '',
    topRecruiters: [],
    nationalRanking: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: '',
    youtube: '',
    profilePicture: '',
    campusGallery: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [newCourse, setNewCourse] = useState<Course>({ name: '', degree: '', duration: '' });
  const [newRecruiter, setNewRecruiter] = useState('');
  const [galleryImages, setGalleryImages] = useState<FileList | null>(null);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const collegeTypes = [
    'Government', 'Private', 'Autonomous', 'Deemed', 'Central University', 'State University'
  ];

  const degreeTypes = [
    'Certificate', 'Diploma', 'B.Tech', 'B.E', 'B.Sc', 'B.Com', 'B.A', 
    'M.Tech', 'M.E', 'M.Sc', 'M.Com', 'M.A', 'MBA', 'MCA', 'Ph.D', 'Other'
  ];

  const facilityOptions = [
    'Library', 'Laboratory', 'Sports Complex', 'Gym', 'Swimming Pool', 
    'Hostel', 'Cafeteria', 'Medical Center', 'Wi-Fi Campus', 'Auditorium',
    'Computer Center', 'Placement Cell', 'Research Center', 'Transportation',
    'Banking', 'ATM', 'Parking', 'Security', 'Canteen', 'Guest House'
  ];

  // Note: Completion percentage calculation is now handled entirely by the backend
  // This ensures consistency between dashboard and profile displays

  useEffect(() => {
    // Test API connection on component mount
    const testConnection = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/health`);
        console.log('API connection test successful:', response.data);
      } catch (error) {
        console.error('API connection test failed:', error);
      }
    };
    
    testConnection();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const token = sessionStorage.getItem('token');
      if (!token) {
        setMessage('No authentication token found. Please login again.');
        setMessageType('error');
        setLoading(false);
        return;
      }
      
      console.log('Fetching profile with token:', token.substring(0, 20) + '...');
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/college/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Fetch profile response:', response.data);
      
      const data = response.data;
      console.log('Profile completion from backend:', data.completionPercentage);
      const newProfile = {
        collegeName: data.collegeName || '',
        description: data.description || '',
        address: data.location?.address || '',
        city: data.location?.city || '',
        state: data.location?.state || '',
        pincode: data.location?.pincode || '',
        phone: data.contact?.phone || '',
        email: data.contact?.email || '',
        website: data.contact?.website || '',
        establishedYear: data.establishedYear || '',
        affiliatedTo: data.affiliatedTo || '',
        type: data.type || '',
        courses: data.courses || [],
        tuition: data.fees?.tuition || '',
        accommodation: data.fees?.accommodation || '',
        otherFees: data.fees?.other || '',
        facilities: data.facilities || [],
        averagePackage: data.placements?.averagePackage || '',
        highestPackage: data.placements?.highestPackage || '',
        placementRate: data.placements?.placementRate || '',
        topRecruiters: data.placements?.topRecruiters || [],
        nationalRanking: data.rankings?.national || '',
        facebook: data.socialMedia?.facebook || '',
        twitter: data.socialMedia?.twitter || '',
        linkedin: data.socialMedia?.linkedin || '',
        instagram: data.socialMedia?.instagram || '',
        youtube: data.socialMedia?.youtube || '',
        profilePicture: data.profilePicture || '',
        campusGallery: data.campusGallery || [],
        completionPercentage: data.completionPercentage || 0,
      };
      // Always prioritize backend calculation over local calculation
      setProfile(newProfile);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to fetch profile';
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.data?.details) {
        errorMessage += ': ' + error.response.data.details;
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Basic validation
      if (!profile.collegeName || !profile.collegeName.trim()) {
        setMessage('College name is required');
        setMessageType('error');
        setSaving(false);
        return;
      }
      
      const token = sessionStorage.getItem('token');
      if (!token) {
        setMessage('No authentication token found. Please login again.');
        setMessageType('error');
        setSaving(false);
        return;
      }
      
      // Test connection first
      console.log('Testing API connection to:', `${import.meta.env.VITE_API_URL}/api/college/profile`);
      
      // Prepare data for backend with proper structure to match database schema
      const dataToSend = {
        collegeName: profile.collegeName,
        description: profile.description,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
        phone: profile.phone,
        email: profile.email,
        website: profile.website,
        establishedYear: profile.establishedYear || null,
        affiliatedTo: profile.affiliatedTo,
        type: profile.type,
        courses: profile.courses,
        tuition: profile.tuition || 0,
        accommodation: profile.accommodation || 0,
        otherFees: profile.otherFees || 0,
        facilities: profile.facilities,
        averagePackage: profile.averagePackage || 0,
        highestPackage: profile.highestPackage || 0,
        placementRate: profile.placementRate || 0,
        topRecruiters: profile.topRecruiters,
        nationalRanking: profile.nationalRanking || null,
        facebook: profile.facebook,
        twitter: profile.twitter,
        linkedin: profile.linkedin,
        instagram: profile.instagram,
        youtube: profile.youtube,
        profilePicture: profile.profilePicture,
      };
      
      // Log the profile data being sent
      console.log('Saving profile data:', dataToSend);
      console.log('API URL:', `${import.meta.env.VITE_API_URL}/api/college/profile`);
      console.log('Authorization header:', `Bearer ${token.substring(0, 20)}...`);
      
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/college/profile`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000, // 15 second timeout
        }
      );
      
      console.log('Save response:', response.data);
      setMessage('Profile saved successfully!');
      setMessageType('success');
      
      // Force refresh profile data from backend to get updated completion percentage
      await fetchProfile();
      
      // Force dashboard to refresh immediately with updated data
      window.dispatchEvent(new CustomEvent('profileUpdated', {
        detail: { 
          profilePicture: profile.profilePicture,
          completionPercentage: response.data.profile.completionPercentage
        }
      }));
    } catch (error: any) {
      console.error('Error saving profile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // More detailed error message
      let errorMessage = 'Failed to save profile';
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please ensure the backend server is running on port 5001.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to perform this action.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred while saving profile.';
      } else if (error.response?.data?.details) {
        errorMessage += ': ' + error.response.data.details;
      } else if (error.response?.data?.error) {
        errorMessage += ': ' + error.response.data.error;
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CollegeProfileData, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select a valid image file');
        setMessageType('error');
        return;
      }
      
      // Validate file size (max 3MB to account for base64 encoding overhead)
      if (file.size > 3 * 1024 * 1024) {
        setMessage('Image size should be less than 3MB');
        setMessageType('error');
        return;
      }
      
      // Compress and create preview
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 800px width/height while maintaining aspect ratio)
        const maxSize = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8); // 80% quality
        
        setImagePreview(compressedDataUrl);
        setProfile(prev => ({ ...prev, profilePicture: compressedDataUrl }));
        
        // Immediately update dashboard profile picture
        window.dispatchEvent(new CustomEvent('profileUpdated', {
          detail: { profilePicture: compressedDataUrl }
        }));
      };
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = async () => {
    if (!profile.profilePicture) {
      // If there's only a preview, just clear it
      setImagePreview('');
      setProfile(prev => ({ ...prev, profilePicture: '' }));
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/college/profile-picture`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('College profile picture deletion response:', response.data);
      
      // Clear both preview and profile picture
      setImagePreview('');
      setProfile(prev => ({ ...prev, profilePicture: '' }));
      
      // Immediately update dashboard profile picture
      window.dispatchEvent(new CustomEvent('profileUpdated', {
        detail: { profilePicture: '' }
      }));

      setMessage('✅ Profile picture removed successfully!');
      setMessageType('success');
    } catch (error: any) {
      console.error('Error removing college profile picture:', error);
      if (error.response?.data?.error) {
        setMessage(`❌ ${error.response.data.error}`);
      } else {
        setMessage('❌ Failed to remove profile picture. Please try again.');
      }
      setMessageType('error');
    }
  };

  const addCourse = () => {
    if (newCourse.name && newCourse.degree && newCourse.duration) {
      setProfile(prev => ({
        ...prev,
        courses: [...prev.courses, newCourse]
      }));
      setNewCourse({ name: '', degree: '', duration: '' });
    }
  };

  const removeCourse = (index: number) => {
    setProfile(prev => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== index)
    }));
  };

  const addRecruiter = () => {
    if (newRecruiter && !profile.topRecruiters.includes(newRecruiter)) {
      setProfile(prev => ({
        ...prev,
        topRecruiters: [...prev.topRecruiters, newRecruiter]
      }));
      setNewRecruiter('');
    }
  };

  const removeRecruiter = (recruiter: string) => {
    setProfile(prev => ({
      ...prev,
      topRecruiters: prev.topRecruiters.filter(r => r !== recruiter)
    }));
  };

  // Campus Gallery Management Functions
  const handleGalleryUpload = async () => {
    if (!galleryImages || galleryImages.length === 0) {
      setMessage('Please select images to upload');
      setMessageType('error');
      return;
    }

    try {
      setGalleryUploading(true);
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        setMessage('Authentication required. Please login again.');
        setMessageType('error');
        return;
      }

      const formData = new FormData();
      Array.from(galleryImages).forEach(file => {
        formData.append('galleryImages', file);
      });

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/college/campus-gallery`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Gallery upload response:', response.data);
      
      // Refresh profile to get updated gallery
      await fetchProfile();
      
      setMessage(`Successfully uploaded ${response.data.images.length} images!`);
      setMessageType('success');
      setGalleryImages(null);
      
    } catch (error: any) {
      console.error('Error uploading gallery images:', error);
      setMessage(error.response?.data?.error || 'Failed to upload images');
      setMessageType('error');
    } finally {
      setGalleryUploading(false);
    }
  };

  const deleteGalleryImage = async (imageId: string) => {
    try {
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        setMessage('Authentication required. Please login again.');
        setMessageType('error');
        return;
      }

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/college/campus-gallery/${imageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh profile to get updated gallery
      await fetchProfile();
      
      setMessage('Image deleted successfully!');
      setMessageType('success');
      
    } catch (error: any) {
      console.error('Error deleting gallery image:', error);
      setMessage(error.response?.data?.error || 'Failed to delete image');
      setMessageType('error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SchoolIcon sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 0 }}>
                  Manage College Profile
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Complete your college information to attract more students
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress
                  variant="determinate"
                  value={profile.completionPercentage || 0}
                  size={80}
                  thickness={4}
                  sx={{ color: 'white' }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h6" component="div" color="white">
                    {`${Math.round(profile.completionPercentage || 0)}%`}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" sx={{ mt: 1, opacity: 0.8, display: 'block' }}>
                {profile.completionPercentage === 100 ? 
                  'Profile Complete!' : 
                  'Complete all sections for better visibility'
                }
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Basic Information */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <SchoolIcon sx={{ mr: 1, color: '#1976d2' }} />
            <Box>
              <Typography variant="h6">Basic Information</Typography>
              <Typography variant="caption" color="textSecondary">
                Essential details about your institution
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Required Fields:</strong> College name, type, and description are essential for students to find and understand your institution.
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="College Name *"
                  value={profile.collegeName}
                  onChange={(e) => handleInputChange('collegeName', e.target.value)}
                  required
                  helperText="Official name of your institution"
                />
              </Grid>
              
              {/* Profile Picture Upload */}
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    College Profile Picture
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 2 }}>
                    Upload a representative image of your college (Max size: 5MB)
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="profile-picture-upload"
                      type="file"
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="profile-picture-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<SchoolIcon />}
                      >
                        Choose Image
                      </Button>
                    </label>
                    
                    {(imagePreview || profile.profilePicture) && (
                      <>
                        <Box
                          component="img"
                          src={imagePreview || profile.profilePicture}
                          alt="College Preview"
                          sx={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid #ddd'
                          }}
                        />
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={removeImage}
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>College Type *</InputLabel>
                  <Select
                    value={profile.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    label="College Type *"
                  >
                    {collegeTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Established Year"
                  type="number"
                  value={profile.establishedYear}
                  onChange={(e) => handleInputChange('establishedYear', parseInt(e.target.value) || '')}
                  helperText="Year when the college was founded"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Affiliated To"
                  value={profile.affiliatedTo}
                  onChange={(e) => handleInputChange('affiliatedTo', e.target.value)}
                  helperText="University or board affiliation"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description *"
                  multiline
                  rows={4}
                  value={profile.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your college's mission, vision, and what makes it special..."
                  helperText="This description will help students understand what your college offers"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Location & Contact */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <LocationIcon sx={{ mr: 1, color: '#2e7d32' }} />
            <Box>
              <Typography variant="h6">Location & Contact</Typography>
              <Typography variant="caption" color="textSecondary">
                Help students find and reach your college
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Important:</strong> Accurate contact information helps students and parents reach you easily. Website URL should start with http:// or https://
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Complete Address *"
                  value={profile.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                  helperText="Full address including street, area, landmarks"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City *"
                  value={profile.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State *"
                  value={profile.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Pincode *"
                  value={profile.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  required
                  helperText="6-digit postal code"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Phone Number *"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  helperText="Primary contact number"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  helperText="Official college email"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Website"
                  value={profile.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  helperText="College website URL"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Courses Offered */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <BusinessIcon sx={{ mr: 1, color: '#9c27b0' }} />
            <Box>
              <Typography variant="h6">Courses Offered</Typography>
              <Typography variant="caption" color="textSecondary">
                Showcase your academic programs and available seats
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="success" sx={{ mb: 3 }}>
              <strong>Tip:</strong> Add all courses your college offers. Include popular degrees and specify available seats to help students make informed decisions.
            </Alert>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Add New Course</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Course Name"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Computer Science and Engineering"
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Degree</InputLabel>
                    <Select
                      value={newCourse.degree}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, degree: e.target.value }))}
                      label="Degree"
                    >
                      {degreeTypes.map(degree => (
                        <MenuItem key={degree} value={degree}>{degree}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="Duration"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 4 years"
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="Seats"
                    type="number"
                    value={newCourse.seats || ''}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, seats: parseInt(e.target.value) || undefined }))}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    variant="contained"
                    onClick={addCourse}
                    disabled={!newCourse.name || !newCourse.degree || !newCourse.duration}
                    fullWidth
                  >
                    Add Course
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Box>
              {profile.courses.map((course, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={3}>
                        <Typography variant="subtitle1">{course.name}</Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Chip label={course.degree} size="small" />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography variant="body2">{course.duration}</Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography variant="body2">
                          {course.seats ? `${course.seats} seats` : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <IconButton onClick={() => removeCourse(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Fee Structure */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <MoneyIcon sx={{ mr: 1, color: '#ff9800' }} />
            <Box>
              <Typography variant="h6">Fee Structure</Typography>
              <Typography variant="caption" color="textSecondary">
                Transparent fee information for students
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <strong>Note:</strong> Provide accurate fee information. This helps students plan their finances better.
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Tuition Fee (Annual)"
                  type="number"
                  value={profile.tuition}
                  onChange={(e) => handleInputChange('tuition', parseInt(e.target.value) || '')}
                  InputProps={{ startAdornment: '₹' }}
                  helperText="Annual academic fee"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Accommodation Fee (Annual)"
                  type="number"
                  value={profile.accommodation}
                  onChange={(e) => handleInputChange('accommodation', parseInt(e.target.value) || '')}
                  InputProps={{ startAdornment: '₹' }}
                  helperText="Hostel/accommodation charges"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Other Fees (Annual)"
                  type="number"
                  value={profile.otherFees}
                  onChange={(e) => handleInputChange('otherFees', parseInt(e.target.value) || '')}
                  InputProps={{ startAdornment: '₹' }}
                  helperText="Library, lab, exam fees etc."
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Facilities */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <FacilitiesIcon sx={{ mr: 1, color: '#795548' }} />
            <Box>
              <Typography variant="h6">Facilities & Infrastructure</Typography>
              <Typography variant="caption" color="textSecondary">
                Select all facilities available at your campus
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Showcase:</strong> Check all facilities available on your campus. Good facilities attract more students.
            </Alert>
            
            <Typography variant="subtitle1" gutterBottom>
              Available Facilities
            </Typography>
            <FormGroup>
              <Grid container spacing={1}>
                {facilityOptions.map((facility) => (
                  <Grid item xs={12} sm={6} md={4} key={facility}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={profile.facilities.includes(facility)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProfile(prev => ({
                                ...prev,
                                facilities: [...prev.facilities, facility]
                              }));
                            } else {
                              setProfile(prev => ({
                                ...prev,
                                facilities: prev.facilities.filter(f => f !== facility)
                              }));
                            }
                          }}
                          color="primary"
                        />
                      }
                      label={facility}
                    />
                  </Grid>
                ))}
              </Grid>
            </FormGroup>

            {profile.facilities.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Facilities ({profile.facilities.length}):
                </Typography>
                <Box>
                  {profile.facilities.map((facility) => (
                    <Chip
                      key={facility}
                      label={facility}
                      sx={{ m: 0.5 }}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Placements */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <PlacementIcon sx={{ mr: 1, color: '#4caf50' }} />
            <Box>
              <Typography variant="h6">Placement Statistics</Typography>
              <Typography variant="caption" color="textSecondary">
                Showcase your placement success
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="success" sx={{ mb: 3 }}>
              <strong>Important:</strong> Strong placement records are a major factor for students choosing colleges.
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Average Package (Annual)"
                  type="number"
                  value={profile.averagePackage}
                  onChange={(e) => handleInputChange('averagePackage', parseInt(e.target.value) || '')}
                  InputProps={{ startAdornment: '₹' }}
                  helperText="Average salary offered"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Highest Package (Annual)"
                  type="number"
                  value={profile.highestPackage}
                  onChange={(e) => handleInputChange('highestPackage', parseInt(e.target.value) || '')}
                  InputProps={{ startAdornment: '₹' }}
                  helperText="Highest salary offered"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Placement Rate"
                  type="number"
                  value={profile.placementRate}
                  onChange={(e) => handleInputChange('placementRate', parseInt(e.target.value) || '')}
                  InputProps={{ endAdornment: '%' }}
                  helperText="Percentage of students placed"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>Top Recruiters</Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <TextField
                        fullWidth
                        label="Add Company"
                        value={newRecruiter}
                        onChange={(e) => setNewRecruiter(e.target.value)}
                        placeholder="e.g., Google, Microsoft, TCS"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        variant="contained"
                        onClick={addRecruiter}
                        disabled={!newRecruiter}
                        fullWidth
                      >
                        Add Recruiter
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
                <Box>
                  {profile.topRecruiters.map((recruiter) => (
                    <Chip
                      key={recruiter}
                      label={recruiter}
                      onDelete={() => removeRecruiter(recruiter)}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Rankings */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <RankingIcon sx={{ mr: 1, color: '#ff5722' }} />
            <Box>
              <Typography variant="h6">NIRF Ranking</Typography>
              <Typography variant="caption" color="textSecondary">
                Share your college's NIRF ranking achievement
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>NIRF Ranking:</strong> The National Institutional Ranking Framework (NIRF) ranking significantly enhances your college's credibility and attracts quality students.
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="NIRF Ranking"
                  type="number"
                  value={profile.nationalRanking}
                  onChange={(e) => handleInputChange('nationalRanking', parseInt(e.target.value) || '')}
                  helperText="National Institutional Ranking Framework (NIRF) ranking"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Social Media */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <SocialIcon sx={{ mr: 1, color: '#3f51b5' }} />
            <Box>
              <Typography variant="h6">Social Media Presence</Typography>
              <Typography variant="caption" color="textSecondary">
                Connect with students on social platforms
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Engagement:</strong> Social media helps students stay updated with college activities and events.
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Facebook Page"
                  value={profile.facebook}
                  onChange={(e) => handleInputChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/yourcollegepage"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="X Handle"
                  value={profile.twitter}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                  placeholder="https://x.com/yourcollegehandle"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="LinkedIn Page"
                  value={profile.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/yourcollege"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Instagram Handle"
                  value={profile.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/yourcollegehandle"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="YouTube Channel"
                  value={profile.youtube}
                  onChange={(e) => handleInputChange('youtube', e.target.value)}
                  placeholder="https://youtube.com/c/yourcollegechannel"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Campus Gallery */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <PhotoLibraryIcon sx={{ mr: 1, color: '#795548' }} />
            <Box>
              <Typography variant="h6">Campus Gallery</Typography>
              <Typography variant="caption" color="textSecondary">
                Upload campus images for the Infrastructure section in student college details
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Showcase Your Campus:</strong> Upload high-quality images of your campus, buildings, facilities, and infrastructure. These images will be displayed in the Campus Gallery section when students view your college details.
            </Alert>

            {/* Upload Section */}
            <Card sx={{ mb: 3, p: 2, bgcolor: 'background.paper' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CloudUploadIcon sx={{ mr: 1 }} />
                Upload Campus Images
              </Typography>
              <Box sx={{ mt: 2 }}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setGalleryImages(e.target.files)}
                  style={{ display: 'none' }}
                  id="gallery-upload"
                />
                <label htmlFor="gallery-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mr: 2 }}
                  >
                    Select Images
                  </Button>
                </label>
                {galleryImages && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {galleryImages.length} image(s) selected
                  </Typography>
                )}
                <Button
                  variant="contained"
                  onClick={handleGalleryUpload}
                  disabled={!galleryImages || galleryUploading}
                  sx={{ ml: 2 }}
                >
                  {galleryUploading ? 'Uploading...' : 'Upload Images'}
                </Button>
              </Box>
            </Card>

            {/* Current Gallery */}
            <Typography variant="subtitle1" gutterBottom>
              Current Campus Gallery ({profile.campusGallery?.length || 0} images)
            </Typography>
            
            {profile.campusGallery && profile.campusGallery.length > 0 ? (
              <Grid container spacing={2}>
                {profile.campusGallery.map((image, index) => (
                  <Grid item xs={12} sm={6} md={4} key={image._id || index}>
                    <Card sx={{ position: 'relative' }}>
                      <Box
                        component="img"
                        src={`${import.meta.env.VITE_API_URL}${image.url}`}
                        alt={image.caption || `Campus image ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                        }}
                      />
                      <CardContent sx={{ p: 1 }}>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {image.caption || 'No caption'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded: {new Date(image.uploadedAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                        }}
                        onClick={() => image._id && deleteGalleryImage(image._id)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                <PhotoLibraryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No campus images uploaded yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload images to showcase your campus infrastructure
                </Typography>
              </Card>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Save Button */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSave}
            disabled={saving}
            sx={{ 
              minWidth: 200, 
              py: 1.5,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            }}
          >
            {saving ? 'Saving...' : 'Save College Profile'}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage('')}
      >
        <Alert severity={messageType} onClose={() => setMessage('')}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CollegeProfileManager;