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
  IconButton,
  Tooltip,
  Pagination
} from '@mui/material';
import { 
  Check, 
  Close, 
  Person, 
  School, 
  AdminPanelSettings, 
  Logout,
  Edit,
  Visibility,
  Refresh,
  Save,
  Dashboard,
  People,
  Key,
  Block,
  CheckCircle,
  Delete,
  Group,
  AccountBalance,
  HourglassEmpty,
  Download,
  FileDownload,
  GetApp
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface PendingRegistration {
  id: string | number;
  name: string;
  email: string;
  role: 'student' | 'college' | 'admin';
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  collegeName?: string;
  phone?: string;
  location?: string;
}



interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalColleges: number;
  totalAdmins: number;
  pendingRegistrations: number;
  systemHealth: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EnhancedAdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // Tab management
  const [tabValue, setTabValue] = useState(0);
  
  // Dashboard data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // User management
  const [users, setUsers] = useState<User[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  
  // Profile viewing and editing
  const [profileDialog, setProfileDialog] = useState({
    open: false,
    type: 'user' as 'user',
    data: null as any,
    mode: 'view' as 'view' | 'edit'
  });
  
  const [editForm, setEditForm] = useState<any>({});
  
  // Password change dialog
  const [passwordDialog, setPasswordDialog] = useState({
    open: false,
    user: null as any,
    newPassword: '',
    confirmPassword: '',
    loading: false
  });
  
  // Access control dialog
  const [accessDialog, setAccessDialog] = useState({
    open: false,
    user: null as any,
    action: 'disable' as 'disable' | 'enable',
    loading: false
  });
  
  // Delete user dialog
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    user: null as any,
    confirmText: '',
    loading: false
  });
  
  // Export functionality
  const [exportLoading, setExportLoading] = useState(false);
  
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: 'approve' as 'approve' | 'reject' | 'delete',
    registrationId: '',
    userName: '',
    entityType: 'registration' as 'registration' | 'user' | 'college'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (tabValue === 1) fetchUsers();
  }, [tabValue, userPage, userSearch, userRoleFilter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      
      const [statsResponse, pendingResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/pending-registrations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingRegistrations(pendingData.pendingUsers || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem('token');
      console.log('🔍 Fetching users with token:', token ? 'Present' : 'Missing');
      
      const params = new URLSearchParams({
        page: userPage.toString(),
        limit: '20',
        ...(userSearch && { search: userSearch }),
        ...(userRoleFilter !== 'all' && { role: userRoleFilter })
      });

      const url = `${import.meta.env.VITE_API_URL}/api/admin/users/detailed?${params}`;
      console.log('📡 Fetching from URL:', url);

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('📊 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('👥 Users data received:', data);
        setUsers(data.users || []);
        setUserTotalPages(data.totalPages || 1);
        showSuccess(`✅ Loaded ${data.users?.length || 0} users successfully!`);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Failed to fetch users:', errorData);
        showError(`Failed to load users: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      showError('Network error while loading users');
    }
  };

  const handleExportUsers = async (roleFilter: string = 'all') => {
    setExportLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const params = new URLSearchParams({
        role: roleFilter,
        format: 'csv'
      });
      
      const url = `${import.meta.env.VITE_API_URL}/api/admin/export/users?${params}`;
      console.log('📥 Exporting user data:', { roleFilter, url });
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        const filename = `users_export_${roleFilter}_${new Date().toISOString().split('T')[0]}.csv`;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        const roleLabel = roleFilter === 'all' ? 'All Users' : 
                         roleFilter === 'student' ? 'Students' :
                         roleFilter === 'college' ? 'Colleges' : 'Admins';
        showSuccess(`✅ ${roleLabel} data exported successfully as ${filename}`);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Export failed' }));
        showError(`Failed to export data: ${errorData.error}`);
      }
    } catch (error) {
      console.error('❌ Export error:', error);
      showError('Network error during export');
    } finally {
      setExportLoading(false);
    }
  };



  const openProfileDialog = (type: 'user', data: any, mode: 'view' | 'edit' = 'view') => {
    setProfileDialog({ open: true, type, data, mode });
    setEditForm(data);
  };

  const handleSaveProfile = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const { data } = profileDialog;
      
      const endpoint = `/api/admin/users/${data._id}`;

      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        showSuccess(`User updated successfully!`);
        setProfileDialog({ ...profileDialog, open: false });
        fetchUsers();
      } else {
        const errorData = await response.json();
        showError(`Failed to update user: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showError('Network error while saving');
    }
  };

  const handleChangePassword = async () => {
    if (passwordDialog.newPassword !== passwordDialog.confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (passwordDialog.newPassword.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }

    setPasswordDialog({ ...passwordDialog, loading: true });

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${passwordDialog.user._id}/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword: passwordDialog.newPassword })
      });

      if (response.ok) {
        showSuccess(`Password changed successfully for ${passwordDialog.user.name}!`);
        setPasswordDialog({
          open: false,
          user: null,
          newPassword: '',
          confirmPassword: '',
          loading: false
        });
      } else {
        const errorData = await response.json();
        showError(`Failed to change password: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showError('Network error while changing password');
    } finally {
      setPasswordDialog({ ...passwordDialog, loading: false });
    }
  };

  const openPasswordDialog = (user: any) => {
    setPasswordDialog({
      open: true,
      user,
      newPassword: '',
      confirmPassword: '',
      loading: false
    });
  };

  const handleToggleAccess = async () => {
    setAccessDialog({ ...accessDialog, loading: true });

    try {
      const token = sessionStorage.getItem('token');
      const { user, action } = accessDialog;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${user._id}/toggle-access`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          isActive: action === 'enable' 
        })
      });

      if (response.ok) {
        const actionText = action === 'enable' ? 'enabled' : 'disabled';
        showSuccess(`Access ${actionText} successfully for ${user.name}!`);
        setAccessDialog({
          open: false,
          user: null,
          action: 'disable',
          loading: false
        });
        fetchUsers(); // Refresh the users list
      } else {
        const errorData = await response.json();
        showError(`Failed to ${action} access: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error toggling access:', error);
      showError('Network error while updating access');
    } finally {
      setAccessDialog({ ...accessDialog, loading: false });
    }
  };

  const openAccessDialog = (user: any, action: 'disable' | 'enable') => {
    setAccessDialog({
      open: true,
      user,
      action,
      loading: false
    });
  };

  const handleDeleteUser = async () => {
    if (deleteDialog.confirmText !== deleteDialog.user.name) {
      showError('Please type the user\'s name exactly to confirm deletion');
      return;
    }

    setDeleteDialog({ ...deleteDialog, loading: true });

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${deleteDialog.user._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showSuccess(`User ${deleteDialog.user.name} has been permanently deleted!`);
        setDeleteDialog({
          open: false,
          user: null,
          confirmText: '',
          loading: false
        });
        fetchUsers(); // Refresh the users list
      } else {
        const errorData = await response.json();
        showError(`Failed to delete user: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showError('Network error while deleting user');
    } finally {
      setDeleteDialog({ ...deleteDialog, loading: false });
    }
  };

  const openDeleteDialog = (user: any) => {
    setDeleteDialog({
      open: true,
      user,
      confirmText: '',
      loading: false
    });
  };

  const handleAction = async (action: 'approve' | 'reject', registrationId: string) => {
    setActionLoading(registrationId);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/${action}-registration/${registrationId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const pendingUser = pendingRegistrations.find(p => p.id.toString() === registrationId);
        showSuccess(`✅ Successfully ${action}ed ${pendingUser?.name}'s registration!`);
        await fetchDashboardData();
        setConfirmDialog({ ...confirmDialog, open: false });
      } else {
        const errorData = await response.json();
        showError(`Failed to ${action} registration: ${errorData.error}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing registration:`, error);
      showError(`Network error while trying to ${action} registration`);
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return <Person />;
      case 'college': return <School />;
      case 'admin': return <AdminPanelSettings />;
      default: return <Person />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'primary';
      case 'college': return 'success';
      case 'admin': return 'error';
      default: return 'default';
    }
  };



  const handleLogout = async () => {
    try {
      showSuccess('👋 Successfully logged out. See you next time!');
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      showError('❌ Logout failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">🔐 Admin Profile Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Complete access to view and modify all user profiles, college data, and applications
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Logout />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      <Alert severity="success" sx={{ mb: 3 }}>
        🎯 <strong>Admin Capabilities:</strong> View and edit ALL user profiles, college information, and application details.
      </Alert>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab icon={<Dashboard />} label="Overview" />
          <Tab icon={<People />} label={`Users (${users.length})`} />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="white" gutterBottom>Total Users</Typography>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    {stats?.totalUsers || 0}
                  </Typography>
                </Box>
                <Group sx={{ color: 'white', fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="white" gutterBottom>Students</Typography>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    {stats?.totalStudents || 0}
                  </Typography>
                </Box>
                <Person sx={{ color: 'white', fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="white" gutterBottom>Colleges</Typography>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    {stats?.totalColleges || 0}
                  </Typography>
                </Box>
                <AccountBalance sx={{ color: 'white', fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: 'linear-gradient(45deg, #9C27B0 30%, #673AB7 90%)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="white" gutterBottom>Admins</Typography>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    {stats?.totalAdmins || 0}
                  </Typography>
                </Box>
                <AdminPanelSettings sx={{ color: 'white', fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: 'linear-gradient(45deg, #FF5722 30%, #795548 90%)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="white" gutterBottom>Pending</Typography>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    {stats?.pendingRegistrations || 0}
                  </Typography>
                </Box>
                <HourglassEmpty sx={{ color: 'white', fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Export Options */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Download /> Data Export Options
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Download user data in CSV format for analysis and record keeping
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<GetApp />}
                onClick={() => handleExportUsers('all')}
                disabled={exportLoading}
                sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}
              >
                Export All Users ({stats?.totalUsers || 0})
              </Button>
              
              <Button
                variant="contained"
                startIcon={<FileDownload />}
                onClick={() => handleExportUsers('student')}
                disabled={exportLoading}
                sx={{ background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)' }}
              >
                Export Students ({stats?.totalStudents || 0})
              </Button>
              
              <Button
                variant="contained"
                startIcon={<FileDownload />}
                onClick={() => handleExportUsers('college')}
                disabled={exportLoading}
                sx={{ background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)' }}
              >
                Export Colleges ({stats?.totalColleges || 0})
              </Button>
              
              <Button
                variant="contained"
                startIcon={<FileDownload />}
                onClick={() => handleExportUsers('admin')}
                disabled={exportLoading}
                sx={{ background: 'linear-gradient(45deg, #9C27B0 30%, #673AB7 90%)' }}
              >
                Export Admins ({stats?.totalAdmins || 0})
              </Button>
            </Box>
            
            {exportLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Preparing export file...
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Pending Registrations */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pending Registrations
            </Typography>
            
            {pendingRegistrations.length === 0 ? (
              <Alert severity="info">No pending registrations at this time.</Alert>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell>{registration.name}</TableCell>
                        <TableCell>{registration.email}</TableCell>
                        <TableCell>
                          <Chip
                            icon={getRoleIcon(registration.role)}
                            label={registration.role}
                            color={getRoleColor(registration.role) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(registration.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<Check />}
                              onClick={() => handleAction('approve', registration.id.toString())}
                              disabled={actionLoading === registration.id.toString()}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Close />}
                              onClick={() => handleAction('reject', registration.id.toString())}
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

      {/* Users Tab */}
      <TabPanel value={tabValue} index={1}>
        <Alert severity="info" sx={{ mb: 3 }}>
          👥 <strong>All Website Users:</strong> Displaying {users.length} total users. 
          Students: {users.filter(u => u.role === 'student').length}, 
          Colleges: {users.filter(u => u.role === 'college').length}, 
          Admins: {users.filter(u => u.role === 'admin').length}
          <br />
          🔑 <strong>Admin Powers:</strong> View, Edit, Change Passwords, Control Access, and Delete Users
        </Alert>

        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Search users"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
            placeholder="Search by name or email..."
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Role</InputLabel>
            <Select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="student">📚 Students Only</MenuItem>
              <MenuItem value="college">🏫 Colleges Only</MenuItem>
              <MenuItem value="admin">⚙️ Admins Only</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchUsers}>
            Refresh
          </Button>
          <Button 
            variant={userRoleFilter === 'student' ? 'contained' : 'outlined'}
            color="primary"
            startIcon={<Person />}
            onClick={() => setUserRoleFilter('student')}
          >
            Show Students Only
          </Button>
          {userRoleFilter !== 'all' && (
            <Button 
              variant="text"
              onClick={() => setUserRoleFilter('all')}
            >
              Show All Users
            </Button>
          )}
          
          {/* Export Buttons */}
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<GetApp />}
              onClick={() => handleExportUsers(userRoleFilter)}
              disabled={exportLoading}
              color="success"
            >
              Export {userRoleFilter === 'all' ? 'All' : userRoleFilter.charAt(0).toUpperCase() + userRoleFilter.slice(1)} 
              ({userRoleFilter === 'all' ? users.length : users.filter(u => u.role === userRoleFilter).length})
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Profile, Access & Delete Controls</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow 
                  key={user._id}
                  sx={{ 
                    backgroundColor: user.role === 'student' ? '#e3f2fd' : 'inherit',
                    '&:hover': { 
                      backgroundColor: user.role === 'student' ? '#bbdefb' : 'rgba(0, 0, 0, 0.04)' 
                    }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {user.role === 'student' && <span>📚</span>}
                      <Typography variant="body2" fontWeight={user.role === 'student' ? 'bold' : 'normal'}>
                        {user.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      color={user.role === 'student' ? 'primary.main' : 'text.primary'}
                    >
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getRoleIcon(user.role)}
                      label={user.role}
                      color={getRoleColor(user.role) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Tooltip title="View Profile">
                        <IconButton size="small" onClick={() => openProfileDialog('user', user, 'view')}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Profile">
                        <IconButton size="small" color="primary" onClick={() => openProfileDialog('user', user, 'edit')}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Change Password">
                        <IconButton size="small" color="warning" onClick={() => openPasswordDialog(user)}>
                          <Key />
                        </IconButton>
                      </Tooltip>
                      {user.isActive ? (
                        <Tooltip title="Disable Access">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => openAccessDialog(user, 'disable')}
                            disabled={user.role === 'admin' && user._id === sessionStorage.getItem('userId')}
                          >
                            <Block />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Enable Access">
                          <IconButton size="small" color="success" onClick={() => openAccessDialog(user, 'enable')}>
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete User Permanently">
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => openDeleteDialog(user)}
                          disabled={user.role === 'admin' && user._id === sessionStorage.getItem('userId')}
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: 'rgba(244, 67, 54, 0.1)',
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={userTotalPages}
            page={userPage}
            onChange={(_, page) => setUserPage(page)}
          />
        </Box>
      </TabPanel>



      {/* Delete User Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => !deleteDialog.loading && setDeleteDialog({ ...deleteDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          ⚠️ Delete User Permanently
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              <strong>Warning:</strong> This action is irreversible! The user and all associated data will be permanently deleted.
            </Alert>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              You are about to permanently delete:
            </Typography>
            
            <Card sx={{ p: 2, bgcolor: '#ffebee', border: '2px solid #f44336' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getRoleIcon(deleteDialog.user?.role || '')}
                <Box>
                  <Typography variant="h6" color="error">{deleteDialog.user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {deleteDialog.user?.email}
                  </Typography>
                  <Chip
                    label={deleteDialog.user?.role}
                    color={getRoleColor(deleteDialog.user?.role || '') as any}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
            </Card>
            
            <Typography variant="body2" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
              To confirm, please type the user's name exactly: <span style={{ color: '#f44336' }}>{deleteDialog.user?.name}</span>
            </Typography>
            
            <TextField
              fullWidth
              label="Type user name to confirm"
              value={deleteDialog.confirmText}
              onChange={(e) => setDeleteDialog({ ...deleteDialog, confirmText: e.target.value })}
              disabled={deleteDialog.loading}
              placeholder={`Type "${deleteDialog.user?.name}" to confirm`}
              error={deleteDialog.confirmText !== '' && deleteDialog.confirmText !== deleteDialog.user?.name}
              helperText={deleteDialog.confirmText !== '' && deleteDialog.confirmText !== deleteDialog.user?.name ? 
                'Name does not match. Please type the exact name.' : ''}
              sx={{ mt: 1 }}
            />
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              ⚠️ This will permanently remove:
              <br />• User account and profile information
              <br />• All associated data and history
              <br />• Any applications or submissions
              <br />• This action cannot be undone
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}
            disabled={deleteDialog.loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={deleteDialog.loading ? <CircularProgress size={20} /> : <Delete />}
            onClick={handleDeleteUser}
            disabled={deleteDialog.loading || deleteDialog.confirmText !== deleteDialog.user?.name}
          >
            {deleteDialog.loading ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Access Control Dialog */}
      <Dialog
        open={accessDialog.open}
        onClose={() => !accessDialog.loading && setAccessDialog({ ...accessDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {accessDialog.action === 'disable' ? '🚫 Disable User Access' : '✅ Enable User Access'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to {accessDialog.action} access for:
            </Typography>
            <Card sx={{ p: 2, bgcolor: accessDialog.action === 'disable' ? '#ffebee' : '#e8f5e8' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getRoleIcon(accessDialog.user?.role || '')}
                <Box>
                  <Typography variant="h6">{accessDialog.user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {accessDialog.user?.email}
                  </Typography>
                  <Chip
                    label={accessDialog.user?.role}
                    color={getRoleColor(accessDialog.user?.role || '') as any}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
            </Card>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {accessDialog.action === 'disable' 
                ? '⚠️ This user will not be able to login until access is restored.'
                : '✅ This user will be able to login and use the platform again.'
              }
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setAccessDialog({ ...accessDialog, open: false })}
            disabled={accessDialog.loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={accessDialog.action === 'disable' ? 'error' : 'success'}
            startIcon={accessDialog.loading ? <CircularProgress size={20} /> : 
              (accessDialog.action === 'disable' ? <Block /> : <CheckCircle />)
            }
            onClick={handleToggleAccess}
            disabled={accessDialog.loading}
          >
            {accessDialog.loading ? 'Processing...' : 
              (accessDialog.action === 'disable' ? 'Disable Access' : 'Enable Access')
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialog.open}
        onClose={() => !passwordDialog.loading && setPasswordDialog({ ...passwordDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          🔑 Change Password for {passwordDialog.user?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current User"
                  value={passwordDialog.user?.email || ''}
                  disabled
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="New Password"
                  value={passwordDialog.newPassword}
                  onChange={(e) => setPasswordDialog({ ...passwordDialog, newPassword: e.target.value })}
                  disabled={passwordDialog.loading}
                  placeholder="Enter new password (min 6 characters)"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm New Password"
                  value={passwordDialog.confirmPassword}
                  onChange={(e) => setPasswordDialog({ ...passwordDialog, confirmPassword: e.target.value })}
                  disabled={passwordDialog.loading}
                  placeholder="Confirm new password"
                  error={passwordDialog.newPassword !== '' && passwordDialog.confirmPassword !== '' && passwordDialog.newPassword !== passwordDialog.confirmPassword}
                  helperText={passwordDialog.newPassword !== '' && passwordDialog.confirmPassword !== '' && passwordDialog.newPassword !== passwordDialog.confirmPassword ? 'Passwords do not match' : ''}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPasswordDialog({ ...passwordDialog, open: false })}
            disabled={passwordDialog.loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={passwordDialog.loading ? <CircularProgress size={20} /> : <Key />}
            onClick={handleChangePassword}
            disabled={passwordDialog.loading || !passwordDialog.newPassword || !passwordDialog.confirmPassword}
          >
            {passwordDialog.loading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog
        open={profileDialog.open}
        onClose={() => setProfileDialog({ ...profileDialog, open: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {profileDialog.mode === 'edit' ? 'Edit' : 'View'} {profileDialog.type} Profile
        </DialogTitle>
        <DialogContent>
          {profileDialog.data && (
            <Box sx={{ mt: 2 }}>
              {profileDialog.type === 'user' && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      disabled={profileDialog.mode === 'view'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      disabled={profileDialog.mode === 'view'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={profileDialog.mode === 'view'}>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={editForm.role || ''}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      >
                        <MenuItem value="student">Student</MenuItem>
                        <MenuItem value="college">College</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      disabled={profileDialog.mode === 'view'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={editForm.location || ''}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      disabled={profileDialog.mode === 'view'}
                    />
                  </Grid>
                </Grid>
              )}


            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialog({ ...profileDialog, open: false })}>
            {profileDialog.mode === 'edit' ? 'Cancel' : 'Close'}
          </Button>
          {profileDialog.mode === 'view' && (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setProfileDialog({ ...profileDialog, mode: 'edit' })}
            >
              Edit
            </Button>
          )}
          {profileDialog.mode === 'edit' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Save />}
              onClick={handleSaveProfile}
            >
              Save Changes
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedAdminDashboard;