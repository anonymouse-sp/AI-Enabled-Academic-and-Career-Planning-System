import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Pagination,
  TextField,
  InputAdornment,
  Paper,
  Chip,
  Button,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Drawer,
  Alert,
  Snackbar,
} from '@mui/material';
import { 
  Search as SearchIcon,
  Sort,
  TrendingUp,
  School,
  Star,
  Clear,
  Tune,
  NavigateBefore,
  NavigateNext,
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { CollegeFilters } from '../components/colleges/CollegeFilters';
import { CollegeCard } from '../components/colleges/CollegeCard';
import { College, CollegeFilters as ICollegeFilters } from '../types/college';
import axios from 'axios';

const CollegeSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalColleges, setTotalColleges] = useState(0);
  const [filters, setFilters] = useState<ICollegeFilters>({});
  const [sortBy, setSortBy] = useState('relevance');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      console.log('Fetching colleges with params:', {
        page,
        limit: 12,
        search: searchQuery,
        sortBy,
        ...filters,
      });
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/colleges/search`,
        {
          params: {
            page,
            limit: 12,
            search: searchQuery,
            sortBy,
            ...filters,
          },
        }
      );
      
      console.log('API Response:', response.data);
      
      // Transform the API response to match frontend expectations
      const transformedColleges = response.data.colleges.map((college: any) => ({
        _id: college.id || college._id,
        name: college.name,
        description: college.description,
        location: {
          city: college.location?.city || '',
          state: college.location?.state || '',
          country: college.location?.country || 'India',
          coordinates: {
            latitude: 0,
            longitude: 0,
          },
        },
        courses: college.courses || [],
        fees: {
          tuition: college.fees?.tuition || 0,
          accommodation: college.fees?.accommodation || 0,
          other: college.fees?.other || 0,
        },
        placements: {
          averagePackage: college.placements?.averagePackage || 0,
          highestPackage: college.placements?.highestPackage || 0,
          placementRate: college.placements?.placementRate || 0,
          topRecruiters: college.placements?.topRecruiters || [],
        },
        facilities: college.facilities || [],
        infrastructure: {
          campus: {
            area: 0,
            description: college.description || '',
          },
          library: college.facilities?.includes('Library') || false,
          sports: college.facilities?.includes('Sports Complex') || false,
          laboratory: college.facilities?.includes('Laboratory') || false,
          cafeteria: college.facilities?.includes('Cafeteria') || false,
          wifi: college.facilities?.includes('Wi-Fi Campus') || false,
        },
        rankings: {
          national: college.rankings?.national,
        },
        admissionCriteria: {
          minScore: 0,
          entranceExams: [],
        },
        images: (() => {
          const profilePic = college.profilePicture;
          const existingImages = college.images || [];
          const logoImage = college.logo;
          
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
        website: college.contact?.website || '',
        contactInfo: {
          email: college.contact?.email || '',
          phone: college.contact?.phone || '',
          address: `${college.location?.city || ''}, ${college.location?.state || ''}`,
        },
        establishedYear: college.established || 0,
        type: college.type || '',
        isVerified: college.isVerified || false,
        profilePicture: college.profilePicture,
      }));
      
      setColleges(transformedColleges);
      setTotalPages(response.data.totalPages || Math.ceil(response.data.total / 12));
      setTotalColleges(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      // Show empty state instead of mock data
      setColleges([]);
      setTotalPages(1);
      setTotalColleges(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [page, searchQuery, filters, sortBy]);

  useEffect(() => {
    // Update URL params when search changes
    if (searchQuery) {
      setSearchParams({ search: searchQuery });
    } else {
      setSearchParams({});
    }
  }, [searchQuery, setSearchParams]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilters: ICollegeFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <DashboardLayout title="Find Colleges">
      {/* Enhanced Header with Quick Stats */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          🎓 Discover Your Perfect College
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
          {totalColleges > 0 ? `Explore ${totalColleges.toLocaleString()}+ registered colleges across India` : 'Find registered colleges across India'}
        </Typography>
        
        {/* Enhanced Search Bar */}
        <Box sx={{ position: 'relative' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by college name, location, course, or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(0,0,0,0.6)' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchQuery('')} size="small">
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
              sx: { 
                bgcolor: 'white', 
                borderRadius: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { border: 'none' },
                }
              }
            }}
            sx={{ mb: 2 }}
          />
        </Box>
      </Paper>

      {/* Filters and Results Controls */}
      <Box display="flex" alignItems="center" justifyContent="between" mb={2} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={2} flex={1}>
          <Button
            variant="outlined"
            startIcon={<Tune />}
            onClick={() => setFiltersOpen(true)}
            sx={{ position: 'relative' }}
          >
            Filters
            {activeFiltersCount > 0 && (
              <Chip 
                size="small" 
                label={activeFiltersCount} 
                color="primary"
                sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
              />
            )}
          </Button>
          
          {activeFiltersCount > 0 && (
            <Button size="small" onClick={clearFilters} startIcon={<Clear />}>
              Clear All
            </Button>
          )}

          <Typography variant="body2" color="textSecondary">
            {loading ? 'Searching...' : `Found ${totalColleges} colleges${totalPages > 1 ? ` • Page ${page} of ${totalPages}` : ''}`}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
            Sort by:
          </Typography>
          <ToggleButtonGroup
            value={sortBy}
            exclusive
            onChange={(_, value) => value && setSortBy(value)}
            size="small"
          >
            <ToggleButton value="relevance">
              <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
              Relevance
            </ToggleButton>
            <ToggleButton value="rating">
              <Star sx={{ fontSize: 16, mr: 0.5 }} />
              Rating
            </ToggleButton>
            <ToggleButton value="fees">
              <Sort sx={{ fontSize: 16, mr: 0.5 }} />
              Fees
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Removed view mode toggle - always list view */}
        </Box>
      </Box>

      {/* Results */}
      <Grid container spacing={3} component="div">
        <Grid component="div" item xs={12}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
              <CircularProgress size={60} />
            </Box>
          ) : colleges.length === 0 ? (
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
              <School sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No colleges found
              </Typography>
              <Typography color="textSecondary" sx={{ mb: 3 }}>
                {searchQuery ? 
                  `No colleges match your search "${searchQuery}". Try different keywords or clear filters.` :
                  'No registered colleges available at the moment. Please check back later.'
                }
              </Typography>
              {(searchQuery || activeFiltersCount > 0) && (
                <Button variant="contained" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </Paper>
          ) : (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {colleges.map((college) => (
                  <CollegeCard key={college._id} college={college} />
                ))}
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4, gap: 2 }}>
                {/* Previous Button */}
                <Button
                  variant="outlined"
                  startIcon={<NavigateBefore />}
                  onClick={() => handlePageChange(null as any, page - 1)}
                  disabled={page === 1}
                  sx={{ minWidth: '120px' }}
                >
                  Previous
                </Button>
                
                {/* Page Numbers */}
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  siblingCount={1}
                  boundaryCount={1}
                />
                
                {/* Next Button */}
                <Button
                  variant="outlined"
                  endIcon={<NavigateNext />}
                  onClick={() => handlePageChange(null as any, page + 1)}
                  disabled={page === totalPages}
                  sx={{ minWidth: '120px' }}
                >
                  Next
                </Button>
              </Box>
            </>
          )}
        </Grid>
      </Grid>

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="bottom"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        PaperProps={{
          sx: {
            maxHeight: '80vh',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
            <Typography variant="h6">Filters</Typography>
            <Button onClick={() => setFiltersOpen(false)}>Done</Button>
          </Box>
          <CollegeFilters filters={filters} onFilterChange={handleFilterChange} />
        </Box>
      </Drawer>

      {/* Success Message */}
      <Snackbar
        open={showSavedMessage}
        autoHideDuration={3000}
        onClose={() => setShowSavedMessage(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setShowSavedMessage(false)}>
          College saved to your favorites! 📚
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default CollegeSearch;