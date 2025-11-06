import { IconButton, Tooltip, useTheme as useMuiTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../../theme/ThemeProvider';

export const ThemeToggle = () => {
  const { mode, toggleTheme } = useTheme();
  const theme = useMuiTheme();

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        sx={{
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'rotate(180deg)',
          },
        }}
      >
        {mode === 'light' ? (
          <Brightness4Icon
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': { color: theme.palette.primary.main },
            }}
          />
        ) : (
          <Brightness7Icon
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': { color: theme.palette.primary.main },
            }}
          />
        )}
      </IconButton>
    </Tooltip>
  );
};