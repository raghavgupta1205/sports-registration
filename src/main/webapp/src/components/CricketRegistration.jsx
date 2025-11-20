import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Paper,
  CircularProgress,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import api from '../api/axios';

const steps = ['Upload Documents', 'Personal Information', 'Cricket Skills', 'T-Shirt & Terms'];

function CricketRegistration() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [event, setEvent] = useState(null);
  const [uploading, setUploading] = useState({});

  const [formData, setFormData] = useState({
    eventId: parseInt(eventId),
    gender: '',
    tshirtSize: '',
    residentialAddress: '',
    whatsappNumber: '',
    aadhaarFrontPhoto: '',
    aadhaarBackPhoto: '',
    playerPhoto: '',
    gameLevel: '',
    cricketPreference: '',
    isWicketKeeper: false,
    hasCaptainExperience: false,
    battingHand: '',
    bowlingArm: '',
    bowlingPace: '',
    tshirtName: '',
    luckyNumber: '',
    termsAccepted: false
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${eventId}`);
        setEvent(response.data.data);
      } catch (err) {
        setError('Failed to load event details');
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleFileUpload = async (file, type) => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    
    const endpoints = {
      'aadhaar-front': '/cricket-registrations/upload/aadhaar-front',
      'aadhaar-back': '/cricket-registrations/upload/aadhaar-back',
      'player-photo': '/cricket-registrations/upload/player-photo'
    };
    
    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const response = await api.post(endpoints[type], formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data.filePath;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleFileChange = async (e, fieldName, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(`File size must be less than 5MB`);
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Only JPG, PNG, or PDF files are allowed');
      return;
    }

    try {
      const filePath = await handleFileUpload(file, type);
      setFormData(prev => ({ ...prev, [fieldName]: filePath }));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.aadhaarFrontPhoto && formData.aadhaarBackPhoto && formData.playerPhoto;
      case 1:
        return formData.gender && formData.tshirtSize && formData.residentialAddress && 
               formData.whatsappNumber && /^\d{10}$/.test(formData.whatsappNumber);
      case 2:
        return formData.gameLevel && formData.cricketPreference && 
               formData.battingHand && formData.bowlingArm && formData.bowlingPace;
      case 3:
        return formData.tshirtName && formData.luckyNumber && 
               formData.luckyNumber >= 1 && formData.luckyNumber <= 99 &&
               formData.termsAccepted;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      setError('');
    } else {
      setError('Please fill all required fields correctly');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) {
      setError('Please fill all required fields and accept terms');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/cricket-registrations/complete', formData);
      const { eventRegistrationId, eventPrice } = response.data.data;
      
      // Redirect to payment
      initiatePayment(eventRegistrationId, eventPrice);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  const initiatePayment = async (eventRegistrationId, amount) => {
    try {
      const orderResponse = await api.post('/registrations/order', {
        eventId: parseInt(eventId)
      });
      const { orderId } = orderResponse.data.data;

      const options = {
        key: "rzp_test_RgO20QqKKlOShG",
        amount: amount * 100,
        currency: "INR",
        name: "ANPL Sports",
        description: `Registration for ${event?.name}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            await api.post('/registrations/verify', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              registrationId: eventRegistrationId
            });
            navigate('/dashboard', { 
              state: { message: 'Registration and payment successful!' }
            });
          } catch (err) {
            setError('Payment verification failed');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            navigate('/dashboard');
          }
        },
        prefill: {
          name: user.fullName,
          email: user.email,
          contact: formData.whatsappNumber || user.phoneNumber
        },
        theme: {
          color: "#1976d2"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError('Failed to initiate payment');
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info">
                Upload clear photos of your documents (JPG, PNG, or PDF, max 5MB each)
              </Alert>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Aadhaar Front</Typography>
                  <input
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    id="aadhaar-front-upload"
                    type="file"
                    onChange={(e) => handleFileChange(e, 'aadhaarFrontPhoto', 'aadhaar-front')}
                  />
                  <label htmlFor="aadhaar-front-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={uploading['aadhaar-front'] ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                      disabled={uploading['aadhaar-front']}
                      fullWidth
                    >
                      Upload
                    </Button>
                  </label>
                  {formData.aadhaarFrontPhoto && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', color: 'success.main' }}>
                      <CheckCircleIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">Uploaded</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Aadhaar Back</Typography>
                  <input
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    id="aadhaar-back-upload"
                    type="file"
                    onChange={(e) => handleFileChange(e, 'aadhaarBackPhoto', 'aadhaar-back')}
                  />
                  <label htmlFor="aadhaar-back-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={uploading['aadhaar-back'] ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                      disabled={uploading['aadhaar-back']}
                      fullWidth
                    >
                      Upload
                    </Button>
                  </label>
                  {formData.aadhaarBackPhoto && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', color: 'success.main' }}>
                      <CheckCircleIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">Uploaded</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Player Photo</Typography>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="player-photo-upload"
                    type="file"
                    onChange={(e) => handleFileChange(e, 'playerPhoto', 'player-photo')}
                  />
                  <label htmlFor="player-photo-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={uploading['player-photo'] ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                      disabled={uploading['player-photo']}
                      fullWidth
                    >
                      Upload
                    </Button>
                  </label>
                  {formData.playerPhoto && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', color: 'success.main' }}>
                      <CheckCircleIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">Uploaded</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Gender</InputLabel>
                <Select name="gender" value={formData.gender} onChange={handleChange} label="Gender">
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>T-Shirt Size</InputLabel>
                <Select name="tshirtSize" value={formData.tshirtSize} onChange={handleChange} label="T-Shirt Size">
                  <MenuItem value="XS">XS</MenuItem>
                  <MenuItem value="S">S</MenuItem>
                  <MenuItem value="M">M</MenuItem>
                  <MenuItem value="L">L</MenuItem>
                  <MenuItem value="XL">XL</MenuItem>
                  <MenuItem value="XXL">XXL</MenuItem>
                  <MenuItem value="XXXL">XXXL</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={3}
                label="Residential Address"
                name="residentialAddress"
                value={formData.residentialAddress}
                onChange={handleChange}
                helperText="Complete address with house number, street, city, pin code"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="WhatsApp Number"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                inputProps={{ maxLength: 10, pattern: "\\d*" }}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                }}
                helperText="10-digit WhatsApp number"
                error={formData.whatsappNumber && !/^\d{10}$/.test(formData.whatsappNumber)}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Game Level</InputLabel>
                <Select name="gameLevel" value={formData.gameLevel} onChange={handleChange} label="Game Level">
                  <MenuItem value="BEGINNER">Beginner</MenuItem>
                  <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                  <MenuItem value="ADVANCED">Advanced</MenuItem>
                  <MenuItem value="PROFESSIONAL">Professional</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Cricket Preference</InputLabel>
                <Select name="cricketPreference" value={formData.cricketPreference} onChange={handleChange} label="Cricket Preference">
                  <MenuItem value="BATTING">Batting</MenuItem>
                  <MenuItem value="BOWLING">Bowling</MenuItem>
                  <MenuItem value="ALL_ROUNDER">All Rounder</MenuItem>
                  <MenuItem value="WICKET_KEEPER">Wicket Keeper</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isWicketKeeper"
                    checked={formData.isWicketKeeper}
                    onChange={handleChange}
                  />
                }
                label="I am a Wicket Keeper"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="hasCaptainExperience"
                    checked={formData.hasCaptainExperience}
                    onChange={handleChange}
                  />
                }
                label="I have Team Captain Experience"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Batting Hand</InputLabel>
                <Select name="battingHand" value={formData.battingHand} onChange={handleChange} label="Batting Hand">
                  <MenuItem value="LEFT">Left</MenuItem>
                  <MenuItem value="RIGHT">Right</MenuItem>
                  <MenuItem value="BOTH">Both</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Bowling Arm</InputLabel>
                <Select name="bowlingArm" value={formData.bowlingArm} onChange={handleChange} label="Bowling Arm">
                  <MenuItem value="LEFT">Left</MenuItem>
                  <MenuItem value="RIGHT">Right</MenuItem>
                  <MenuItem value="BOTH">Both</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Bowling Pace</InputLabel>
                <Select name="bowlingPace" value={formData.bowlingPace} onChange={handleChange} label="Bowling Pace">
                  <MenuItem value="FAST">Fast</MenuItem>
                  <MenuItem value="FAST_MEDIUM">Fast Medium</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="MEDIUM_SLOW">Medium Slow</MenuItem>
                  <MenuItem value="SLOW">Slow</MenuItem>
                  <MenuItem value="SPIN">Spin</MenuItem>
                  <MenuItem value="LEG_SPIN">Leg Spin</MenuItem>
                  <MenuItem value="OFF_SPIN">Off Spin</MenuItem>
                  <MenuItem value="NOT_APPLICABLE">Not Applicable</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Name for T-Shirt"
                name="tshirtName"
                value={formData.tshirtName}
                onChange={handleChange}
                inputProps={{ maxLength: 50, pattern: "[a-zA-Z\\s]*" }}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                }}
                helperText="Letters only, max 50 characters"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Lucky Number (1-99)"
                name="luckyNumber"
                value={formData.luckyNumber}
                onChange={handleChange}
                inputProps={{ min: 1, max: 99 }}
                helperText="Your jersey number (1-99)"
                error={formData.luckyNumber && (formData.luckyNumber < 1 || formData.luckyNumber > 99)}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    required
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the Terms & Conditions and confirm that all information provided is accurate *
                  </Typography>
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Registration Fee: ₹{event?.price || 500}</strong>
                  <br />
                  After submitting, you will be redirected to the payment page.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Cricket Event Registration
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
          {event?.name || 'Loading event...'}
        </Typography>
        <Typography variant="body2" align="center" color="error" gutterBottom>
          Please complete ALL fields before payment
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mt: 4, mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !validateStep(activeStep)}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  {loading ? 'Processing...' : 'Complete & Pay'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  disabled={!validateStep(activeStep)}
                >
                  Next
                </Button>
              )}
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

export default CricketRegistration;

