import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'college' | 'admin';
  isHeadAdmin?: boolean;
  profilePictureUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, expectedRole: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'student' | 'college' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear auth data helper function
  const clearAuthData = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  useEffect(() => {
    // Setup axios interceptor to handle token expiration
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Token is invalid or expired
          console.log('Token expired or invalid, clearing auth data');
          clearAuthData();
          // Optionally redirect to login page
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );

    // Setup window beforeunload event to clear session data when browser closes
    const handleBeforeUnload = () => {
      // Check if we're navigating to contact (tel/mailto) - don't logout in this case
      const navigatingToContact = sessionStorage.getItem('navigatingToContact');
      if (navigatingToContact) {
        return; // Don't clear auth data for contact navigation
      }
      // This ensures session data is cleared when browser/tab closes
      clearAuthData();
    };

    // Setup visibility change event to detect when user closes tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Optional: Clear session when tab is hidden/minimized
        // Uncomment the next line if you want to logout when switching tabs
        // clearAuthData();
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const initAuth = async () => {
      try {
        const savedToken = sessionStorage.getItem('token');
        const savedUser = sessionStorage.getItem('user');

        if (savedToken && savedUser) {
          // Validate token with backend before restoring session
          try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/profile`);
            
            // If token is valid, restore the session
            if (response.data) {
              setToken(savedToken);
              setUser(JSON.parse(savedUser));
            }
          } catch (validationError) {
            // Token is invalid or expired, clear auth data
            console.log('Token validation failed, clearing auth data');
            clearAuthData();
          }
        }
      } catch (err) {
        setError('Failed to restore auth state');
        // Clear potentially corrupted data
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Cleanup interceptor and event listeners on unmount
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const login = async (email: string, password: string, expectedRole: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Clear any existing auth data before attempting login
      clearAuthData();
      
      // Validate that expectedRole is provided
      if (!expectedRole) {
        throw new Error('Role specification is required for login');
      }
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email,
        password,
        expectedRole
      });

      const { token: newToken, user: newUser } = response.data;

      // Validate the received token by making a test API call
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      await axios.get(`${import.meta.env.VITE_API_URL}/api/user/profile`);

      // If validation passes, set the auth state
      setToken(newToken);
      setUser(newUser);
      sessionStorage.setItem('token', newToken);
      sessionStorage.setItem('user', JSON.stringify(newUser));
    } catch (err: any) {
      // Clear auth data on login failure
      clearAuthData();
      
      let errorMessage = 'Login failed. Please try again.';
      let errorType = 'error'; // default error type
      
      if (err.response?.data) {
        const { error, message } = err.response.data;
        
        // Handle specific error types with appropriate messages and types
        switch (error) {
          case 'User not found':
            errorMessage = message || 'No account found with this email address. Please check your email or sign up.';
            errorType = 'warning';
            break;
            
          case 'Invalid password':
            errorMessage = message || 'Incorrect password. Please check your password and try again.';
            errorType = 'error';
            break;
            
          case 'Role mismatch':
            errorMessage = message || 'Please use the correct login page for your account type.';
            errorType = 'warning';
            break;
            
          case 'Account pending approval':
            errorMessage = message || 'Your account is pending approval. Please wait for admin approval.';
            errorType = 'info';
            break;
            
          case 'Account rejected':
            errorMessage = message || 'Your account has been rejected. Please contact support.';
            errorType = 'error';
            break;
            
          default:
            errorMessage = message || error || 'Login failed. Please try again.';
            errorType = 'error';
        }
      } else {
        errorMessage = err.message || 'Login failed. Please try again.';
      }
      
      setError(errorMessage);
      
      // Create a detailed error to pass back to components
      const detailedError = new Error(errorMessage);
      (detailedError as any).type = errorType;
      (detailedError as any).originalError = err.response?.data?.error;
      
      throw detailedError;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: 'student' | 'college' | 'admin') => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        name,
        email,
        password,
        role
      });

      // For students, set user data immediately since they're approved
      if (response.data.status === 'approved' && response.data.user) {
        // Don't auto-login, just return the result
        // setToken and setUser are not called here to avoid auto-login
        return response.data;
      }

      // For colleges/admins or pending registrations, just return the response
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      // Add any async cleanup operations here
      clearAuthData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      throw new Error('Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};