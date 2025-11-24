import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  Checkbox,
  Paper,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import api from '../api/axios';

const steps = ['Upload Documents', 'Player Background', 'Jersey & Terms'];

const termsContent = [
  'Only permanent residents of Aggar Nagar who own a house, booth, SCO, or SCF in their name or in the name of their immediate family members (father, mother, grandmother, grandfather, son, or wife) are eligible to participate. Participants must provide a downloaded Aadhaar card (downloaded on the current date) displaying their Aggar Nagar address as proof of residency. Individuals or their immediate family members who have sold their property in Aggar Nagar are ineligible, even if their Aadhaar card still lists an Aggar Nagar address.',
  'The ANPL Organizers reserve the right to request additional proof of residency. Players may be asked to provide supporting documents. Failure or refusal to present these documents will lead to disqualification.',
  'The tournament registration fee is non-refundable under any circumstances.',
  'Once a player is selected for a team, they must remain with that team for the duration of the tournament. Players who withdraw will be disqualified and the team must continue with the remaining players.',
  'If any player leaves the team for any reason after it has been formed, no new members will be allowed to replace them. The remaining players must continue to play. However, the organizers reserve the right to assign a new member to the team, and this decision cannot be opposed by any player, captain, sponsor, or team owner.',
  'The ANPL organizers’ decisions will be final. No disputes will be entertained; any player, member, or captain who argues will be disqualified, and the entire team may also face disqualification.',
  <>Registration will be accepted on a <strong>first-come, first-serve basis.</strong></>,
  <>Players must upload a <strong>recent picture with a plain background.</strong></>,
  <>Final eligibility is <strong>subject to approval</strong> by the <strong>ANPL Organisers.</strong></>,
  <>All participants are expected to maintain <strong>sportsman spirit and discipline.</strong> The <strong>ANPL Organisers</strong> reserve full rights to disqualify any player or team in case of misbehaviour on the field or misconduct with match officials or fellow players.</>,
  <><strong>Players</strong> will be categorized as per auction criteria.</>,
  <>By registering, every player <strong>agrees to abide by all ANPL Cricket Tournament Rules &amp; Regulations</strong> and acknowledges that the <strong>ANPL Organisers’ decision will be final and binding</strong> in all matters related to the tournament.</>
];

const categoryOptions = [
  { value: 'JUNIORS', label: 'Juniors (8-14)' },
  { value: 'YOUNGSTERS', label: 'Youngsters (15-47)' },
  { value: 'LEGENDS', label: 'Legends (47+)' }
];

const gameLevelOptions = [
  { value: 'CLUB_LEVEL', label: 'Club Level' },
  { value: 'LOCAL_LEVEL', label: 'Local Level' },
  { value: 'CASUAL_LEVEL', label: 'Casual Level' },
  { value: 'SCHOOL_LEVEL', label: 'School Level' },
  { value: 'SOCIETY_LEVEL', label: 'Society Level' },
  { value: 'STATE_LEVEL', label: 'State Level' }
];

const cricketPreferenceOptions = [
  { value: 'BATTING', label: 'Batting' },
  { value: 'BOWLING', label: 'Bowling' },
  { value: 'ALL_ROUNDER', label: 'All Rounder' },
  { value: 'WICKET_KEEPER', label: 'Wicket Keeper' }
];

const handOptions = [
  { value: 'LEFT', label: 'Left' },
  { value: 'RIGHT', label: 'Right' },
  { value: 'BOTH', label: 'Both' }
];

const bowlingArmOptions = [
  { value: 'LEFT', label: 'Left' },
  { value: 'RIGHT', label: 'Right' },
  { value: 'BOTH', label: 'Both' },
  { value: 'NONE', label: 'Not Applicable' }
];

