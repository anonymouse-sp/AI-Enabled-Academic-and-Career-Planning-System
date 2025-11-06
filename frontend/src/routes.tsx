import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import StudentLogin from './pages/StudentLogin';
import CollegeLogin from './pages/CollegeLogin';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CollegeSearch from './pages/CollegeSearch';
import CollegeDetails from './pages/CollegeDetails';
import AdminDashboard from './components/AdminDashboard';
import StudentProfile from './components/StudentProfile';
import CollegeProfileManager from './components/CollegeProfileManager';
import CareerQuiz from './pages/CareerQuiz';
import MyApplications from './pages/MyApplications';
import CollegeApplications from './pages/CollegeApplications';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Role-based dashboard redirect
  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'student':
        return '/student/dashboard';
      case 'college':
        return '/college/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <Routes>
      {/* Landing and Login Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login/student" element={!user ? <StudentLogin /> : <Navigate to={getDashboardPath()} />} />
      <Route path="/login/college" element={!user ? <CollegeLogin /> : <Navigate to={getDashboardPath()} />} />
      <Route path="/login/admin" element={!user ? <AdminLogin /> : <Navigate to={getDashboardPath()} />} />
      
      {/* Legacy login route - redirect to landing */}
      <Route path="/login" element={!user ? <Navigate to="/" /> : <Navigate to={getDashboardPath()} />} />
      
      {/* Registration */}
      <Route path="/register" element={!user ? <Register /> : <Navigate to={getDashboardPath()} />} />
      
      {/* Role-based Dashboard Routes */}
      <Route 
        path="/student/dashboard" 
        element={user && user.role === 'student' ? <Dashboard /> : <Navigate to="/" />} 
      />
      <Route 
        path="/college/dashboard" 
        element={user && user.role === 'college' ? <Dashboard /> : <Navigate to="/" />} 
      />
      <Route 
        path="/admin/dashboard" 
        element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} 
      />
      
      {/* Legacy dashboard route */}
      <Route path="/dashboard" element={user ? <Navigate to={getDashboardPath()} /> : <Navigate to="/" />} />
      
      {/* College Search - available to students and colleges */}
      <Route 
        path="/colleges" 
        element={user && (user.role === 'student' || user.role === 'college') ? <CollegeSearch /> : <Navigate to="/" />} 
      />
      
      {/* College Details - available to students and colleges */}
      <Route 
        path="/colleges/:id" 
        element={user && (user.role === 'student' || user.role === 'college') ? <CollegeDetails /> : <Navigate to="/" />} 
      />
      
      {/* Student Profile - only for students */}
      <Route 
        path="/profile" 
        element={user && user.role === 'student' ? <StudentProfile /> : <Navigate to="/" />} 
      />
      
      {/* College Profile - only for colleges */}
      <Route 
        path="/college-profile" 
        element={user && user.role === 'college' ? <CollegeProfileManager /> : <Navigate to="/" />} 
      />
      
      {/* Career Quiz - only for students */}
      <Route 
        path="/quiz" 
        element={user && user.role === 'student' ? <CareerQuiz /> : <Navigate to="/" />} 
      />
      
      {/* My Applications - only for students */}
      <Route 
        path="/applications" 
        element={user && user.role === 'student' ? <MyApplications /> : <Navigate to="/" />} 
      />
      
      {/* College Applications Management - only for colleges */}
      <Route 
        path="/college/applications" 
        element={user && user.role === 'college' ? <CollegeApplications /> : <Navigate to="/" />} 
      />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to={user ? getDashboardPath() : '/'} />} />
    </Routes>
  );
};

export default AppRoutes;