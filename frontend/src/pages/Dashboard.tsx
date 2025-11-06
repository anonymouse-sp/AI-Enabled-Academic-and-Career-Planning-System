import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Button,
} from '@mui/material';
import {
  Person,
  School,
  Assignment,
  WorkOutline,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStats {
  totalColleges: number;
  pendingApplications: number;
  totalApplications?: number;
  approvedApplications?: number;
  rejectedApplications?: number;
  profileCompletion: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalColleges: 0,
    pendingApplications: 0,
    totalApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    profileCompletion: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      if (token) {
        // Fetch college applications if user is a college
        if (user?.role === 'college') {
          try {
            const applicationsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/college-applications`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (applicationsResponse.ok) {
              const applicationsData = await applicationsResponse.json();
              const applications = applicationsData.applications || [];
              
              setStats({
                totalColleges: 0,
                pendingApplications: applications.filter((app: any) => app.status === 'pending').length,
                totalApplications: applications.length,
                approvedApplications: applications.filter((app: any) => app.status === 'approved').length,
                rejectedApplications: applications.filter((app: any) => app.status === 'rejected').length,
                profileCompletion: 85, // This should come from profile completion API
              });
              return;
            }
          } catch (error) {
            console.error('Error fetching college applications:', error);
          }
        }
        
        // Original dashboard stats API call for students
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Dashboard stats received:', data);
          console.log('Profile completion from backend:', data.profileCompletion);
          setStats({
            totalColleges: data.totalColleges || 0,
            pendingApplications: data.totalApplications || data.pendingApplications || 0,
            totalApplications: data.totalApplications || 0,
            approvedApplications: data.approvedApplications || 0,
            rejectedApplications: data.rejectedApplications || 0,
            profileCompletion: data.profileCompletion !== undefined ? data.profileCompletion : 0,
          });
        } else {
          setStats({
            totalColleges: 0,
            pendingApplications: 0,
            profileCompletion: 0,
          });
        }
      } else {
        setStats({
          totalColleges: 0,
          pendingApplications: 0,
          profileCompletion: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalColleges: 0,
        pendingApplications: 0,
        profileCompletion: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleProfileUpdate = () => {
      // Always fetch fresh data from backend to ensure sync
      fetchDashboardData();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    progress 
  }: { 
    title: string; 
    value: number | string; 
    icon: React.ReactNode; 
    color: string;
    progress?: number;
  }) => (
    <Grid item xs={12} sm={6} md={3}>
      <Card elevation={3} sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography color="textSecondary" variant="subtitle2">
              {title}
            </Typography>
            <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>
              {icon}
            </Avatar>
          </Box>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
          {progress !== undefined && (
            <Box mt={2}>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: color,
                    borderRadius: 4,
                  }
                }} 
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  );

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography>Loading dashboard...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back{user?.name ? `, ${user.name}` : ''}!
        </Typography>
        
        <Grid container spacing={3}>
          {/* Profile Completion card - only show for students, not colleges */}
          {user?.role !== 'college' && (
            <StatCard
              title="Profile Completion"
              value={`${stats.profileCompletion}%`} 
              icon={<Person />} 
              color="#1976d2"
              progress={stats.profileCompletion}
            />
          )}
          
          {user?.role === 'college' ? (
            <>
              <StatCard
                title="Total Applications"
                value={stats.totalApplications || 0} 
                icon={<Assignment />} 
                color="#1976d2"
              />
              <StatCard
                title="Pending Applications"
                value={stats.pendingApplications || 0} 
                icon={<WorkOutline />} 
                color="#ff9800"
              />
              <StatCard
                title="Approved Applications"
                value={stats.approvedApplications || 0} 
                icon={<CheckCircle />} 
                color="#4caf50"
              />
              <StatCard
                title="Rejected Applications"
                value={stats.rejectedApplications || 0} 
                icon={<Cancel />} 
                color="#f44336"
              />
            </>
          ) : (
            <>
              <StatCard
                title="Available Colleges"
                value={stats.totalColleges} 
                icon={<School />} 
                color="#388e3c"
              />
              <StatCard
                title="My Applications"
                value={stats.pendingApplications} 
                icon={<Assignment />} 
                color="#7b1fa2"
              />
            </>
          )}
        </Grid>
        
        {/* College Applications Management Button */}
        {user?.role === 'college' && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Assignment />}
              onClick={() => navigate('/college/applications')}
              sx={{ 
                px: 4, 
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              Manage Student Applications
            </Button>
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;