const bowlingPaceOptions = [
  { value: 'FAST', label: 'Fast' },
  { value: 'FAST_MEDIUM', label: 'Fast Medium' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'MEDIUM_SLOW', label: 'Medium Slow' },
  { value: 'SLOW', label: 'Slow' },
  { value: 'SPIN', label: 'Spin' },
  { value: 'LEG_SPIN', label: 'Leg Spin' },
  { value: 'OFF_SPIN', label: 'Off Spin' },
  { value: 'NOT_APPLICABLE', label: 'Not Applicable' }
];

const dateLabelFormatter = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: '2-digit',
  month: 'long',
  year: 'numeric'
});

const buildEventDateOptions = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return [];
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return [];
  }

  const options = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const iso = cursor.toISOString().split('T')[0];
    options.push({
      value: iso,
      label: dateLabelFormatter.format(cursor)
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return options;
};

const formatLabel = (value) =>
  value ? value.toLowerCase().split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'N/A';

const MAX_FILE_SIZE_MB = 5;

const getFileUrl = (path = '') => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  return `/uploads/${path}`;
};

const normalizeCricketPreference = (preference, role) => {
  if (preference) {
    return preference;
  }
  if (!role) return '';
  switch (role) {
    case 'BATSMAN':
      return 'BATTING';
    case 'BOWLER':
      return 'BOWLING';
    case 'ALL_ROUNDER':
      return 'ALL_ROUNDER';
    case 'WICKET_KEEPER':
      return 'WICKET_KEEPER';
    default:
      return '';
  }
};

const isImagePath = (path = '') => /\.(png|jpe?g|gif|webp)$/i.test(path);

