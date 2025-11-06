import { ReactNode, useState } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  School,
  Search,
  Quiz,
  Person,
  Assignment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useEffect } from 'react';
import axios from 'axios';

const drawerWidth = 240;

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {

  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Fetch profile picture for students and colleges
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const token = sessionStorage.getItem('token');
        let response;
        
        if (user?.role === 'student') {
          response = await axios.get(`${import.meta.env.VITE_API_URL}/api/student/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.profilePictureUrl) {
            setProfilePictureUrl(response.data.profilePictureUrl);
          }
        } else if (user?.role === 'college') {
          response = await axios.get(`${import.meta.env.VITE_API_URL}/api/college/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.profilePicture) {
            setProfilePictureUrl(response.data.profilePicture);
          }
        }
      } catch (error) {
        console.log('Could not fetch profile picture:', error);
      }
    };

    fetchProfilePicture();

    // Listen for profile picture updates
    const handleProfilePictureUpdate = (event: CustomEvent) => {
      setProfilePictureUrl(event.detail.profilePictureUrl || event.detail.profilePicture);
    };

    window.addEventListener('profilePictureUpdate', handleProfilePictureUpdate as EventListener);
    window.addEventListener('profileUpdated', handleProfilePictureUpdate as EventListener);

    return () => {
      window.removeEventListener('profilePictureUpdate', handleProfilePictureUpdate as EventListener);
      window.removeEventListener('profileUpdated', handleProfilePictureUpdate as EventListener);
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      showSuccess('👋 Successfully logged out. Have a great day!');
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      showError('❌ Logout failed. Please try again.');
    }
  };

  const menuItems = user?.role === 'college' ? [
    { text: 'Dashboard', icon: <School />, path: '/dashboard' },
    { text: 'Manage College', icon: <Person />, path: '/college-profile' },
    { text: 'Applications', icon: <Assignment />, path: '/college/applications' },
  ] : [
    { text: 'Dashboard', icon: <School />, path: '/dashboard' },
    { text: 'Find Colleges', icon: <Search />, path: '/colleges' },
    { text: 'My Applications', icon: <Assignment />, path: '/applications' },
    { text: 'Take Quiz', icon: <Quiz />, path: '/quiz' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
  ];

  const drawer = (
    <Box>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              sx={{ width: 32, height: 32 }}
              src={profilePictureUrl ? (
                profilePictureUrl.startsWith('data:') 
                  ? profilePictureUrl 
                  : `${import.meta.env.VITE_API_URL}${profilePictureUrl}`
              ) : undefined}
            >
              <Person />
            </Avatar>
            <Typography variant="body1" sx={{ mr: 1 }}>
              {user?.name}
            </Typography>
          </Box>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;