import { Box, Container, Paper, Theme } from '@mui/material';
import { styled } from '@mui/material/styles';

export const AuthWrapper = styled(Container)(({ theme }: { theme: Theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '100vh',
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
}));

export const AuthPaper = styled(Paper)(({ theme }: { theme: Theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '450px',
  width: '100%',
}));

export const FormBox = styled(Box)({
  width: '100%',
  marginTop: 1,
});