import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Check, Close, Person, School, AdminPanelSettings, Logout, Dashboard, ListAlt, Edit } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface PendingRegistration {
  id: string | number;
  name: string;
  email: string;
  role: 'student' | 'college' | 'admin';
  createdAt: string;
}

interface UserDetail {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'college' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  isHeadAdmin?: boolean;
  createdAt: string;
  lastLogin?: string;
  collegeName?: string;
  location?: string;
}

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalColleges: number;
  totalAdmins: number;
  pendingRegistrations: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  approvedUsers: number;
  rejectedUsers: number;
  systemHealth: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    user: UserDetail | null;
  }>({
    open: false,
    user: null
  });
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    collegeName: '',
    location: '',
    isActive: true
  });

  // Separate password change dialog state
  const [passwordChangeDialog, setPasswordChangeDialog] = useState<{
    open: boolean;
    user: UserDetail | null;
  }>({
    open: false,
    user: null
  });
  
  const [passwordChangeForm, setPasswordChangeForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject';
    registrationId: string;
    userName: string;
  }>({
    open: false,
    action: 'approve',
    registrationId: '',
    userName: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (tabValue === 2) {
      fetchUsers();
    }
  }, [tabValue, userPage, userSearch, userRoleFilter]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const fetchDashboardData = async () => {
    console.log('🚀 Integrated AdminDashboard: Starting fetchDashboardData...');
    setLoading(true);
    setFetchError(null);
    
    try {
      const token = sessionStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('🌐 API Base URL:', API_URL);
      
      if (!token) {
        console.error('❌ No authentication token found');
        setFetchError('No authentication token found');
        showError('Authentication token missing. Please login again.');
        setLoading(false);
        return;
      }

      // Fetch dashboard stats (optional - don't let this fail the whole process)
      try {
        console.log('📊 Fetching dashboard stats...');
        const statsResponse = await fetch(`${API_URL}/api/admin/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('✅ Stats data received:', statsData);
          setStats(statsData);
        } else {
          console.log('⚠️ Stats fetch failed, continuing without stats');
        }
      } catch (statsError) {
        console.log('⚠️ Stats fetch error (continuing):', (statsError as Error).message || statsError);
      }

      // Fetch pending registrations (critical)
      console.log('🔍 Fetching pending registrations from:', `${API_URL}/api/admin/pending-registrations`);
      const pendingResponse = await fetch(`${API_URL}/api/admin/pending-registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Pending registrations response status:', pendingResponse.status);
      console.log('📡 Response headers:', Object.fromEntries(pendingResponse.headers.entries()));
      
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        console.log('✅ Pending registrations data received:', pendingData);
        console.log('📊 Data structure - keys:', Object.keys(pendingData));
        
        if (pendingData.pendingRegistrations && Array.isArray(pendingData.pendingRegistrations)) {
          console.log('📋 Pending registrations array length:', pendingData.pendingRegistrations.length);
            console.log('🏫 College registrations found:', pendingData.pendingRegistrations.filter((r: PendingRegistration) => r.role === 'college'));
          console.log('👑 Admin registrations found:', pendingData.pendingRegistrations.filter((r: PendingRegistration) => r.role === 'admin'));          setPendingRegistrations(pendingData.pendingRegistrations);
          console.log('✅ State updated with pending registrations');
          
          if (pendingData.pendingRegistrations.length === 0) {
            showSuccess('📋 No pending registrations found at this time.');
          } else {
            const collegeCount = pendingData.pendingRegistrations.filter((r: PendingRegistration) => r.role === 'college').length;
            const adminCount = pendingData.pendingRegistrations.filter((r: PendingRegistration) => r.role === 'admin').length;
            showSuccess(`📋 Found ${pendingData.pendingRegistrations.length} pending registrations: ${collegeCount} colleges, ${adminCount} admins`);
          }
        } else {
          console.error('❌ Invalid data structure - pendingRegistrations not found or not an array');
          console.log('Raw response:', pendingData);
          setPendingRegistrations([]);
          setFetchError('Invalid response format from server');
        }
      } else {
        const errorText = await pendingResponse.text();
        console.error('❌ Failed to fetch pending registrations:', errorText);
        setFetchError(`API Error: ${pendingResponse.status}`);
        setPendingRegistrations([]);
      }
    } catch (error) {
      console.error('💥 Critical error in fetchDashboardData:', error);
      console.error('Error stack:', (error as Error).stack);
      setFetchError(`Network error: ${(error as Error).message}`);
      setPendingRegistrations([]);
    } finally {
      console.log('🏁 fetchDashboardData completed');
      setLoading(false);
    }
  };

  const handleAction = async (action: 'approve' | 'reject', registrationId: string | number, userName?: string) => {
    setActionLoading(registrationId.toString());
    try {
      const token = sessionStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log(`Attempting to ${action} registration with ID:`, registrationId);
      
      const response = await fetch(`${API_URL}/api/admin/${action}-registration/${registrationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`Response status: ${response.status}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log(`${action} successful:`, result);
        
        // Show success toast notification
        const targetUserName = userName || confirmDialog.userName;
        const pendingUser = pendingRegistrations.find(p => p.id.toString() === registrationId.toString());
        const isAdminRegistration = pendingUser?.role === 'admin';
        
        if (action === 'approve') {
          if (isAdminRegistration) {
            showSuccess(`✅ Successfully approved ${targetUserName}'s admin registration! They now have administrative privileges.`);
          } else {
            showSuccess(`✅ Successfully approved ${targetUserName}'s registration! They can now login.`);
          }
        } else {
          if (isAdminRegistration) {
            showSuccess(`❌ Successfully rejected ${targetUserName}'s admin registration request.`);
          } else {
            showSuccess(`❌ Successfully rejected ${targetUserName}'s registration.`);
          }
        }
        
        // Refresh data after successful action
        await fetchDashboardData();
        setConfirmDialog({ open: false, action: 'approve', registrationId: '', userName: '' });
      } else {
        const errorData = await response.json();
        console.error(`Error ${action}ing registration:`, errorData);
        const errorMessage = `Failed to ${action} ${userName || confirmDialog.userName}: ${errorData.error || 'Unknown error'}`;
        showError(errorMessage);
      }
    } catch (error) {
      console.error(`Error ${action}ing registration:`, error);
      showError(`🌐 Network error while trying to ${action} ${userName || confirmDialog.userName}'s registration. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  // Direct action handlers for simple mode
  const handleApprove = async (id: string | number, name: string) => {
    await handleAction('approve', id, name);
  };

  const handleReject = async (id: string | number, name: string) => {
    await handleAction('reject', id, name);
  };

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      if (!token) {
        showError('Authentication token missing');
        return;
      }

      const params = new URLSearchParams({
        page: userPage.toString(),
        limit: '20',
        ...(userSearch && { search: userSearch }),
        ...(userRoleFilter !== 'all' && { role: userRoleFilter })
      });

      const response = await fetch(`${API_URL}/api/admin/users/detailed?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setUserTotalPages(data.totalPages || 1);
        showSuccess(`✅ Loaded ${data.users?.length || 0} users successfully!`);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        showError(`Failed to fetch users: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showError(`Network error: ${(error as Error).message}`);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean, userName: string) => {
    try {
      const token = sessionStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await response.json();
        showSuccess(`✅ ${userName} has been ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
        await fetchUsers(); // Refresh the list
      } else {
        const errorData = await response.json();
        showError(`Failed to update ${userName}: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      showError(`Network error while updating ${userName}`);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to DELETE ${userName}? This action cannot be undone and will remove all associated data.`)) {
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await response.json();
        showSuccess(`✅ ${userName} has been deleted successfully!`);
        await fetchUsers(); // Refresh the list
        await fetchDashboardData(); // Refresh stats
      } else {
        const errorData = await response.json();
        showError(`Failed to delete ${userName}: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showError(`Network error while deleting ${userName}`);
    }
  };

  const handleEditUser = (user: UserDetail) => {
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      collegeName: user.collegeName || '',
      location: user.location || '',
      isActive: user.isActive
    });
    setEditDialog({ open: true, user });
  };

  const handleUpdateUser = async () => {
    if (!editDialog.user) return;

    try {
      const token = sessionStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/api/admin/users/${editDialog.user._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          role: editForm.role,
          collegeName: editForm.collegeName,
          location: editForm.location,
          isActive: editForm.isActive
        }),
      });

      if (response.ok) {
        showSuccess(`✅ ${editForm.name} profile has been updated successfully!`);
        setEditDialog({ open: false, user: null });
        await fetchUsers(); // Refresh the list
        await fetchDashboardData(); // Refresh stats
      } else {
        const errorData = await response.json();
        showError(`Failed to update ${editForm.name}: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showError(`Network error while updating ${editForm.name}`);
    }
  };

  const handleCloseEditDialog = () => {
    setEditDialog({ open: false, user: null });
    setEditForm({
      name: '',
      email: '',
      role: '',
      collegeName: '',
      location: '',
      isActive: true
    });
  };

  // Password change dialog handlers
  const handleOpenPasswordDialog = (user: UserDetail) => {
    setPasswordChangeDialog({ open: true, user });
    setPasswordChangeForm({ newPassword: '', confirmPassword: '' });
  };

  const handleClosePasswordDialog = () => {
    setPasswordChangeDialog({ open: false, user: null });
    setPasswordChangeForm({ newPassword: '', confirmPassword: '' });
  };

  const handleChangePassword = async () => {
    if (!passwordChangeDialog.user) return;

    // Validate password
    if (!passwordChangeForm.newPassword || passwordChangeForm.newPassword.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }
    if (passwordChangeForm.newPassword !== passwordChangeForm.confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    try {
      setActionLoading(passwordChangeDialog.user._id);
      const token = sessionStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/api/admin/users/${passwordChangeDialog.user._id}/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: passwordChangeForm.newPassword
        }),
      });

      if (response.ok) {
        showSuccess(`✅ Password changed successfully for ${passwordChangeDialog.user.name}!`);
        handleClosePasswordDialog();
      } else {
        const errorData = await response.json();
        showError(`Failed to change password: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showError(`Network error while changing password for ${passwordChangeDialog.user.name}`);
    } finally {
      setActionLoading(null);
    }
  };

  const openConfirmDialog = (action: 'approve' | 'reject', registrationId: string | number, userName: string) => {
    setConfirmDialog({ open: true, action, registrationId: registrationId.toString(), userName });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student':
        return <Person />;
      case 'college':
        return <School />;
      case 'admin':
        return <AdminPanelSettings />;
      default:
        return <Person />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student':
        return 'primary';
      case 'college':
        return 'success';
      case 'admin':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  const handleLogout = async () => {
    try {
      showSuccess('👋 Successfully logged out. See you next time!');
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      showError('❌ Logout failed. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4">
            🔐 Integrated Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete system management with comprehensive stats and simplified approval interface
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{ 
            minWidth: '120px',
            '&:hover': {
              backgroundColor: 'error.light',
              color: 'white'
            }
          }}
        >
          Logout
        </Button>
      </Box>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin dashboard tabs">
          <Tab 
            icon={<ListAlt />} 
            label="Simple Approval" 
            id="admin-tab-0"
            aria-controls="admin-tabpanel-0"
            sx={{ 
              fontWeight: 'bold',
              '&.Mui-selected': { 
                color: 'primary.main',
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          />
          <Tab 
            icon={<Dashboard />} 
            label="Comprehensive Dashboard" 
            id="admin-tab-1"
            aria-controls="admin-tabpanel-1"
            sx={{ 
              fontWeight: 'bold',
              '&.Mui-selected': { 
                color: 'primary.main',
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          />
          <Tab 
            icon={<Person />} 
            label="User Management" 
            id="admin-tab-2"
            aria-controls="admin-tabpanel-2"
            sx={{ 
              fontWeight: 'bold',
              '&.Mui-selected': { 
                color: 'primary.main',
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          />
        </Tabs>
      </Box>

      {/* Simple Approval Tab */}
      <TabPanel value={tabValue} index={0}>
        {/* Quick Stats Overview */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', color: 'white', textAlign: 'center' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h4" fontWeight="bold">{stats?.totalUsers || 0}</Typography>
                <Typography variant="body2">Total Users</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)', color: 'white', textAlign: 'center' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h4" fontWeight="bold">{stats?.totalColleges || 0}</Typography>
                <Typography variant="body2">Colleges</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)', color: 'white', textAlign: 'center' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h4" fontWeight="bold">{stats?.totalStudents || 0}</Typography>
                <Typography variant="body2">Students</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(45deg, #F44336 30%, #E91E63 90%)', color: 'white', textAlign: 'center' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h4" fontWeight="bold">{pendingRegistrations.length}</Typography>
                <Typography variant="body2">Pending Approval</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Status Information */}
        <Card sx={{ mb: 3, backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
          <CardContent>
            <Typography variant="h6" color="primary">🎯 Quick Admin Access</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2">
                  <strong>👤 Current User:</strong> {user?.name} ({user?.role})
                  {user?.isHeadAdmin && ' 👑'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2">
                  <strong>📊 System Status:</strong> {loading ? '🔄 Loading...' : '✅ Ready'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2">
                  <strong>🔗 API Connection:</strong> {fetchError ? '❌ Error' : '✅ Connected'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {fetchError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body1"><strong>Error:</strong> {fetchError}</Typography>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={fetchDashboardData}
              sx={{ mt: 1 }}
            >
              🔄 Retry
            </Button>
          </Alert>
        )}

        {/* College Approval Section */}
        {pendingRegistrations.filter((r: PendingRegistration) => r.role === 'college').length > 0 && (
          <Card sx={{ mb: 3, border: '2px solid', borderColor: 'primary.main' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                🏫 COLLEGES AWAITING APPROVAL ({pendingRegistrations.filter((r: PendingRegistration) => r.role === 'college').length})
              </Typography>
              
              <Grid container spacing={2}>
                {pendingRegistrations
                  .filter((r: PendingRegistration) => r.role === 'college')
                  .map((college) => (
                  <Grid item xs={12} md={6} key={college.id}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        🏫 {college.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        📧 {college.email}<br/>
                        📅 {new Date(college.createdAt).toLocaleDateString()}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<Check />}
                          onClick={() => handleApprove(college.id, college.name)}
                          disabled={actionLoading === college.id.toString()}
                          fullWidth
                        >
                          ✅ Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Close />}
                          onClick={() => handleReject(college.id, college.name)}
                          disabled={actionLoading === college.id.toString()}
                          fullWidth
                        >
                          ❌ Reject
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* All Pending Registrations Table */}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              👥 All Pending Registrations ({pendingRegistrations.length})
            </Typography>
            
            {pendingRegistrations.length === 0 ? (
              <Alert severity="info">
                <Typography variant="body1">
                  📭 No pending registrations found.
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={fetchDashboardData}
                  sx={{ mt: 1 }}
                >
                  🔄 Refresh
                </Button>
              </Alert>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Role</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell align="center"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell>
                          {registration.role === 'college' && '🏫'}
                          {registration.role === 'admin' && '👑'}
                          {registration.role === 'student' && '🎓'}
                          {' '}{registration.name}
                        </TableCell>
                        <TableCell>{registration.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={registration.role}
                            color={
                              registration.role === 'college' ? 'primary' :
                              registration.role === 'admin' ? 'error' : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(registration.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<Check />}
                              onClick={() => handleApprove(registration.id, registration.name)}
                              disabled={actionLoading === registration.id.toString()}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Close />}
                              onClick={() => handleReject(registration.id, registration.name)}
                              disabled={actionLoading === registration.id.toString()}
                            >
                              Reject
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Comprehensive Dashboard Tab */}
      <TabPanel value={tabValue} index={1}>
        {user?.isHeadAdmin && (
          <Alert severity="info" sx={{ mb: 3 }}>
            You are logged in as the Head Admin with full system privileges.
          </Alert>
        )}
        
        <Alert severity="success" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1">
              🎯 <strong>Admin Access:</strong> You have complete visibility and control over all system data including users, colleges, and applications.
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              onClick={fetchDashboardData}
              disabled={loading}
              sx={{ ml: 2 }}
            >
              {loading ? <CircularProgress size={20} /> : '🔄 Refresh Data'}
            </Button>
          </Box>
        </Alert>

        {/* Dashboard Stats - Enhanced for Complete Visibility */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.3s' } }}>
              <CardContent>
                <Typography color="white" gutterBottom variant="h6">
                  👥 Total Users
                </Typography>
                <Typography variant="h3" color="white" fontWeight="bold">
                  {stats?.totalUsers || 0}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ mt: 1 }}>
                  All registered users in system
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)', cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.3s' } }}>
              <CardContent>
                <Typography color="white" gutterBottom variant="h6">
                  🎓 Students
                </Typography>
                <Typography variant="h3" color="white" fontWeight="bold">
                  {stats?.totalStudents || 0}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ mt: 1 }}>
                  Student accounts active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)', cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.3s' } }}>
              <CardContent>
                <Typography color="white" gutterBottom variant="h6">
                  🏫 Colleges
                </Typography>
                <Typography variant="h3" color="white" fontWeight="bold">
                  {stats?.totalColleges || 0}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ mt: 1 }}>
                  Registered college partners
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(45deg, #F44336 30%, #E91E63 90%)', cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.3s' } }}>
              <CardContent>
                <Typography color="white" gutterBottom variant="h6">
                  👑 Admins
                </Typography>
                <Typography variant="h3" color="white" fontWeight="bold">
                  {stats?.totalAdmins || 0}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ mt: 1 }}>
                  Administrative accounts
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(45deg, #9C27B0 30%, #673AB7 90%)', cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.3s' } }}>
              <CardContent>
                <Typography color="white" gutterBottom variant="h6">
                  📄 Applications
                </Typography>
                <Typography variant="h3" color="white" fontWeight="bold">
                  {stats?.totalApplications || 0}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ mt: 1 }}>
                  Total applications submitted
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(45deg, #FF5722 30%, #795548 90%)', cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.3s' } }}>
              <CardContent>
                <Typography color="white" gutterBottom variant="h6">
                  ⏳ Pending
                </Typography>
                <Typography variant="h3" color="white" fontWeight="bold">
                  {stats?.pendingRegistrations || pendingRegistrations.length}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ mt: 1 }}>
                  Awaiting approval
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(45deg, #00BCD4 30%, #4FC3F7 90%)', cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.3s' } }}>
              <CardContent>
                <Typography color="white" gutterBottom variant="h6">
                  ✅ Approved
                </Typography>
                <Typography variant="h3" color="white" fontWeight="bold">
                  {stats?.approvedUsers || 0}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ mt: 1 }}>
                  Approved users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(45deg, #607D8B 30%, #90A4AE 90%)', cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.3s' } }}>
              <CardContent>
                <Typography color="white" gutterBottom variant="h6">
                  ❌ Rejected
                </Typography>
                <Typography variant="h3" color="white" fontWeight="bold">
                  {stats?.rejectedUsers || 0}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ mt: 1 }}>
                  Rejected registrations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Application Statistics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>📊 Application Overview</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                  {stats?.totalApplications || 0}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">
                  Total Applications Submitted
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>⏳ Pending Applications</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                  {stats?.pendingApplications || 0}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">
                  Applications Under Review
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>✅ Approved Applications</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                  {stats?.approvedApplications || 0}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">
                  Successfully Approved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* System Overview */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎯 Admin Quick Access - Complete System Overview
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              As an admin, you have complete access to ALL system data. Use the comprehensive admin endpoints for full management capabilities.
            </Alert>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="primary" fontWeight="bold">
                  📊 System Statistics
                </Typography>
                <Typography variant="body2">• Total Users: {stats?.totalUsers || 0}</Typography>
                <Typography variant="body2">• Total Applications: {stats?.totalApplications || 0}</Typography>
                <Typography variant="body2">• System Health: {stats?.systemHealth || 'Unknown'}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="success.main" fontWeight="bold">
                  ✅ Active Data Access
                </Typography>
                <Typography variant="body2">• All user accounts visible</Typography>
                <Typography variant="body2">• All college profiles accessible</Typography>
                <Typography variant="body2">• Complete application history</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="warning.main" fontWeight="bold">
                  ⚡ Admin Capabilities
                </Typography>
                <Typography variant="body2">• User management & approval</Typography>
                <Typography variant="body2">• College profile management</Typography>
                <Typography variant="body2">• Application oversight</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* User Management Overview */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              👥 User Management Overview
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2, backgroundColor: 'rgba(76, 175, 80, 0.05)' }}>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    ✅ Active Users
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {(stats?.totalUsers || 0) - (stats?.pendingRegistrations || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Users who can access the system
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2, backgroundColor: 'rgba(255, 193, 7, 0.05)' }}>
                  <Typography variant="h6" color="warning.main" gutterBottom>
                    ⏳ Pending Approval
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {stats?.pendingRegistrations || pendingRegistrations.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Registrations awaiting your approval
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                🎯 Complete User Control
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                • View all user accounts across the system<br/>
                • Approve or reject new registrations<br/>
                • Monitor application activities<br/>
                • Export user data for analysis
              </Typography>
            </Alert>
          </CardContent>
        </Card>

        {/* Detailed Pending Registrations with Dialog */}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              🏫 Registration Approval Center ({pendingRegistrations.length})
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total pending registrations: {pendingRegistrations.length} | API Status: {pendingRegistrations.length > 0 ? '✅ Connected' : '⚠️ Waiting for registrations'}
            </Typography>
            
            {pendingRegistrations.length === 0 ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body1">
                  📭 No pending registrations found.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  • Check if backend server is running on port 5000<br/>
                  • Verify API connection: {import.meta.env.VITE_API_URL}<br/>
                  • Ensure colleges have registered but not been approved yet
                </Typography>
              </Alert>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Requested Date</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingRegistrations.map((registration) => (
                      <TableRow 
                        key={registration.id}
                        sx={{
                          backgroundColor: registration.role === 'admin' ? 'rgba(211, 47, 47, 0.04)' : 
                                          registration.role === 'college' ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                          border: registration.role === 'admin' ? '1px solid rgba(211, 47, 47, 0.12)' : 
                                 registration.role === 'college' ? '2px solid rgba(25, 118, 210, 0.2)' : 'none',
                          '&:hover': {
                            backgroundColor: registration.role === 'college' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {registration.role === 'college' && '🏫'}
                            {registration.role === 'admin' && '👑'}
                            {registration.role === 'student' && '🎓'}
                            <Typography variant="body2" sx={{ fontWeight: registration.role === 'college' ? 'bold' : 'normal' }}>
                              {registration.name}
                            </Typography>
                          </Box>
                          {registration.role === 'admin' && (
                            <Chip 
                              label="Head Admin Approval Required" 
                              size="small" 
                              color="error" 
                              variant="outlined"
                              sx={{ ml: 1, fontSize: '0.65rem', mt: 0.5 }}
                            />
                          )}
                          {registration.role === 'college' && (
                            <Chip 
                              label="🏫 College Registration" 
                              size="small" 
                              color="primary" 
                              variant="filled"
                              sx={{ ml: 1, fontSize: '0.65rem', mt: 0.5 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>{registration.email}</TableCell>
                        <TableCell>
                          <Chip
                            icon={getRoleIcon(registration.role)}
                            label={registration.role.charAt(0).toUpperCase() + registration.role.slice(1)}
                            color={getRoleColor(registration.role) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(registration.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            {registration.role === 'admin' && !user?.isHeadAdmin ? (
                              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                Only Head Admin can approve admin registrations
                              </Typography>
                            ) : (
                              <>
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  startIcon={<Check />}
                                  onClick={() => openConfirmDialog('approve', registration.id, registration.name)}
                                  disabled={actionLoading === registration.id.toString()}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={<Close />}
                                  onClick={() => openConfirmDialog('reject', registration.id, registration.name)}
                                  disabled={actionLoading === registration.id.toString()}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* User Management Tab */}
      <TabPanel value={tabValue} index={2}>
        <Alert severity="info" sx={{ mb: 3 }}>
          👥 <strong>All Website Users:</strong> Displaying {users.length} users. 
          Students: {users.filter(u => u.role === 'student').length}, 
          Colleges: {users.filter(u => u.role === 'college').length}, 
          Admins: {users.filter(u => u.role === 'admin').length}
          <br />
          🔑 <strong>Admin Powers:</strong> View, Control Access, and Delete Users
        </Alert>

        {/* User Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔍 User Filters & Search
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: '60px' }}>Search:</Typography>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: '40px' }}>Role:</Typography>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="college">Colleges</option>
                    <option value="admin">Admins</option>
                  </select>
                </Box>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="contained"
                  onClick={fetchUsers}
                  fullWidth
                  sx={{ py: 1 }}
                >
                  🔄 Refresh
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Page {userPage} of {userTotalPages} | {users.length} users loaded
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              👥 All System Users ({users.length})
            </Typography>
            
            {users.length === 0 ? (
              <Alert severity="info">
                <Typography variant="body1">
                  📭 No users found matching your criteria.
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={fetchUsers}
                  sx={{ mt: 1 }}
                >
                  🔄 Refresh
                </Button>
              </Alert>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>User Details</strong></TableCell>
                      <TableCell><strong>Role</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Joined</strong></TableCell>
                      <TableCell align="center"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow 
                        key={user._id}
                        sx={{
                          backgroundColor: 
                            user.role === 'admin' ? 'rgba(211, 47, 47, 0.04)' : 
                            user.role === 'college' ? 'rgba(25, 118, 210, 0.04)' : 
                            user.role === 'student' ? 'rgba(76, 175, 80, 0.04)' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {user.role === 'admin' && '👑'} 
                              {user.role === 'college' && '🏫'} 
                              {user.role === 'student' && '🎓'} 
                              {' '}{user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              📧 {user.email}
                            </Typography>
                            {user.collegeName && (
                              <Typography variant="caption" color="primary.main">
                                🏫 {user.collegeName}
                              </Typography>
                            )}
                            {user.location && (
                              <Typography variant="caption" sx={{ display: 'block' }}>
                                📍 {user.location}
                              </Typography>
                            )}
                            {user.isHeadAdmin && (
                              <Chip 
                                label="👑 Head Admin" 
                                size="small" 
                                color="error" 
                                variant="filled"
                                sx={{ fontSize: '0.65rem', mt: 0.5 }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getRoleIcon(user.role)}
                            label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            color={getRoleColor(user.role) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Chip
                              label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                              color={user.status === 'approved' ? 'success' : user.status === 'pending' ? 'warning' : 'error'}
                              size="small"
                              variant="filled"
                            />
                            <Chip
                              label={user.isActive ? '✅ Active' : '🚫 Disabled'}
                              color={user.isActive ? 'success' : 'default'}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </Typography>
                          {user.lastLogin && (
                            <Typography variant="caption" color="text.secondary">
                              Last: {new Date(user.lastLogin).toLocaleDateString()}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<Edit />}
                              onClick={() => handleEditUser(user)}
                              disabled={actionLoading === user._id}
                              sx={{ minWidth: '100px' }}
                            >
                              ✏️ Edit
                            </Button>
                            <Button
                              variant="contained"
                              color="secondary"
                              size="small"
                              onClick={() => handleOpenPasswordDialog(user)}
                              disabled={actionLoading === user._id}
                              sx={{ minWidth: '100px' }}
                            >
                              🔐 Change Password
                            </Button>
                            {user._id !== sessionStorage.getItem('userId') ? (
                              <>
                                <Button
                                  variant={user.isActive ? "outlined" : "contained"}
                                  color={user.isActive ? "warning" : "success"}
                                  size="small"
                                  onClick={() => handleToggleUserStatus(user._id, user.isActive, user.name)}
                                  disabled={actionLoading === user._id}
                                  sx={{ minWidth: '100px' }}
                                >
                                  {user.isActive ? '🚫 Disable' : '✅ Enable'}
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  onClick={() => handleDeleteUser(user._id, user.name)}
                                  disabled={actionLoading === user._id}
                                  sx={{ minWidth: '100px' }}
                                >
                                  🗑️ Delete
                                </Button>
                              </>
                            ) : (
                              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                Current admin account
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination */}
            {userTotalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, gap: 2 }}>
                <Button
                  variant="outlined"
                  disabled={userPage === 1}
                  onClick={() => setUserPage(prev => Math.max(1, prev - 1))}
                >
                  ← Previous
                </Button>
                <Typography variant="body2">
                  Page {userPage} of {userTotalPages}
                </Typography>
                <Button
                  variant="outlined"
                  disabled={userPage === userTotalPages}
                  onClick={() => setUserPage(prev => Math.min(userTotalPages, prev + 1))}
                >
                  Next →
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Password Change Dialog */}
      <Dialog 
        open={passwordChangeDialog.open} 
        onClose={handleClosePasswordDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🔐 Change Password for {passwordChangeDialog.user?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Enter a new password for <strong>{passwordChangeDialog.user?.name}</strong> ({passwordChangeDialog.user?.email})
            </Alert>
            
            <TextField
              label="New Password"
              type="password"
              value={passwordChangeForm.newPassword}
              onChange={(e) => setPasswordChangeForm(prev => ({ ...prev, newPassword: e.target.value }))}
              fullWidth
              required
              variant="outlined"
              helperText="Minimum 6 characters"
              autoFocus
            />
            
            <TextField
              label="Confirm New Password"
              type="password"
              value={passwordChangeForm.confirmPassword}
              onChange={(e) => setPasswordChangeForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              fullWidth
              required
              variant="outlined"
              error={passwordChangeForm.confirmPassword !== '' && passwordChangeForm.newPassword !== passwordChangeForm.confirmPassword}
              helperText={
                passwordChangeForm.confirmPassword !== '' && passwordChangeForm.newPassword !== passwordChangeForm.confirmPassword
                  ? "Passwords do not match"
                  : "Re-enter the new password"
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleClosePasswordDialog}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleChangePassword}
            variant="contained"
            color="primary"
            disabled={
              !passwordChangeForm.newPassword || 
              passwordChangeForm.newPassword.length < 6 ||
              passwordChangeForm.newPassword !== passwordChangeForm.confirmPassword ||
              actionLoading === passwordChangeDialog.user?._id
            }
          >
            {actionLoading === passwordChangeDialog.user?._id ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog 
        open={editDialog.open} 
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Edit />
            Edit User Profile
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Full Name"
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
              variant="outlined"
            />
            
            <TextField
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              fullWidth
              required
              variant="outlined"
            />
            
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={editForm.role}
                label="Role"
                onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="college">College</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="College Name"
              value={editForm.collegeName}
              onChange={(e) => setEditForm(prev => ({ ...prev, collegeName: e.target.value }))}
              fullWidth
              variant="outlined"
              helperText="Leave empty if not applicable"
            />
            
            <TextField
              label="Location"
              value={editForm.location}
              onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
              fullWidth
              variant="outlined"
              helperText="Leave empty if not applicable"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label="Account Active"
            />

          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseEditDialog}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateUser}
            variant="contained"
            color="primary"
            disabled={
              !editForm.name || 
              !editForm.email || 
              actionLoading === editDialog.user?._id
            }
          >
            {actionLoading === editDialog.user?._id ? 'Updating...' : 'Update User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: 'approve', registrationId: '', userName: '' })}
      >
        <DialogTitle>
          Confirm {confirmDialog.action === 'approve' ? 'Approval' : 'Rejection'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {confirmDialog.action} the registration for {confirmDialog.userName}?
            {confirmDialog.action === 'reject' && ' This action cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog({ open: false, action: 'approve', registrationId: '', userName: '' })}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleAction(confirmDialog.action, confirmDialog.registrationId)}
            color={confirmDialog.action === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={actionLoading === confirmDialog.registrationId}
          >
            {actionLoading === confirmDialog.registrationId ? (
              <CircularProgress size={20} />
            ) : (
              confirmDialog.action === 'approve' ? 'Approve' : 'Reject'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;