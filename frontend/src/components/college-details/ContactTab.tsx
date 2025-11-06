import { Box, Typography, Paper, Button, Stack, Link, IconButton, Tooltip, Divider } from '@mui/material';
import { College } from '../../types/college';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import DirectionsIcon from '@mui/icons-material/Directions';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useState } from 'react';

interface ContactTabProps {
  college: College;
}

export const ContactTab = ({ college }: ContactTabProps) => {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const openMap = () => {
    const { latitude, longitude } = college.location.coordinates;
    window.open(
      `https://www.google.com/maps?q=${latitude},${longitude}`,
      '_blank'
    );
  };

  const openDirections = () => {
    const { latitude, longitude } = college.location.coordinates;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
      '_blank'
    );
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const openWhatsApp = () => {
    const phone = college.contactInfo.phone.replace(/[^0-9]/g, '');
    window.open(
      `https://wa.me/${phone}`,
      '_blank'
    );
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Quick Actions */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Stack 
            direction="row" 
            spacing={2} 
            sx={{ mt: 2, flexWrap: 'wrap', gap: 2 }}
          >
            <Button
              variant="contained"
              startIcon={<EmailIcon />}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  const emailUrl = `mailto:${college.contactInfo.email}`;
                  // Set a flag to prevent logout during mailto navigation
                  sessionStorage.setItem('navigatingToContact', 'true');
                  setTimeout(() => {
                    sessionStorage.removeItem('navigatingToContact');
                  }, 2000);
                  window.location.assign(emailUrl);
                } catch (err) {
                  console.error('Failed to open email app:', err);
                }
              }}
            >
              Send Email
            </Button>
            <Button
              variant="contained"
              startIcon={<WhatsAppIcon />}
              onClick={openWhatsApp}
              color="success"
            >
              WhatsApp
            </Button>
            <Button
              variant="contained"
              startIcon={<DirectionsIcon />}
              onClick={openDirections}
              color="secondary"
            >
              Get Directions
            </Button>
          </Stack>
        </Paper>

        {/* Contact Information */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Contact Information
          </Typography>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <EmailIcon color="primary" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Link 
                    underline="hover"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      try {
                        const emailUrl = `mailto:${college.contactInfo.email}`;
                        // Set a flag to prevent logout during mailto navigation
                        sessionStorage.setItem('navigatingToContact', 'true');
                        setTimeout(() => {
                          sessionStorage.removeItem('navigatingToContact');
                        }, 2000);
                        window.location.assign(emailUrl);
                      } catch (err) {
                        console.error('Failed to open email app:', err);
                      }
                    }}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Typography variant="body1">
                      {college.contactInfo.email}
                    </Typography>
                  </Link>
                  <Tooltip title={copySuccess === 'email' ? 'Copied!' : 'Copy email'}>
                    <IconButton 
                      size="small" 
                      onClick={() => copyToClipboard(college.contactInfo.email, 'email')}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
            
            <Divider />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PhoneIcon color="primary" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Link 
                    underline="hover"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      try {
                        const phoneUrl = `tel:${college.contactInfo.phone}`;
                        // Set a flag to prevent logout during tel navigation
                        sessionStorage.setItem('navigatingToContact', 'true');
                        setTimeout(() => {
                          sessionStorage.removeItem('navigatingToContact');
                        }, 2000);
                        window.location.assign(phoneUrl);
                      } catch (err) {
                        console.error('Failed to open phone app:', err);
                      }
                    }}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Typography variant="body1">
                      {college.contactInfo.phone}
                    </Typography>
                  </Link>
                  <Tooltip title={copySuccess === 'phone' ? 'Copied!' : 'Copy phone'}>
                    <IconButton 
                      size="small" 
                      onClick={() => copyToClipboard(college.contactInfo.phone, 'phone')}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
            
            <Divider />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LanguageIcon color="primary" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Website
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Link href={college.website} target="_blank" rel="noopener noreferrer" underline="hover">
                    <Typography variant="body1">
                      {college.website}
                    </Typography>
                  </Link>
                  <Tooltip title={copySuccess === 'website' ? 'Copied!' : 'Copy URL'}>
                    <IconButton 
                      size="small" 
                      onClick={() => copyToClipboard(college.website, 'website')}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
            
            <Divider />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <LocationOnIcon color="primary" sx={{ mt: 0.5 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {college.contactInfo.address}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {college.location.city}, {college.location.state}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {college.location.country}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={openMap}
                    startIcon={<LocationOnIcon />}
                  >
                    View on Map
                  </Button>
                  <Tooltip title={copySuccess === 'address' ? 'Copied!' : 'Copy address'}>
                    <IconButton 
                      size="small" 
                      onClick={() => copyToClipboard(college.contactInfo.address, 'address')}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AccessTimeIcon color="primary" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Office Hours
                </Typography>
                <Typography variant="body1">
                  Monday - Friday: 9:00 AM - 5:00 PM
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Closed on weekends and public holidays
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};