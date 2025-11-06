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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import { AuthWrapper, AuthPaper, FormBox } from '../shared/StyledComponents';

const validationSchema = yup.object({
  name: yup
    .string()
    .required('Name is required'),
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password should be of minimum 6 characters length')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
  role: yup
    .string()
    .oneOf(['student', 'college', 'admin'], 'Please select a valid role')
    .required('Role is required'),
});

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setError('');
        setSuccess('');
        await register(values.name, values.email, values.password, values.role as 'student' | 'college' | 'admin');
        
        // Handle different responses based on registration result
        if (values.role === 'student') {
          showSuccess('🎉 Student registration successful! You can now login using the Student Login page.');
          setSuccess('🎉 Student registration successful! You can now login using the Student Login page.');
          // Auto-redirect to student login after a delay
          setTimeout(() => {
            navigate('/login/student');
          }, 2000);
        } else if (values.role === 'college') {
          showInfo('📋 College registration submitted successfully! Please wait for admin approval before you can login. You will be notified once approved.');
          setSuccess('📋 College registration submitted! Please wait for admin approval before you can login. You will be notified once approved.');
        } else if (values.role === 'admin') {
          showInfo('⏳ Admin registration submitted successfully! Please wait for approval from the head admin only.');
          setSuccess('⏳ Admin registration submitted! Please wait for approval from the head admin only.');
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to create an account.';
        showError(`❌ Registration failed: ${errorMessage}`);
        setError(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <AuthWrapper>
      <AuthPaper elevation={3}>
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        <FormBox onSubmit={formik.handleSubmit} component="form">
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          <TextField
            margin="normal"
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
          <TextField
            margin="normal"
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            margin="normal"
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <TextField
            margin="normal"
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={formik.values.role}
              label="Role"
              onChange={formik.handleChange}
              error={formik.touched.role && Boolean(formik.errors.role)}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="college">College</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          <Typography variant="body2" align="center">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" variant="body2">
              Sign In
            </Link>
          </Typography>
        </FormBox>
      </AuthPaper>
    </AuthWrapper>
  );
};

export default Register;