import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          ANPL Sports
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {user ? (
            <>
              {[{ label: 'Dashboard', path: '/dashboard' }].map((link) => (
                <Button key={link.path} color="inherit" onClick={() => navigate(link.path)}>
                  {link.label}
                </Button>
              ))}
              {user.role === 'ADMIN' &&
                [
                  { label: 'Registrations', path: '/admin/registrations' }
                ].map((link) => (
                  <Button
                    key={link.path}
                    color="inherit"
                    onClick={() => navigate(link.path)}
                  >
                    {link.label}
                  </Button>
                ))}
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 