import { Box, Typography, Grid, Paper, ImageList, ImageListItem } from '@mui/material';

import { College } from '../../types/college';

interface InfrastructureTabProps {
  college: College;
}

export const InfrastructureTab = ({ college }: InfrastructureTabProps) => {
  return (
    <Box>
      {/* Campus Gallery */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Campus Gallery
        </Typography>
        {college.campusGallery && college.campusGallery.length > 0 ? (
          <ImageList
            sx={{
              width: '100%',
              height: 'auto',
              // Promote the list into its own layer in Chrome for better performance
              transform: 'translateZ(0)',
            }}
            variant="quilted"
            cols={4}
            rowHeight={200}
          >
            {college.campusGallery.map((image, index) => (
              <ImageListItem 
                key={image._id || index} 
                cols={index === 0 ? 2 : 1} 
                rows={index === 0 ? 2 : 1}
              >
                <img
                  src={`${import.meta.env.VITE_API_URL}${image.url}`}
                  alt={image.caption || `${college.name} campus image ${index + 1}`}
                  loading="lazy"
                  style={{ 
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        ) : (
          <Box sx={{ 
            p: 4, 
            textAlign: 'center', 
            bgcolor: 'grey.50', 
            borderRadius: 1,
            border: '2px dashed',
            borderColor: 'grey.300'
          }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No campus images available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The college hasn't uploaded campus gallery images yet
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Facilities List */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Available Facilities
        </Typography>
        {college.facilities && college.facilities.length > 0 ? (
          <Grid container spacing={3} component="div">
            {college.facilities.map((facility) => (
              <Grid component="div" item xs={12} sm={6} md={4} key={facility}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'success.light',
                  }}
                >
                  <Typography
                    variant="body1"
                    color="success.contrastText"
                  >
                    {facility}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ 
            p: 4, 
            textAlign: 'center', 
            bgcolor: 'grey.50', 
            borderRadius: 1,
            border: '2px dashed',
            borderColor: 'grey.300'
          }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No facilities information available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The college hasn't provided details about available facilities
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};