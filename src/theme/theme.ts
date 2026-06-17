import { createTheme } from '@mui/material/styles';

const sharedTypography = {
  h4: {
    fontSize: '1.5rem',
  },
};

const sharedComponents = {
  MuiButton: {
    defaultProps: {
      color: 'primary' as const,
    },
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
        color: '#43946C',
      },
      contained: {
        color: '#FFFFFF',
        '&:disabled': {
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
      sizeSmall: {
        fontSize: '0.875rem',
      },
      startIcon: {
        alignItems: 'center',
        display: 'flex',
      },
      endIcon: {
        alignItems: 'center',
        display: 'flex',
      },
    },
    variants: [
      {
        props: { variant: 'customWhite' as never },
        style: {
          backgroundColor: '#ffffff',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#f0f0f0',
          },
        },
      },
      {
        props: { variant: 'customBlack' as never },
        style: {
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#222222',
          },
        },
      },
      {
        props: { variant: 'customBlackOutlined' as never },
        style: {
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#222222',
          },
          border: '1px solid #52525B',
        },
      },
    ],
  },
  MuiCssBaseline: {
    styleOverrides: {
      a: {
        color: '#43946C',
        textDecoration: 'none',
        '&:hover': {
          textDecoration: 'underline'
        }
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: {
        color: '#43946C',
      },
    },
  },
  MuiDatePicker: {
    defaultProps: {
      displayWeekNumber: true,
    },
  },
};

export const darkTheme = createTheme({
  typography: sharedTypography,
  palette: {
    mode: 'dark',
    primary: {
      main: '#43946C',
    },
    secondary: {
      main: '#3F3F46',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A1A1AA',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    background: {
      default: '#121212',
      paper: '#121212',
    },
  },
  components: {
    ...sharedComponents,
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          backgroundColor: 'transparent',
          color: '#FFFFFF',
          '&:focus': {
            backgroundColor: 'transparent',
          },
        },
        nativeInput: {
          backgroundColor: 'transparent',
          color: '#FFFFFF',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.7)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FFFFFF',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#43946C',
            borderWidth: '2px',
          },
        },
        input: {
          color: '#FFFFFF',
          '&::placeholder': {
            color: 'rgba(255, 255, 255, 0.7)',
            opacity: 1,
          },
        },
        notchedOutline: {
          '& > legend': {
            color: 'rgba(255, 255, 255, 0.7) !important',
            backgroundColor: '#2A2A2A',
            '&.Mui-focused': {
              color: '#FFFFFF !important',
            },
            '& span': {
              color: 'rgba(255, 255, 255, 0.7) !important',
            }
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#3A3A3A',
          },
          '&.Mui-selected:hover': {
            backgroundColor: '#4A4A4A',
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.7)',
          '&.Mui-focused': {
            color: '#FFFFFF',
          },
        },
      },
    },
  },
});

export const lightTheme = createTheme({
  typography: sharedTypography,
  palette: {
    mode: 'light',
    primary: {
      main: '#43946C',
    },
    secondary: {
      main: '#3F3F46',
    },
    text: {
      primary: '#111111',
      secondary: '#52525B',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
  },
  components: {
    ...sharedComponents,
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#43946C',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          backgroundColor: 'transparent',
          color: '#111111',
          '&:focus': {
            backgroundColor: 'transparent',
          },
        },
        nativeInput: {
          backgroundColor: 'transparent',
          color: '#111111',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0, 0, 0, 0.3)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#111111',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#43946C',
            borderWidth: '2px',
          },
        },
        input: {
          color: '#111111',
          '&::placeholder': {
            color: 'rgba(0, 0, 0, 0.5)',
            opacity: 1,
          },
        },
        notchedOutline: {
          '& > legend': {
            color: 'rgba(0, 0, 0, 0.6) !important',
            backgroundColor: '#FFFFFF',
            '&.Mui-focused': {
              color: '#111111 !important',
            },
            '& span': {
              color: 'rgba(0, 0, 0, 0.6) !important',
            }
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#E4E4E7',
          },
          '&.Mui-selected:hover': {
            backgroundColor: '#D4D4D8',
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: 'rgba(0, 0, 0, 0.6)',
          '&.Mui-focused': {
            color: '#43946C',
          },
        },
      },
    },
  },
});

export default darkTheme;
