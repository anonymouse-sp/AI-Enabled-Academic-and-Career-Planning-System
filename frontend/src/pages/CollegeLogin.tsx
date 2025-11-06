import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  Box,
  Paper,
  Container,
} from '@mui/material';
import { School } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password should be of minimum 6 characters length')
    .required('Password is required'),
});

const CollegeLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setError('');
        await login(values.email, values.password, 'college');
        showSuccess('🏫 Welcome! Successfully logged in as College.');
        navigate('/college/dashboard');
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to login. Please check your credentials.';
        const errorType = (err as any).type || 'error';
        
        // Show appropriate toast notification based on error type
        switch (errorType) {
          case 'warning':
            showWarning(errorMessage);
            break;
          case 'info':
            showInfo(errorMessage);
            break;
          case 'error':
          default:
            showError(errorMessage);
            break;
        }
        
        // Set local error state for form display
        setError(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <School sx={{ fontSize: '3rem', color: '#2e7d32', mb: 2 }} />
            <Typography component="h1" variant="h4" sx={{ mb: 1, color: '#2e7d32' }}>
              College Login
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              Manage your institution profile and connect with students
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
              ⚠️ This login is only for colleges. Students and admins should use their respective login pages.
            </Typography>
            
            <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="College Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  backgroundColor: '#2e7d32',
                  '&:hover': {
                    backgroundColor: '#1b5e20',
                  },
                }}
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? <CircularProgress size={24} /> : 'Sign In as College'}
              </Button>
              
              <Box sx={{ textAlign: 'center' }}>
                <Link component={RouterLink} to="/" variant="body2">
                  ← Back to user selection
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CollegeLogin;