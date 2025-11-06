import { Box, Typography, IconButton, SvgIcon } from '@mui/material';
import { Facebook, LinkedIn, Instagram, YouTube } from '@mui/icons-material';
import { College } from '../../types/college';

interface MediaGalleryTabProps {
  college: College;
}

// Custom X (formerly Twitter) icon component
const XIcon = () => (
  <SvgIcon viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </SvgIcon>
);

export const MediaGalleryTab = ({ college }: MediaGalleryTabProps) => {
  // Helper function to ensure URL has proper protocol
  const formatSocialMediaUrl = (url?: string): string => {
    if (!url) return '';
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    // Default to https for social media platforms
    return `https://${trimmedUrl}`;
  };

  // Handle social media link clicks to prevent app navigation issues
  const handleSocialMediaClick = (url?: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!url) return;
    const formattedUrl = formatSocialMediaUrl(url);
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {/* Social Media Section */}
      {college.socialMedia && Object.values(college.socialMedia).some(url => url && url.trim()) ? (
        <Box>
          <Typography variant="h6" gutterBottom>
            Connect with {college.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
            {college.socialMedia?.facebook && (
              <IconButton
                onClick={(e) => handleSocialMediaClick(college.socialMedia?.facebook, e)}
                sx={{
                  color: '#1877F2',
                  border: 1,
                  borderColor: '#1877F2',
                  '&:hover': {
                    backgroundColor: '#1877F2',
                    color: 'white',
                  },
                  cursor: 'pointer',
                }}
                title="Visit Facebook Page"
              >
                <Facebook />
              </IconButton>
            )}
            
            {college.socialMedia?.twitter && (
              <IconButton
                onClick={(e) => handleSocialMediaClick(college.socialMedia?.twitter, e)}
                sx={{
                  color: '#000000',
                  border: 1,
                  borderColor: '#000000',
                  '&:hover': {
                    backgroundColor: '#000000',
                    color: 'white',
                  },
                  cursor: 'pointer',
                }}
                title="Visit X Page"
              >
                <XIcon />
              </IconButton>
            )}
            
            {college.socialMedia?.linkedin && (
              <IconButton
                onClick={(e) => handleSocialMediaClick(college.socialMedia?.linkedin, e)}
                sx={{
                  color: '#0A66C2',
                  border: 1,
                  borderColor: '#0A66C2',
                  '&:hover': {
                    backgroundColor: '#0A66C2',
                    color: 'white',
                  },
                  cursor: 'pointer',
                }}
                title="Visit LinkedIn Page"
              >
                <LinkedIn />
              </IconButton>
            )}
            
            {college.socialMedia?.instagram && (
              <IconButton
                onClick={(e) => handleSocialMediaClick(college.socialMedia?.instagram, e)}
                sx={{
                  color: '#E4405F',
                  border: 1,
                  borderColor: '#E4405F',
                  '&:hover': {
                    backgroundColor: '#E4405F',
                    color: 'white',
                  },
                  cursor: 'pointer',
                }}
                title="Visit Instagram Page"
              >
                <Instagram />
              </IconButton>
            )}
            
            {college.socialMedia?.youtube && (
              <IconButton
                onClick={(e) => handleSocialMediaClick(college.socialMedia?.youtube, e)}
                sx={{
                  color: '#FF0000',
                  border: 1,
                  borderColor: '#FF0000',
                  '&:hover': {
                    backgroundColor: '#FF0000',
                    color: 'white',
                  },
                  cursor: 'pointer',
                }}
                title="Visit YouTube Channel"
              >
                <YouTube />
              </IconButton>
            )}
          </Box>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No Social Media Links Available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This college has not provided any social media information.
          </Typography>
        </Box>
      )}
    </Box>
  );
};