import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledFooter = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' 
    ? theme.palette.grey[200] 
    : theme.palette.grey[900],
  padding: theme.spacing(3, 0),
  marginTop: 'auto',
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <StyledFooter component="footer">
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            © {currentYear} Code Dry Run Visualizer. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography 
              variant="body2" 
              component="a" 
              href="#"
              color="text.secondary"
              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Terms of Service
            </Typography>
            <Typography 
              variant="body2" 
              component="a" 
              href="#"
              color="text.secondary"
              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Privacy Policy
            </Typography>
            <Typography 
              variant="body2" 
              component="a" 
              href="https://github.com/yourusername/code-dry-run-visualizer"
              target="_blank"
              rel="noopener noreferrer"
              color="text.secondary"
              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              GitHub
            </Typography>
          </Box>
        </Box>
      </Container>
    </StyledFooter>
  );
};

export default Footer;