function CricketRegistration() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [event, setEvent] = useState(null);
  const [eventDates, setEventDates] = useState([]);
  const [uploading, setUploading] = useState({});
  const [existingData, setExistingData] = useState(null);
  const [previews, setPreviews] = useState({
    aadhaarFrontPhoto: '',
    aadhaarBackPhoto: '',
    playerPhoto: ''
  });
  const previewUrlsRef = useRef({});

  const dateLabelMap = useMemo(() => {
    const map = {};
    eventDates.forEach(({ value, label }) => {
      map[value] = label;
    });
    return map;
  }, [eventDates]);

  const [formData, setFormData] = useState({
    eventId: Number(eventId),
    registrationCategory: '',
    gameLevel: '',
    availableAllDays: true,
    unavailableDates: [],
    sportsHistory: '',
    achievements: '',
    aadhaarFrontPhoto: '',
    aadhaarBackPhoto: '',
    playerPhoto: '',
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
        const eventData = response.data.data;
        setEvent(eventData);
        setEventDates(buildEventDateOptions(eventData.eventStartDate, eventData.eventEndDate));
      } catch (err) {
        setError('Failed to load event details');
      }
    };

    const fetchExistingData = async () => {
      try {
        const response = await api.get(`/cricket-registrations/event/${eventId}`);
        const data = response.data.data;
        setExistingData(data);
        setPreviews((prev) => ({
          ...prev,
          aadhaarFrontPhoto: isImagePath(data.aadhaarFrontPhoto) ? getFileUrl(data.aadhaarFrontPhoto) : prev.aadhaarFrontPhoto,
          aadhaarBackPhoto: isImagePath(data.aadhaarBackPhoto) ? getFileUrl(data.aadhaarBackPhoto) : prev.aadhaarBackPhoto,
          playerPhoto: isImagePath(data.playerPhoto) ? getFileUrl(data.playerPhoto) : prev.playerPhoto
        }));
        setFormData((prev) => ({
          ...prev,
          registrationCategory: data.registrationCategory || '',
          gameLevel: data.skillLevel || '',
          availableAllDays: data.availableAllDays ?? true,
          unavailableDates: data.unavailableDates || [],
          sportsHistory: data.sportsHistory || '',
          achievements: data.achievements || '',
          aadhaarFrontPhoto: data.aadhaarFrontPhoto || '',
          aadhaarBackPhoto: data.aadhaarBackPhoto || '',
          playerPhoto: data.playerPhoto || '',
          cricketPreference: normalizeCricketPreference(data.cricketPreference, data.primaryRole),
          isWicketKeeper: data.isWicketKeeper ?? false,
          hasCaptainExperience: data.hasCaptainExperience ?? false,
          battingHand: data.battingHand || '',
          bowlingArm: data.bowlingArm || '',
          bowlingPace: data.bowlingPace || '',
          tshirtName: data.tshirtName || '',
          luckyNumber: data.jerseyNumber || '',
          termsAccepted: false
        }));
      } catch (err) {
        console.debug('No existing cricket registration found', err);
      }
    };

    fetchEvent();
    fetchExistingData();
  }, [eventId]);

  const handleFileUpload = async (file, type) => {
    const uploadData = new FormData();
    uploadData.append('file', file);

    const endpoints = {
      'aadhaar-front': '/cricket-registrations/upload/aadhaar-front',
      'aadhaar-back': '/cricket-registrations/upload/aadhaar-back',
      'player-photo': '/cricket-registrations/upload/player-photo'
    };

    setUploading((prev) => ({ ...prev, [type]: true }));
    try {
      const response = await api.post(endpoints[type], uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data.filePath;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const setPreviewUrl = (field, url) => {
    setPreviews((prev) => {
      const oldUrl = prev[field];
      if (oldUrl && oldUrl.startsWith('blob:')) {
        URL.revokeObjectURL(oldUrl);
      }
      return { ...prev, [field]: url };
    });

    const oldRefUrl = previewUrlsRef.current[field];
    if (oldRefUrl && oldRefUrl.startsWith('blob:')) {
      URL.revokeObjectURL(oldRefUrl);
    }
    previewUrlsRef.current[field] = url;
  };

  useEffect(() => {
    return () => {
      Object.values(previewUrlsRef.current).forEach((url) => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!eventDates.length) {
      return;
    }
    setFormData((prev) => {
      const filtered = prev.unavailableDates.filter((date) =>
        eventDates.some((option) => option.value === date)
      );
      if (filtered.length === prev.unavailableDates.length) {
        return prev;
      }
      return {
        ...prev,
        unavailableDates: filtered
      };
    });
  }, [eventDates]);

  const handleFileChange = async (e, fieldName, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Only JPG, PNG, or PDF files are allowed');
      return;
    }

    try {
      const filePath = await handleFileUpload(file, type);
      setFormData((prev) => ({ ...prev, [fieldName]: filePath }));
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(fieldName, previewUrl);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAvailabilityChange = (event) => {
    const isAvailable = event.target.value === 'YES';
    setFormData((prev) => ({
      ...prev,
      availableAllDays: isAvailable,
      unavailableDates: isAvailable ? [] : prev.unavailableDates
    }));
  };

  const handleUnavailableDateToggle = (dateValue) => {
    setFormData((prev) => {
      const exists = prev.unavailableDates.includes(dateValue);
      const updatedDates = exists
        ? prev.unavailableDates.filter((date) => date !== dateValue)
        : [...prev.unavailableDates, dateValue];
      return {
        ...prev,
        unavailableDates: updatedDates
      };
    });
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.aadhaarFrontPhoto && formData.aadhaarBackPhoto && formData.playerPhoto;
      case 1: {
        const history = formData.sportsHistory.trim();
        const achievements = formData.achievements.trim();
        const requiresUnavailableSelection = formData.availableAllDays === false && eventDates.length > 0;
        return (
          formData.registrationCategory &&
          formData.gameLevel &&
          formData.cricketPreference &&
          formData.battingHand &&
          formData.bowlingArm &&
          formData.bowlingPace &&
          history.length > 0 &&
          achievements.length > 0 &&
          (!requiresUnavailableSelection || formData.unavailableDates.length > 0)
        );
      }
      case 2: {
        const lucky = Number(formData.luckyNumber);
        return (
          formData.tshirtName &&
          Number.isInteger(lucky) &&
          lucky >= 1 &&
          lucky <= 99 &&
          formData.termsAccepted
        );
      }
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
      setError('');
    } else {
      setError('Please fill all required fields correctly');
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) {
      setError('Please fill all required fields and accept terms');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        eventId: Number(eventId),
        sportsHistory: formData.sportsHistory.trim(),
        achievements: formData.achievements.trim(),
        luckyNumber: Number(formData.luckyNumber)
      };
      const response = await api.post('/cricket-registrations/complete', payload);
      const { eventRegistrationId, eventPrice } = response.data.data;
      initiatePayment(eventRegistrationId, eventPrice);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  const initiatePayment = async (eventRegistrationId, amount) => {
    try {
      const orderResponse = await api.post('/registrations/order', {
        eventId: Number(eventId)
      });
      const { orderId } = orderResponse.data.data;

      const options = {
        key: 'rzp_test_RgO20QqKKlOShG',
        amount: amount * 100,
        currency: 'INR',
        name: 'ANPL Sports',
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
          contact: existingData?.whatsappNumber || user.phoneNumber
        },
        theme: {
          color: '#1976d2'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError('Failed to initiate payment');
      setLoading(false);
    }
  };

  const renderDocumentStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info">
          Upload clear photos of your documents (JPG, PNG, or PDF, max 5MB each)
        </Alert>
      </Grid>

      {[
        { id: 'aadhaar-front', label: 'Aadhaar Front', field: 'aadhaarFrontPhoto' },
        { id: 'aadhaar-back', label: 'Aadhaar Back', field: 'aadhaarBackPhoto' },
        { id: 'player-photo', label: 'Player Photo', field: 'playerPhoto', accept: 'image/*' }
      ].map((item) => (
        <Grid item xs={12} md={4} key={item.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{item.label}</Typography>
              <input
                accept={item.accept || 'image/*,.pdf'}
                style={{ display: 'none' }}
                id={`${item.id}-upload`}
                type="file"
                onChange={(e) => handleFileChange(e, item.field, item.id)}
              />
              <label htmlFor={`${item.id}-upload`}>
                <Button
                  variant="contained"
                  component="span"
                  startIcon={uploading[item.id] ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                  disabled={uploading[item.id]}
                  fullWidth
                >
                  Upload
                </Button>
              </label>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                JPG/PNG/PDF up to {MAX_FILE_SIZE_MB}MB
              </Typography>
              {(() => {
                const previewValue = previews[item.field];
                const storedValue = existingData?.[item.field];
                const storedUrl = storedValue ? getFileUrl(storedValue) : '';

                if (previewValue) {
                  return (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Preview:
                      </Typography>
                      <Box
                        component="img"
                        src={previewValue}
                        alt={`${item.label} preview`}
                        sx={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 1, mt: 0.5 }}
                      />
                    </Box>
                  );
                }

                if (storedValue) {
                  return isImagePath(storedValue) ? (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Saved file:
                      </Typography>
                      <Box
                        component="img"
                        src={storedUrl}
                        alt={`${item.label} saved`}
                        sx={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 1, mt: 0.5 }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Saved file{' '}
                        <a href={storedUrl} target="_blank" rel="noopener noreferrer">
                          (view document)
                        </a>
                      </Typography>
                    </Box>
                  );
                }

                return null;
              })()}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderBackgroundStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Registration Category</InputLabel>
          <Select
            name="registrationCategory"
            value={formData.registrationCategory}
            onChange={handleChange}
            label="Registration Category"
          >
            {categoryOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Game Level</InputLabel>
          <Select name="gameLevel" value={formData.gameLevel} onChange={handleChange} label="Game Level">
            {gameLevelOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Are you available on all days of the tournament{' '}
          {eventDates.length > 0
            ? `(${eventDates[0].label} to ${eventDates[eventDates.length - 1].label})`
            : '(dates will be announced soon)'}
          ?
        </Typography>
        <RadioGroup
          row
          value={formData.availableAllDays ? 'YES' : 'NO'}
          onChange={handleAvailabilityChange}
          name="availabilityGroup"
        >
          <FormControlLabel value="YES" control={<Radio />} label="Yes" />
          <FormControlLabel value="NO" control={<Radio />} label="No" />
        </RadioGroup>
      </Grid>

      {formData.availableAllDays === false && (
        <Grid item xs={12}>
          {eventDates.length === 0 ? (
            <Alert severity="warning">
              Tournament dates are not available yet. We will assume you are available on all days once the schedule
              is announced.
            </Alert>
          ) : (
            <>
              <Typography variant="body2" gutterBottom color="text.secondary">
                Select the dates/timings you are unavailable (you can choose multiple):
              </Typography>
              <FormGroup>
                {eventDates.map((date) => (
                  <FormControlLabel
                    key={date.value}
                    control={
                      <Checkbox
                        checked={formData.unavailableDates.includes(date.value)}
                        onChange={() => handleUnavailableDateToggle(date.value)}
                      />
                    }
                    label={date.label}
                  />
                ))}
              </FormGroup>
              {formData.unavailableDates.length === 0 && (
                <Typography variant="caption" color="error">
                  Please select at least one date you are unavailable.
                </Typography>
              )}
            </>
          )}
        </Grid>
      )}

      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          multiline
          minRows={2}
          maxRows={6}
          label="Sports History"
          name="sportsHistory"
          value={formData.sportsHistory}
          onChange={handleChange}
          helperText="Share your cricket journey (any length is fine)"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          multiline
          minRows={2}
          maxRows={6}
          label="Achievements"
          name="achievements"
          value={formData.achievements}
          onChange={handleChange}
          helperText="List notable performances or recognitions"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Cricket Preference</InputLabel>
          <Select name="cricketPreference" value={formData.cricketPreference} onChange={handleChange} label="Cricket Preference">
            {cricketPreferenceOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
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
        <FormControlLabel
          control={
            <Checkbox
              name="hasCaptainExperience"
              checked={formData.hasCaptainExperience}
              onChange={handleChange}
            />
          }
          label="I have Previous Captaincy Experience"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <FormControl fullWidth required>
          <InputLabel>Batting Hand</InputLabel>
          <Select name="battingHand" value={formData.battingHand} onChange={handleChange} label="Batting Hand">
            {handOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={4}>
        <FormControl fullWidth required>
          <InputLabel>Bowling Arm</InputLabel>
          <Select name="bowlingArm" value={formData.bowlingArm} onChange={handleChange} label="Bowling Arm">
            {bowlingArmOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={4}>
        <FormControl fullWidth required>
          <InputLabel>Bowling Pace / Type</InputLabel>
          <Select name="bowlingPace" value={formData.bowlingPace} onChange={handleChange} label="Bowling Pace">
            {bowlingPaceOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  const renderTshirtStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          label="Name for Jersey"
          name="tshirtName"
          value={formData.tshirtName}
          onChange={handleChange}
          inputProps={{ maxLength: 50, pattern: '[a-zA-Z\\s]*' }}
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
          label="Jersey Number (1-99)"
          name="luckyNumber"
          value={formData.luckyNumber}
          onChange={handleChange}
          inputProps={{ min: 1, max: 99 }}
          helperText="Unique number printed on your jersey"
          error={Boolean(formData.luckyNumber) && (Number(formData.luckyNumber) < 1 || Number(formData.luckyNumber) > 99)}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Registration Rules & Terms
        </Typography>
        <Box
          sx={{
            border: theme => `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 2,
            maxHeight: 220,
            overflowY: 'auto',
            mb: 2
          }}
        >
          {termsContent.map((text, index) => (
            <Typography key={index} variant="body2" sx={{ mb: 1.5, whiteSpace: 'pre-line' }}>
              {text}
            </Typography>
          ))}
        </Box>
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

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderDocumentStep();
      case 1:
        return renderBackgroundStep();
      case 2:
        return renderTshirtStep();
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

