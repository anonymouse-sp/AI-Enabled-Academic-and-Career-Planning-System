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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface PendingRegistration {
  id: string | number;
  name: string;
  email: string;
  role: 'student' | 'college' | 'admin';
  createdAt: string;
}

const SimpleAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    console.log('🚀 SimpleAdminDashboard: Starting fetchPendingRegistrations');
    setLoading(true);
    setFetchError(null);
    
    try {
      const token = sessionStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      
      if (!token) {
        setFetchError('No authentication token found');
        setLoading(false);
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('🌐 API URL:', API_URL);
      
      const response = await fetch(`${API_URL}/api/admin/pending-registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Data received:', data);
        
        if (data.pendingRegistrations && Array.isArray(data.pendingRegistrations)) {
          console.log('📋 Setting pending registrations:', data.pendingRegistrations.length, 'items');
          setPendingRegistrations(data.pendingRegistrations);
          
          if (data.pendingRegistrations.length === 0) {
            showSuccess('No pending registrations found.');
          } else {
            showSuccess(`Found ${data.pendingRegistrations.length} pending registrations.`);
          }
        } else {
          console.error('❌ Invalid data structure');
          setFetchError('Invalid response format from server');
          setPendingRegistrations([]);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ API error:', errorText);
        setFetchError(`API Error: ${response.status}`);
        setPendingRegistrations([]);
      }
    } catch (error) {
      console.error('💥 Network error:', error);
      setFetchError(`Network error: ${(error as Error).message}`);
      setPendingRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string | number, name: string) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/approve-registration/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showSuccess(`✅ Successfully approved ${name}!`);
        await fetchPendingRegistrations(); // Refresh the list
      } else {
        const errorData = await response.json();
        showError(`Failed to approve ${name}: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Approval error:', error);
      showError(`Network error while approving ${name}`);
    }
  };

  const handleReject = async (id: string | number, name: string) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/reject-registration/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showSuccess(`❌ Successfully rejected ${name}`);
        await fetchPendingRegistrations(); // Refresh the list
      } else {
        const errorData = await response.json();
        showError(`Failed to reject ${name}: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Rejection error:', error);
      showError(`Network error while rejecting ${name}`);
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading pending registrations...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🔐 Simple Admin Dashboard
      </Typography>
      
      {/* Debug Information */}
      <Card sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
        <CardContent>
          <Typography variant="h6" color="primary">🔍 Debug Information</Typography>
          <Typography variant="body2">
            <strong>User:</strong> {user?.name} ({user?.role}) {user?.isHeadAdmin && '(Head Admin)'}
          </Typography>
          <Typography variant="body2">
            <strong>Pending Count:</strong> {pendingRegistrations.length}
          </Typography>
          <Typography variant="body2">
            <strong>Colleges:</strong> {pendingRegistrations.filter((r: PendingRegistration) => r.role === 'college').length}
          </Typography>
          <Typography variant="body2">
            <strong>Admins:</strong> {pendingRegistrations.filter((r: PendingRegistration) => r.role === 'admin').length}
          </Typography>
          <Typography variant="body2">
            <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
          </Typography>
          <Typography variant="body2">
            <strong>Error:</strong> {fetchError || 'None'}
          </Typography>
        </CardContent>
      </Card>

      {fetchError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body1"><strong>Error:</strong> {fetchError}</Typography>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={fetchPendingRegistrations}
            sx={{ mt: 1 }}
          >
            Retry
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
                onClick={fetchPendingRegistrations}
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
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<Close />}
                            onClick={() => handleReject(registration.id, registration.name)}
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
    </Box>
  );
};

export default SimpleAdminDashboard;