import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import EventCard from './EventCard';
import api from '../api/axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventsResponse, registrationsResponse] = await Promise.all([
          api.get('/events/active'),
          api.get('/registrations/user')
        ]);
        
        setEvents(eventsResponse.data.data || []);
        setRegistrations(registrationsResponse.data.data || []);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRegistrationStatus = (eventId) => {
    const registration = registrations.find(reg => reg.eventId === eventId);
    return registration ? {
      isRegistered: true,
      isPending: registration.status === 'PENDING',
      registrationId: registration.id
    } : {
      isRegistered: false,
      isPending: false,
      registrationId: null
    };
  };

  const handleCheckPayment = async (registrationId) => {
    try {
      await api.get(`/registrations/${registrationId}/status`);
      // Refresh registrations after checking status
      const registrationsResponse = await api.get('/registrations/user');
      setRegistrations(registrationsResponse.data.data || []);
    } catch (err) {
      setError('Failed to check payment status');
    }
  };

  const handleRegister = async (event) => {
    try {
      // Create registration order
      const orderResponse = await api.post('/registrations/order', {
        eventId: event.id
      });
      const { orderId, amount, registrationId } = orderResponse.data.data;

      // Initialize Razorpay
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: amount,
        currency: "INR",
        name: "ANPL Sports",
        description: `Registration for ${event.name}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            // Verify payment and complete registration
            await api.post('/registrations/verify', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              registrationId: registrationId
            });
            
            // Update registered events list
            setRegistrations(prev => [...prev, { ...event, id: event.id, status: 'PAID' }]);
            
          } catch (err) {
            setError('Payment verification failed');
          }
        },
        prefill: {
          name: user.fullName,
          email: user.email,
          contact: user.phoneNumber
        },
        theme: {
          color: "#1976d2"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      setError('Failed to initiate registration');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user?.fullName}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Available Events
        </Typography>
        
        <Grid container spacing={3}>
          {events && events.length > 0 ? (
            events.map((event) => (
              <Grid item xs={12} md={6} key={event.id}>
                <EventCard 
                  event={event}
                  registrationStatus={getRegistrationStatus(event.id)}
                  onRegister={handleRegister}
                  onCheckPayment={handleCheckPayment}
                />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">
                No events are currently available.
              </Alert>
            </Grid>
          )}
        </Grid>

        {registrations.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Your Registrations
            </Typography>
            <Grid container spacing={3}>
              {events
                .filter(event => registrations.some(reg => reg.eventId === event.id))
                .map(event => (
                  <Grid item xs={12} md={6} key={event.id}>
                    <EventCard 
                      event={event}
                      registrationStatus={getRegistrationStatus(event.id)}
                      onCheckPayment={handleCheckPayment}
                    />
                  </Grid>
                ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard; 