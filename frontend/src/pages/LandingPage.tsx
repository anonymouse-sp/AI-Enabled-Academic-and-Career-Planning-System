import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
} from '@mui/material';
import {
  School,
  AdminPanelSettings,
  Person,
} from '@mui/icons-material';

const LandingPage = () => {
  const navigate = useNavigate();

  const userTypes = [
    {
      title: 'Student',
      description: 'Search for colleges, save preferences, and get personalized recommendations',
      icon: <Person sx={{ fontSize: '4rem', color: '#1976d2' }} />,
      path: '/login/student',
      color: '#1976d2',
    },
    {
      title: 'College',
      description: 'Manage your college profile, view applications, and connect with students',
      icon: <School sx={{ fontSize: '4rem', color: '#2e7d32' }} />,
      path: '/login/college',
      color: '#2e7d32',
    },
    {
      title: 'Admin',
      description: 'Oversee platform operations, manage users, and monitor system activities',
      icon: <AdminPanelSettings sx={{ fontSize: '4rem', color: '#d32f2f' }} />,
      path: '/login/admin',
      color: '#d32f2f',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            maxWidth: '900px',
            p: 4,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 2,
            }}
          >
            College Finder
          </Typography>
          
          <Typography
            variant="h6"
            color="textSecondary"
            sx={{ mb: 4 }}
          >
            Welcome! Please select your role to continue
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            {userTypes.map((type) => (
              <Grid item xs={12} sm={6} md={4} key={type.title}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      elevation: 8,
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${type.color}40`,
                    },
                  }}
                  onClick={() => navigate(type.path)}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flexGrow: 1,
                      p: 3,
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      {type.icon}
                    </Box>
                    
                    <Typography
                      variant="h5"
                      component="h2"
                      gutterBottom
                      sx={{
                        fontWeight: 'bold',
                        color: type.color,
                      }}
                    >
                      {type.title}
                    </Typography>
                    
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        textAlign: 'center',
                        flexGrow: 1,
                        mb: 2,
                      }}
                    >
                      {type.description}
                    </Typography>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: type.color,
                        '&:hover': {
                          backgroundColor: type.color,
                          filter: 'brightness(0.9)',
                        },
                      }}
                    >
                      Login as {type.title}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="textSecondary">
              Don't have an account?{' '}
              <Button
                variant="text"
                onClick={() => navigate('/register')}
                sx={{ textTransform: 'none' }}
              >
                Sign up here
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LandingPage;