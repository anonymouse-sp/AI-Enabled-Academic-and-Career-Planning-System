import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Assignment,
  Person,
  School,
  CheckCircle,
  Cancel,
  Pending,
  Visibility,
  Edit
} from '@mui/icons-material';
import DashboardLayout from '../components/layout/DashboardLayout';

interface StudentApplication {
  _id: string;
  studentId: {
    _id: string;
    email: string;
    name?: string;
  };
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  studentInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
  };
  academicInfo: {
    currentEducation: string;
    institution: string;
    percentage: number;
    graduationYear: number;
  };
  courseInfo: {
    preferredCourse: string;
    alternativeCourse?: string;
  };
  additionalInfo: {
    extracurriculars?: string;
    achievements?: string;
    statement: string;
  };
}

const CollegeApplications: React.FC = () => {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<StudentApplication | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [statusMessage, setStatusMessage] = useState('');
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/applications/college-applications`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedApplication) return;

    try {
      setUpdating(true);
      const token = sessionStorage.getItem('token');
      
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/applications/${selectedApplication._id}/status`,
        {
          status: newStatus,
          message: statusMessage
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app._id === selectedApplication._id 
            ? { ...app, status: newStatus }
            : app
        )
      );

      setUpdateStatusOpen(false);
      setSelectedApplication(null);
      setStatusMessage('');
    } catch (error) {
      console.error('Error updating application status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'rejected':
        return <Cancel sx={{ color: 'error.main' }} />;
      default:
        return <Pending sx={{ color: 'warning.main' }} />;
    }
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  const filteredApplications = applications.filter(app => 
    filter === 'all' || app.status === filter
  );

  const getStatusCounts = () => {
    return {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <DashboardLayout title="Applications Management">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Applications Management">
      <Box sx={{ padding: 3 }}>
        {/* Header with Statistics */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Assignment sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Student Applications
            </Typography>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <CardContent>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {statusCounts.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Applications
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <CardContent>
                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                  {statusCounts.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Review
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <CardContent>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {statusCounts.approved}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <CardContent>
                <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                  {statusCounts.rejected}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rejected
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter Controls */}
        <Box sx={{ mb: 3 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={filter}
              label="Filter by Status"
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <MenuItem value="all">All Applications</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 4 }}>
            <CardContent>
              <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {filter === 'all' ? 'No Applications Yet' : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Applications`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filter === 'all' 
                  ? 'Students haven\'t applied to your college yet.'
                  : `No applications with ${filter} status found.`
                }
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredApplications.map((application) => (
              <Grid item xs={12} md={6} lg={4} key={application._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Student Info Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                          {application.studentInfo.firstName} {application.studentInfo.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {application.studentInfo.email}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Course and Status */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>
                        <School sx={{ verticalAlign: 'middle', mr: 1, fontSize: 18 }} />
                        {application.courseInfo.preferredCourse}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Applied on: {new Date(application.submittedAt).toLocaleDateString()}
                      </Typography>
                    </Box>

                    {/* Academic Info */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {application.academicInfo.percentage}% • {application.academicInfo.currentEducation}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {application.academicInfo.institution}
                      </Typography>
                    </Box>

                    {/* Status and Actions */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Chip
                        icon={getStatusIcon(application.status)}
                        label={application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        color={getStatusColor(application.status)}
                        variant="filled"
                      />
                      <Box>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedApplication(application);
                              setDetailsOpen(true);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Update Status">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedApplication(application);
                              setNewStatus(application.status);
                              setUpdateStatusOpen(true);
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Application Details Dialog */}
        <Dialog 
          open={detailsOpen} 
          onClose={() => setDetailsOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Application Details
          </DialogTitle>
          <DialogContent>
            {selectedApplication && (
              <Box sx={{ pt: 1 }}>
                {/* Personal Information */}
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1 }} />
                  Personal Information
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1">
                      {selectedApplication.studentInfo.firstName} {selectedApplication.studentInfo.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{selectedApplication.studentInfo.email}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{selectedApplication.studentInfo.phone}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                    <Typography variant="body1">
                      {new Date(selectedApplication.studentInfo.dateOfBirth).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Gender</Typography>
                    <Typography variant="body1">{selectedApplication.studentInfo.gender}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Nationality</Typography>
                    <Typography variant="body1">{selectedApplication.studentInfo.nationality}</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Academic Information */}
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  <School sx={{ mr: 1 }} />
                  Academic Information
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Current Education</Typography>
                    <Typography variant="body1">{selectedApplication.academicInfo.currentEducation}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Institution</Typography>
                    <Typography variant="body1">{selectedApplication.academicInfo.institution}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Percentage/CGPA</Typography>
                    <Typography variant="body1">{selectedApplication.academicInfo.percentage}%</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Graduation Year</Typography>
                    <Typography variant="body1">{selectedApplication.academicInfo.graduationYear}</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Course Preferences */}
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Course Preferences
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Preferred Course</Typography>
                    <Typography variant="body1">{selectedApplication.courseInfo.preferredCourse}</Typography>
                  </Grid>
                  {selectedApplication.courseInfo.alternativeCourse && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Alternative Course</Typography>
                      <Typography variant="body1">{selectedApplication.courseInfo.alternativeCourse}</Typography>
                    </Grid>
                  )}
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Additional Information */}
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Additional Information
                </Typography>
                
                {selectedApplication.additionalInfo.extracurriculars && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Extracurricular Activities</Typography>
                    <Typography variant="body1">{selectedApplication.additionalInfo.extracurriculars}</Typography>
                  </Box>
                )}
                
                {selectedApplication.additionalInfo.achievements && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Achievements</Typography>
                    <Typography variant="body1">{selectedApplication.additionalInfo.achievements}</Typography>
                  </Box>
                )}
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Personal Statement</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedApplication.additionalInfo.statement}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Application Status */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Application Status</Typography>
                    <Chip
                      icon={getStatusIcon(selectedApplication.status)}
                      label={selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                      color={getStatusColor(selectedApplication.status)}
                      variant="filled"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Submitted On</Typography>
                    <Typography variant="body1">
                      {new Date(selectedApplication.submittedAt).toLocaleDateString()} at{' '}
                      {new Date(selectedApplication.submittedAt).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
            <Button 
              variant="contained"
              onClick={() => {
                setDetailsOpen(false);
                if (selectedApplication) {
                  setNewStatus(selectedApplication.status);
                  setUpdateStatusOpen(true);
                }
              }}
            >
              Update Status
            </Button>
          </DialogActions>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog 
          open={updateStatusOpen} 
          onClose={() => setUpdateStatusOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Update Application Status
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              {selectedApplication && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Updating status for: {selectedApplication.studentInfo.firstName} {selectedApplication.studentInfo.lastName}
                </Alert>
              )}
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newStatus}
                  label="Status"
                  onChange={(e) => setNewStatus(e.target.value as any)}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Message to Student (Optional)"
                multiline
                rows={3}
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                helperText="This message will be sent to the student via email."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUpdateStatusOpen(false)} disabled={updating}>
              Cancel
            </Button>
            <Button 
              variant="contained"
              onClick={handleUpdateStatus}
              disabled={updating}
            >
              {updating ? <CircularProgress size={20} /> : 'Update Status'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default CollegeApplications;