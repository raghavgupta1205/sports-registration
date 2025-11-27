import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import EventCard from './EventCard';
import api from '../api/axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState('');
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    title: '',
    message: '',
    status: '',
    payment: null
  });

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

  const closePaymentModal = () => setPaymentModal((prev) => ({ ...prev, open: false }));

  const openPaymentModal = ({ title, message, status, payment }) => {
    setPaymentModal({
      open: true,
      title,
      message,
      status,
      payment
    });
  };

  const handleCheckPayment = async (registrationId) => {
    try {
      setError('');
      // Get the latest payment details for this registration
      let paymentResponse = await api.get(`/payments/${registrationId}/latest`);
      let payment = paymentResponse.data.data;
      
      if (payment && payment.razorpayOrderId && payment.status !== 'SUCCESS') {
        // Verify the payment
        await api.post('/payments/verify', {
          registrationId: registrationId,
          orderId: payment.razorpayOrderId,
          paymentId: payment.razorpayPaymentId,
          signature: payment.razorpaySignature
        });
        paymentResponse = await api.get(`/payments/${registrationId}/latest`);
        payment = paymentResponse.data.data;
      }
      
      // Refresh registrations after checking status
      const registrationsResponse = await api.get('/registrations/user');
      setRegistrations(registrationsResponse.data.data || []);

      if (!payment) {
        openPaymentModal({
          title: 'No Payment Found',
          message: 'We could not find any payment attempts for this registration.',
          status: 'NOT_FOUND',
          payment: null
        });
        return;
      }

      const status = payment.status || payment.paymentStatus || 'UNKNOWN';
      let title = 'Payment Status';
      let message = 'Please review your latest transaction.';

      if (status === 'SUCCESS') {
        title = 'Registration Complete';
        message = 'Your last payment was successful and the registration is confirmed.';
      } else if (status === 'FAILED') {
        title = 'Payment Failed';
        message = 'Your last transaction failed. Please try registering again.';
      } else if (status === 'PENDING') {
        title = 'Payment Pending';
        message = 'We are still waiting for confirmation from the payment gateway.';
      }

      openPaymentModal({
        title,
        message,
        status,
        payment
      });
    } catch (err) {
      console.error('Payment verification failed:', err);
      setError('Failed to check payment status');
      openPaymentModal({
        title: 'Unable to Verify',
        message: err.response?.data?.message || 'We could not check the payment status right now.',
        status: 'ERROR',
        payment: null
      });
    }
  };

  const handleRegister = async (event) => {
    try {
        // CHECK IF IT'S A CRICKET EVENT - REDIRECT TO CRICKET REGISTRATION FORM
      if (event.name && event.name.toLowerCase().includes('cricket')) {
        console.log('Cricket event detected - redirecting to cricket registration');
        navigate(`/cricket-registration/${event.id}`);
        return;
      }

      // For non-cricket events, proceed with normal payment flow
      // Create registration order
      const orderResponse = await api.post('/registrations/order', {
        eventId: event.id
      });
      const { orderId, amount, registrationId } = orderResponse.data.data;

      // Initialize Razorpay
      const options = {
        key: "rzp_test_RgO20QqKKlOShG", //rzp_test_RgO20QqKKlOShG
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
            
            // Get latest payment status
            const paymentResponse = await api.get(`/payments/${registrationId}/latest`);
            const payment = paymentResponse.data.data;
            
            // Update registrations with correct status
            const registrationsResponse = await api.get('/registrations/user');
            setRegistrations(registrationsResponse.data.data || []);
            
          } catch (err) {
            console.error('Payment verification failed:', err);
            setError('Payment verification failed');
            // Refresh registrations to get latest status even after failure
            const registrationsResponse = await api.get('/registrations/user');
            setRegistrations(registrationsResponse.data.data || []);
          }
        },
        modal: {
          ondismiss: async () => {
            // Check payment status when modal is closed
            try {
              const registrationsResponse = await api.get('/registrations/user');
              setRegistrations(registrationsResponse.data.data || []);
            } catch (err) {
              console.error('Failed to refresh registrations:', err);
            }
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
      console.error('Failed to initiate registration:', err);
      setError('Failed to initiate registration');
      // Refresh registrations to get latest status
      try {
        const registrationsResponse = await api.get('/registrations/user');
        setRegistrations(registrationsResponse.data.data || []);
      } catch (refreshErr) {
        console.error('Failed to refresh registrations:', refreshErr);
      }
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

        {user?.role === 'ADMIN' && (
          <Button
            variant="contained"
            color="secondary"
            sx={{ mb: 3 }}
            onClick={() => navigate('/admin/registrations')}
          >
            Open Admin Panel
          </Button>
        )}
        
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
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard
                  event={event}
                  registrationStatus={{ data: registrations }}
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
      </Box>

      <Dialog open={paymentModal.open} onClose={closePaymentModal} maxWidth="sm" fullWidth>
        <DialogTitle>{paymentModal.title}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" gutterBottom>
            {paymentModal.message}
          </Typography>
          {paymentModal.payment && (
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Status:</strong> {paymentModal.status}
              </Typography>
              {paymentModal.payment.amount && (
                <Typography variant="body2">
                  <strong>Amount:</strong> ₹{Number(paymentModal.payment.amount)}
                </Typography>
              )}
              {paymentModal.payment.razorpayOrderId && (
                <Typography variant="body2">
                  <strong>Order ID:</strong> {paymentModal.payment.razorpayOrderId}
                </Typography>
              )}
              {paymentModal.payment.razorpayPaymentId && (
                <Typography variant="body2">
                  <strong>Payment ID:</strong> {paymentModal.payment.razorpayPaymentId}
                </Typography>
              )}
              {paymentModal.payment.updatedAt && (
                <Typography variant="body2">
                  <strong>Updated:</strong> {new Date(paymentModal.payment.updatedAt).toLocaleString()}
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePaymentModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 