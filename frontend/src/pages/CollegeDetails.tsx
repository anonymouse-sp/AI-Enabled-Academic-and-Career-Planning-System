import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Breadcrumbs,
  Link,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  Phone,
  Email,
  Language,
  School,
  Home as HomeIcon,
  NavigateNext,
  Share,
  Favorite,
  FavoriteBorder,
  Assignment,
} from '@mui/icons-material';
import DashboardLayout from '../components/layout/DashboardLayout';
import { ContactTab } from '../components/college-details/ContactTab';
import { DepartmentsTab } from '../components/college-details/DepartmentsTab';
import { FeesTab } from '../components/college-details/FeesTab';
import { InfrastructureTab } from '../components/college-details/InfrastructureTab';
import { PlacementsTab } from '../components/college-details/PlacementsTab';
import { MediaGalleryTab } from '../components/college-details/MediaGalleryTab';
import ApplicationForm from '../components/ApplicationForm';
import { College } from '../types/college';
import axios from 'axios';

const CollegeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [applicationFormOpen, setApplicationFormOpen] = useState(false);

  useEffect(() => {
    fetchCollegeDetails();
  }, [id]);

  const fetchCollegeDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching college details for ID:', id);
      console.log('ID type:', typeof id);
      console.log('Full URL will be:', `${import.meta.env.VITE_API_URL}/api/colleges/${id}`);
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/colleges/${id}`
      );
      
      console.log('College details response:', response.data);
      
      // Transform the API response to match frontend expectations
      const collegeData = response.data;
      const transformedCollege: College = {
        _id: collegeData.id || collegeData._id,
        name: collegeData.name || collegeData.collegeName,
        description: collegeData.description || '',
        location: {
          city: collegeData.location?.city || '',
          state: collegeData.location?.state || '',
          country: collegeData.location?.country || 'India',
          coordinates: {
            latitude: collegeData.location?.coordinates?.latitude || 0,
            longitude: collegeData.location?.coordinates?.longitude || 0,
          },
        },
        courses: collegeData.courses || [],
        fees: {
          tuition: collegeData.fees?.tuition || 0,
          accommodation: collegeData.fees?.accommodation || 0,
          other: collegeData.fees?.other || 0,
        },
        placements: {
          averagePackage: collegeData.placements?.averagePackage || 0,
          highestPackage: collegeData.placements?.highestPackage || 0,
          placementRate: collegeData.placements?.placementRate || 0,
          topRecruiters: collegeData.placements?.topRecruiters || [],
        },
        facilities: collegeData.facilities || [],
        infrastructure: collegeData.infrastructure || {
          campus: {
            area: 100,
            description: collegeData.description || 'Beautiful campus with modern facilities',
          },
          library: collegeData.facilities?.includes('Library') || false,
          sports: collegeData.facilities?.includes('Sports Complex') || false,
          laboratory: collegeData.facilities?.includes('Laboratory') || false,
          cafeteria: collegeData.facilities?.includes('Cafeteria') || false,
          wifi: collegeData.facilities?.includes('Wi-Fi Campus') || false,
        },
        rankings: {
          national: collegeData.rankings?.national,
        },
        admissionCriteria: collegeData.admissionCriteria || {
          minScore: 60,
          entranceExams: ['JEE Main', 'State CET'],
        },
        images: (() => {
          const profilePic = collegeData.profilePicture;
          const existingImages = collegeData.images || [];
          const logoImage = collegeData.logo;
          
          // Create array with profile picture first if it exists
          const imageArray: string[] = [];
          if (profilePic) imageArray.push(profilePic);
          
          // Add other images that aren't the profile picture
          existingImages.forEach((img: string) => {
            if (img !== profilePic) imageArray.push(img);
          });
          
          // Add logo if it exists and isn't already included
          if (logoImage && !imageArray.includes(logoImage)) {
            imageArray.push(logoImage);
          }
          
          // Fallback if no images
          return imageArray.length > 0 ? imageArray : ['/placeholder-college.jpg'];
        })(),
        campusGallery: collegeData.campusGallery || [],
        website: collegeData.contact?.website || '',
        contactInfo: {
          email: collegeData.contact?.email || '',
          phone: collegeData.contact?.phone || '',
          address: `${collegeData.location?.address || ''}, ${collegeData.location?.city || ''}, ${collegeData.location?.state || ''}`,
        },
        establishedYear: collegeData.established || collegeData.establishedYear || 0,
        type: collegeData.type || '',
        isVerified: collegeData.isVerified || false,
        profilePicture: collegeData.profilePicture,
        socialMedia: collegeData.socialMedia || {},
      };
      
      setCollege(transformedCollege);
    } catch (error: any) {
      console.error('Error fetching college details:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch college details. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleShare = async () => {
    if (navigator.share && college) {
      try {
        await navigator.share({
          title: college.name,
          text: `Check out ${college.name} - ${college.description}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement save/remove from favorites API
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumSignificantDigits: 3,
      notation: 'compact',
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout title="College Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !college) {
    return (
      <DashboardLayout title="College Details">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <School sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            College Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error || "The college you're looking for doesn't exist or has been removed."}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/colleges')}>
            Back to Colleges
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  const tabLabels = [
    'Overview',
    'Departments',
    'Fees',
    'Infrastructure', 
    'Placements',
    'Social Media',
    'Contact'
  ];

  return (
    <DashboardLayout title={college.name}>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs 
        separator={<NavigateNext fontSize="small" />} 
        sx={{ mb: 2 }}
      >
        <Link 
          color="inherit" 
          href="/colleges" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/colleges');
          }}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Find Colleges
        </Link>
        <Typography color="text.primary">
          {college.name}
        </Typography>
      </Breadcrumbs>

      {/* College Header */}
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Box sx={{ position: 'relative' }}>
          {/* College Image */}
          <CardMedia
            component="img"
            height="300"
            image={college.profilePicture || college.images[0] || '/placeholder-college.jpg'}
            alt={college.name}
            sx={{ objectFit: 'cover' }}
          />
          
          {/* Back Button */}
          <IconButton
            onClick={() => navigate('/colleges')}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'white' },
            }}
          >
            <ArrowBack />
          </IconButton>

          {/* Action Buttons */}
          <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
            <IconButton
              onClick={handleShare}
              sx={{
                bgcolor: 'rgba(255,255,255,0.9)',
                '&:hover': { bgcolor: 'white' },
              }}
            >
              <Share />
            </IconButton>
            <IconButton
              onClick={toggleFavorite}
              sx={{
                bgcolor: 'rgba(255,255,255,0.9)',
                '&:hover': { bgcolor: 'white' },
              }}
            >
              {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
          </Box>
        </Box>

        {/* College Info */}
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {college.name}
                    {college.isVerified && (
                      <Chip 
                        label="Verified" 
                        color="success" 
                        size="small" 
                        sx={{ ml: 2 }}
                      />
                    )}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        {college.location.city}, {college.location.state}
                      </Typography>
                    </Box>
                    
                    {college.establishedYear && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <School fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                          Est. {college.establishedYear}
                        </Typography>
                      </Box>
                    )}

                    <Chip label={college.type} size="small" variant="outlined" />
                  </Box>

                  {college.description && (
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      {college.description}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Info
                  </Typography>
                  
                  {college.rankings.national && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">NIRF Rank:</Typography>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        #{college.rankings.national}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Annual Fee:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatAmount(college.fees.tuition)}
                    </Typography>
                  </Box>
                  
                  {college.placements.placementRate > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Placement Rate:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {college.placements.placementRate}%
                      </Typography>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                    {college.contactInfo.phone && (
                      <Button
                        startIcon={<Phone />}
                        variant="outlined"
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Use location.assign to avoid beforeunload trigger
                          try {
                            const phoneUrl = `tel:${college.contactInfo.phone}`;
                            // Set a flag to prevent logout during tel navigation
                            sessionStorage.setItem('navigatingToContact', 'true');
                            setTimeout(() => {
                              sessionStorage.removeItem('navigatingToContact');
                            }, 2000);
                            window.location.assign(phoneUrl);
                          } catch (err) {
                            console.error('Failed to open phone app:', err);
                          }
                        }}
                      >
                        Call
                      </Button>
                    )}
                    
                    {college.contactInfo.email && (
                      <Button
                        startIcon={<Email />}
                        variant="outlined"
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Use location.assign to avoid beforeunload trigger
                          try {
                            const emailUrl = `mailto:${college.contactInfo.email}`;
                            // Set a flag to prevent logout during mailto navigation
                            sessionStorage.setItem('navigatingToContact', 'true');
                            setTimeout(() => {
                              sessionStorage.removeItem('navigatingToContact');
                            }, 2000);
                            window.location.assign(emailUrl);
                          } catch (err) {
                            console.error('Failed to open email app:', err);
                          }
                        }}
                      >
                        Email
                      </Button>
                    )}
                    
                    {/* Apply Now Button */}
                    <Button
                      startIcon={<Assignment />}
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => setApplicationFormOpen(true)}
                      sx={{ mb: 1 }}
                    >
                      Apply Now
                    </Button>
                    
                    {college.website && (
                      <Button
                        startIcon={<Language />}
                        variant="contained"
                        size="small"
                        href={college.website}
                        target="_blank"
                      >
                        Visit Website
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Paper>

      {/* Tabs Section */}
      <Paper elevation={2}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                About {college.name}
              </Typography>
              <Typography variant="body1" paragraph>
                {college.description || 'No description available.'}
              </Typography>
              
              {college.facilities.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Facilities
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {college.facilities.map((facility, index) => (
                      <Chip key={index} label={facility} variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
          {activeTab === 1 && <DepartmentsTab college={college} />}
          {activeTab === 2 && <FeesTab college={college} />}
          {activeTab === 3 && <InfrastructureTab college={college} />}
          {activeTab === 4 && <PlacementsTab college={college} />}
          {activeTab === 5 && <MediaGalleryTab college={college} />}
          {activeTab === 6 && <ContactTab college={college} />}
        </Box>
      </Paper>

      {/* Application Form Dialog */}
      {college && (
        <ApplicationForm
          open={applicationFormOpen}
          onClose={() => setApplicationFormOpen(false)}
          collegeId={college._id}
          collegeName={college.name}
          courses={college.courses || []}
        />
      )}
    </DashboardLayout>
  );
};

export default CollegeDetails;