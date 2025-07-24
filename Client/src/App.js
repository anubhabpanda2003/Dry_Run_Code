import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CodeEditorPage from './pages/CodeEditorPage';
import SavedSessionsPage from './pages/SavedSessionsPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import Notification from './components/Notification';
import { codeApi } from './utils/api';
import './App.css';

// Create theme with dark/light mode
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode colors
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#9c27b0',
          },
        }
      : {
          // Dark mode colors
          primary: {
            main: '#90caf9',
          },
          secondary: {
            main: '#ce93d8',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
        }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
    },
  },
});

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Save theme preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Apply theme
  const theme = createTheme(getDesignTokens(darkMode ? 'dark' : 'light'));

  // Handle notifications
  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Shared handlers for API operations
  const handleApiCall = async (apiCall, successMessage, errorMessage) => {
    setLoading(true);
    try {
      const result = await apiCall();
      if (successMessage) {
        showNotification(successMessage, 'success');
      }
      return result;
    } catch (error) {
      console.error(errorMessage, error);
      showNotification(error.details || error.message || errorMessage, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Shared props for pages
  const sharedPageProps = {
    darkMode,
    loading,
    onNotification: showNotification,
    onApiCall: handleApiCall,
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            bgcolor: 'background.default',
            color: 'text.primary',
          }}
        >
          <Navbar 
            darkMode={darkMode} 
            onThemeToggle={() => setDarkMode(!darkMode)} 
          />
          
          <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 8 }}>
            {loading && <LoadingSpinner />}
            <Routes>
              <Route 
                path="/" 
                element={<CodeEditorPage {...sharedPageProps} />} 
              />
              <Route 
                path="/sessions" 
                element={<SavedSessionsPage {...sharedPageProps} />} 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
          
          <Footer />
          
          <Notification
            open={notification.open}
            message={notification.message}
            severity={notification.severity}
            onClose={closeNotification}
          />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;