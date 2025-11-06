import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './theme/ThemeProvider';
import App from './App';

export default function Root() {
  return (
    <StrictMode>
      <ThemeProvider>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </StrictMode>
  );
}