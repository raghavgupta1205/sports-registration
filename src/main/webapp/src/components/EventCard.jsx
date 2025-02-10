import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button,
  Box,
  Chip
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const EventCard = ({ event, registrationStatus, onRegister, onCheckPayment }) => {
  // Find registration for this event from the array
  const registration = Array.isArray(registrationStatus?.data) 
    ? registrationStatus.data.find(reg => reg.eventId === event.id)
    : null;
  
  const { id, registrationId, status } = registration || {};
  const regId = registrationId || id; // Handle both possible field names
  const hasRegistration = !!regId;

  const getStatusChip = () => {
    if (hasRegistration && status === 'APPROVED') {
      return <Chip 
        icon={<CheckCircleIcon />} 
        label="Registered" 
        color="success" 
        variant="outlined" 
      />;
    } else if (hasRegistration && status === 'PENDING') {
      return <Button
        variant="outlined"
        color="warning"
        onClick={() => onCheckPayment(regId)}
        fullWidth
      >
        Check Payment Status
      </Button>;
    } else if (hasRegistration && status === 'FAILED') {
      return <Button
        variant="contained"
        color="error"
        onClick={() => onRegister(event)}
        fullWidth
      >
        Try Again
      </Button>;
    } else {
      return <Button
        variant="contained"
        color="primary"
        onClick={() => onRegister(event)}
        fullWidth
      >
        Register Now
      </Button>;
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {event.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {event.description}
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" color="text.primary">
            Registration Fee: ₹{event.price}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Registration Period: {new Date(event.registrationStartDate).toLocaleDateString()} - {new Date(event.registrationEndDate).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>
      
      <CardActions>
        {getStatusChip()}
      </CardActions>
    </Card>
  );
};

export default EventCard; 