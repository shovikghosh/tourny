'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useMemo, useEffect } from 'react'
import { ThemeProvider as NextThemeProvider, useTheme } from '@/context/ThemeContext'
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

// Material UI theme creator with light/dark mode support
function MaterialUITheme({ children }: { children: React.ReactNode }) {
  const { theme: appTheme } = useTheme();
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  
  // Listen to theme changes from Next theme provider
  useEffect(() => {
    setMode(appTheme === 'dark' ? 'dark' : 'light');
  }, [appTheme]);

  // Create the MUI theme based on the current mode
  const theme = useMemo(() => 
    createTheme({
      palette: {
        mode,
        primary: {
          main: '#3f51b5',
        },
        secondary: {
          main: '#f50057',
        },
        background: {
          default: mode === 'light' ? '#f5f5f5' : '#121212',
          paper: mode === 'light' ? '#fafafa' : '#1e1e1e',
        },
      },
      typography: {
        fontFamily: 'var(--font-inter), var(--font-roboto), sans-serif',
        h1: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
        h2: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
        h3: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
        h4: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
        h5: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
        h6: {
          fontFamily: 'var(--font-poppins), sans-serif',
        },
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: '12px',
              boxShadow: mode === 'light' 
                ? '0 4px 6px rgba(0, 0, 0, 0.04)' 
                : '0 4px 6px rgba(0, 0, 0, 0.2)',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
            },
          },
        },
        MuiTextField: {
          defaultProps: {
            variant: 'standard',
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
          },
        },
      },
    }), [mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemeProvider>
        <MaterialUITheme>
          {children}
        </MaterialUITheme>
      </NextThemeProvider>
    </QueryClientProvider>
  )
} 