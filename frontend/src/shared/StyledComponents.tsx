import { styled } from '@mui/material/styles';
import { Paper, Box } from '@mui/material';

export const AuthWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
}));

export const AuthPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  maxWidth: 400,
  width: '100%',
}));

type FormProps = {
  component: 'form';
};

export const FormBox = styled('form')<FormProps>(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
}));