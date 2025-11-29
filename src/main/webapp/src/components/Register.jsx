import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Paper,
  Card,
  CardContent,
  Stack,
  Divider
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enIN } from 'date-fns/locale';

const blockOptions = ['Block A', 'Block B'];
const genderOptions = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' }
];

const initialFormData = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  fathersName: '',
  dateOfBirth: null,
  phoneNumber: '',
  block: '',
  houseNumber: '',
  aadhaarNumber: '',
  gender: '',
  aadhaarFrontPhotoData: '',
  aadhaarBackPhotoData: '',
  profilePhotoData: ''
};

const initialMediaState = {
  aadhaarFront: { preview: '' },
  aadhaarBack: { preview: '' },
  profilePhoto: { preview: '' }
};

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

function Register() {
  const [formData, setFormData] = useState(initialFormData);
  const [mediaState, setMediaState] = useState(initialMediaState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, dateOfBirth: date }));
    setErrors((prev) => ({ ...prev, dateOfBirth: undefined }));
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleMediaSelect = async (type, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, [type]: 'Only image files are allowed' }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, [type]: 'File size must be under 1MB' }));
      return;
    }
    try {
      setErrors((prev) => ({ ...prev, [type]: undefined }));
      const dataUrl = await readFileAsDataUrl(file);
      setMediaState((prev) => ({
        ...prev,
        [type]: { preview: dataUrl }
      }));
      setFormData((prev) => ({
        ...prev,
        aadhaarFrontPhotoData: type === 'aadhaarFront' ? dataUrl : prev.aadhaarFrontPhotoData,
        aadhaarBackPhotoData: type === 'aadhaarBack' ? dataUrl : prev.aadhaarBackPhotoData,
        profilePhotoData: type === 'profilePhoto' ? dataUrl : prev.profilePhotoData
      }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [type]: 'Failed to read image' }));
    }
  };

  const validateForm = () => {
    const validationErrors = {};
    if (!formData.fullName) validationErrors.fullName = 'Full name is required';
    if (!formData.fathersName) validationErrors.fathersName = "Father's name is required";
    if (!formData.dateOfBirth) validationErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.email) validationErrors.email = 'Email is required';
    if (!formData.gender) validationErrors.gender = 'Please select your gender';

    if (!formData.phoneNumber || !/^\d{10}$/.test(formData.phoneNumber)) {
      validationErrors.phoneNumber = 'Phone number must be 10 digits';
    }
    if (!formData.aadhaarNumber || !/^\d{12}$/.test(formData.aadhaarNumber)) {
      validationErrors.aadhaarNumber = 'Aadhaar number must be exactly 12 digits';
    }
    if (!formData.block) validationErrors.block = 'Block is required';
    if (!formData.houseNumber) validationErrors.houseNumber = 'House number is required';
    if (!formData.password || formData.password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.aadhaarFrontPhotoData) {
      validationErrors.aadhaarFront = 'Upload Aadhaar front image';
    }
    if (!formData.aadhaarBackPhotoData) {
      validationErrors.aadhaarBack = 'Upload Aadhaar back image';
    }
    if (!formData.profilePhotoData) {
      validationErrors.profilePhoto = 'Upload a profile picture';
    }
    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);
      await register({
        ...formData,
        aadhaarNumber: formData.aadhaarNumber.trim(),
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : null
      });
      navigate('/login', {
        state: { message: 'Registration successful! Please login.' }
      });
    } catch (err) {
      if (err.response?.data?.data) {
        const apiErrors = err.response.data.data;
        setErrors({
          ...apiErrors,
          aadhaarFront: apiErrors.aadhaarFrontPhotoData || apiErrors.aadhaarFront,
          aadhaarBack: apiErrors.aadhaarBackPhotoData || apiErrors.aadhaarBack,
          profilePhoto: apiErrors.profilePhotoData || apiErrors.profilePhoto
        });
      } else {
        const message = err.response?.data?.message || 'Registration failed';
        if (message.toLowerCase().includes('aadhaar')) {
          setErrors({ aadhaarNumber: message });
        } else {
          setErrors({ general: message });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderUploadCard = (type, config) => {
    const media = mediaState[type];
    const fieldError = errors[type];
    return (
      <Card
        variant="outlined"
        sx={{
          height: '100%',
          borderColor: fieldError ? 'error.light' : 'divider'
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              {config.label}
              {config.required && (
                <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>
                  *
                </Typography>
              )}
            </Typography>
            {media.preview ? (
              <Box
                component="img"
                src={media.preview}
                alt={`${config.label} preview`}
                sx={{
                  width: '100%',
                  height: 220,
                  objectFit: 'cover',
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.divider}`
                }}
              />
            ) : (
              <Box
                sx={{
                  height: 220,
                  borderRadius: 2,
                  border: (theme) => `1px dashed ${theme.palette.divider}`,
                  backgroundColor: 'grey.50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary'
                }}
              >
                <Typography variant="body2">{config.placeholder}</Typography>
              </Box>
            )}
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
            >
              {media.preview ? 'Replace Image' : 'Upload Image'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => handleMediaSelect(type, event.target.files?.[0])}
              />
            </Button>
            <Typography variant="caption" color="text.secondary">
              {config.helperText}
            </Typography>
            {fieldError && (
              <Typography variant="caption" color="error">
                {fieldError}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container component="main" maxWidth="md" sx={{ py: 6 }}>
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(25,118,210,0.07), rgba(255,255,255,0.9))'
        }}
      >
        <Box textAlign="center" mb={4}>
          <Typography component="h1" variant="h4" fontWeight={600}>
            Create Your ANPL Account
          </Typography>
          <Typography color="text.secondary">
            Complete your profile with accurate personal and identity details to access tournament
            registrations.
          </Typography>
        </Box>

        {errors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Personal Details
                  </Typography>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="fullName"
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    error={!!errors.fullName}
                    helperText={errors.fullName}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="fathersName"
                    label="Father's Name"
                    name="fathersName"
                    value={formData.fathersName}
                    onChange={handleChange}
                    error={!!errors.fathersName}
                    helperText={errors.fathersName}
                  />
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enIN}>
                    <DatePicker
                      label="Date of Birth"
                      value={formData.dateOfBirth}
                      onChange={handleDateChange}
                      inputFormat="dd/MM/yyyy"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          fullWidth
                          margin="normal"
                          error={!!errors.dateOfBirth}
                          helperText={errors.dateOfBirth}
                        />
                      )}
                    />
                  </LocalizationProvider>
                  <FormControl
                    fullWidth
                    margin="normal"
                    required
                    error={!!errors.gender}
                  >
                    <InputLabel id="gender-label">Gender</InputLabel>
                    <Select
                      labelId="gender-label"
                      id="gender"
                      name="gender"
                      label="Gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      {genderOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contact & Address
                  </Typography>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="phoneNumber"
                    label="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    inputProps={{
                      maxLength: 10,
                      inputMode: 'numeric',
                      pattern: '\\d*'
                    }}
                    onInput={(event) => {
                      event.target.value = event.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    }}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber || 'Enter your 10-digit mobile number'}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="aadhaarNumber"
                    label="Aadhaar Number"
                    inputProps={{
                      maxLength: 12,
                      pattern: '\\d*'
                    }}
                    onInput={(event) => {
                      event.target.value = event.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                    }}
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                    error={!!errors.aadhaarNumber}
                    helperText={errors.aadhaarNumber || 'Enter 12-digit Aadhaar number'}
                  />
                  <FormControl
                    margin="normal"
                    required
                    fullWidth
                    error={!!errors.block}
                  >
                    <InputLabel id="block-label">Block</InputLabel>
                    <Select
                      labelId="block-label"
                      id="block"
                      name="block"
                      value={formData.block}
                      onChange={handleChange}
                      label="Block"
                    >
                      {blockOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.block && <FormHelperText>{errors.block}</FormHelperText>}
                  </FormControl>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="houseNumber"
                    label="House Number"
                    name="houseNumber"
                    value={formData.houseNumber}
                    onChange={handleChange}
                    error={!!errors.houseNumber}
                    helperText={errors.houseNumber}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Identity Proof
                  </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Upload clear images of your Aadhaar card &amp; profile picture (max 1MB each).
                    </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={4}>
                      {renderUploadCard('aadhaarFront', {
                        label: 'Aadhaar Front',
                        placeholder: 'Upload front side of Aadhaar',
                        helperText: 'Ensure the name and address are clearly visible.',
                        required: true
                      })}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      {renderUploadCard('aadhaarBack', {
                        label: 'Aadhaar Back',
                        placeholder: 'Upload back side of Aadhaar',
                        helperText: 'Make sure the QR code and details are sharp.',
                        required: true
                      })}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      {renderUploadCard('profilePhoto', {
                        label: 'Profile Picture',
                        placeholder: 'Add a friendly face!',
                        helperText: 'Use a recent portrait with a plain background.',
                        required: true
                      })}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Secure Your Account
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      helperText={errors.password || 'Minimum 6 characters'}
                    />
                    <TextField
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Create Account'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Sign in
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Register;