import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Button,
} from '@mui/material';
import { Assignment, School, AccessTime, CheckCircle, Cancel, Search } from '@mui/icons-material';
import DashboardLayout from '../components/layout/DashboardLayout';

interface Application {
  _id: string;
  college: {
    collegeName: string;
    location: string;
    profilePicture?: string;
  };
  course: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const MyApplications: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/applications/my-applications`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]); // Set empty array if error
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AccessTime fontSize="small" />;
      case 'approved':
        return <CheckCircle fontSize="small" />;
      case 'rejected':
        return <Cancel fontSize="small" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Applications">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Loading applications...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Applications">
      <Box sx={{ padding: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Assignment sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              My Applications
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<Search />}
            onClick={() => navigate('/colleges')}
            sx={{ ml: 2 }}
          >
            Find More Colleges
          </Button>
        </Box>

        {applications.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 4 }}>
            <CardContent>
              <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Applications Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You haven't applied to any colleges yet. Start exploring colleges and apply to your dream institutions!
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Search />}
                onClick={() => navigate('/colleges')}
              >
                Find Colleges
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {applications.map((application) => (
              <Grid item xs={12} md={6} lg={4} key={application._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{ mr: 2, bgcolor: 'primary.main' }}
                        src={application.college.profilePicture}
                      >
                        <School />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                          {application.college.collegeName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {application.college.location}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                      {application.course}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Applied on: {new Date(application.submittedAt).toLocaleDateString()}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        icon={getStatusIcon(application.status) || undefined}
                        label={application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        color={getStatusColor(application.status) as any}
                        variant="filled"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default MyApplications;