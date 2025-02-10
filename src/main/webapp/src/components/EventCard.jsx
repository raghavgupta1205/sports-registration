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
  const { isRegistered, isPending, registrationId } = registrationStatus;

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
        {isRegistered && !isPending ? (
          <Chip
            icon={<CheckCircleIcon />}
            label="Registered"
            color="success"
            variant="outlined"
          />
        ) : isRegistered && isPending ? (
          <Button
            variant="outlined"
            color="warning"
            onClick={() => onCheckPayment(registrationId)}
            fullWidth
          >
            Check Payment Status
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => onRegister(event)}
            fullWidth
          >
            Register Now
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default EventCard; 