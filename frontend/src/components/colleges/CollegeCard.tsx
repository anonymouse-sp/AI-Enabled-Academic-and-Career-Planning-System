import {
  Card,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
} from '@mui/material';
import { LocationOn, School, AttachMoney } from '@mui/icons-material';
import { College } from '../../types/college';
import { useNavigate } from 'react-router-dom';

interface CollegeCardProps {
  college: College;
}

export const CollegeCard = ({ college }: CollegeCardProps) => {
  const navigate = useNavigate();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumSignificantDigits: 3,
      notation: 'compact',
    }).format(amount);
  };

  return (
    <Card
      elevation={1}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        mb: 1.5,
        p: 2,
        borderLeft: '4px solid',
        borderLeftColor: 'primary.main',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out',
        },
      }}
    >
      <CardMedia
        component="img"
        sx={{
          width: 120,
          height: 80,
          objectFit: 'cover',
          borderRadius: 1,
          mr: 2,
        }}
        image={college.profilePicture || college.images[0] || '/placeholder-college.jpg'}
        alt={college.name}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {college.name}
          </Typography>
          {college.rankings.national && (
            <Chip
              label={`#${college.rankings.national} NIRF`}
              color="primary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOn fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              {`${college.location.city}, ${college.location.state}`}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AttachMoney fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              {formatAmount(college.fees.tuition)}
            </Typography>
          </Box>
          
          {college.placements && college.placements.placementRate > 0 && (
            <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
              {college.placements.placementRate}% Placed
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <School fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            {college.courses.slice(0, 3).map(course => 
              typeof course === 'string' ? course : course.name
            ).join(', ')}
            {college.courses.length > 3 && ' ...'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {college.facilities.slice(0, 3).map((facility) => (
            <Chip
              key={facility}
              label={facility}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            console.log('Navigating to college details for:', college._id, 'College name:', college.name);
            navigate(`/colleges/${college._id}`);
          }}
          sx={{ minWidth: '100px' }}
        >
          View Details
        </Button>
      </Box>
    </Card>
  );
};