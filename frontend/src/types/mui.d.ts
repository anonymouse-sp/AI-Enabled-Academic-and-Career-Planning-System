import '@mui/material/styles';
import '@mui/material/Grid';
import { Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
    };
  }

  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}

declare module '@mui/material/Grid' {
  interface GridBaseProps {
    item?: boolean;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  }
}