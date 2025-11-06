import { Box, Typography, Paper, Grid, CircularProgress } from '@mui/material';

import { College } from '../../types/college';

interface PlacementsTabProps {
  college: College;
}

export const PlacementsTab = ({ college }: PlacementsTabProps) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumSignificantDigits: 3,
      notation: 'compact',
    }).format(amount);
  };

  return (
    <Box>
      {/* Key Statistics */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Placement Statistics
        </Typography>
        <Grid container spacing={3} component="div">
          <Grid component="div" item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress
                  variant="determinate"
                  value={college.placements.placementRate}
                  size={100}
                  thickness={5}
                  color="primary"
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
                  <Typography variant="h6" component="div">
                    {`${college.placements.placementRate}%`}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Placement Rate
              </Typography>
            </Box>
          </Grid>
          <Grid component="div" item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="primary">
                {formatAmount(college.placements.averagePackage)}
              </Typography>
              <Typography variant="body1">Average Package</Typography>
            </Box>
          </Grid>
          <Grid component="div" item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="primary">
                {formatAmount(college.placements.highestPackage)}
              </Typography>
              <Typography variant="body1">Highest Package</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Top Recruiters */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Top Recruiters
        </Typography>
        <Grid container spacing={2} component="div">
          {college.placements.topRecruiters.map((recruiter) => (
            <Grid component="div" item xs={12} sm={6} md={4} key={recruiter}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                }}
              >
                <Typography variant="body1">{recruiter}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};