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
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    fathersName: '',
    dateOfBirth: null,
    phoneNumber: '',
    block: '',
    houseNumber: '',
    tshirtSize: '',
    aadhaarNumber: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      dateOfBirth: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    const validationErrors = {};
    
    if (!formData.aadhaarNumber || !/^\d{12}$/.test(formData.aadhaarNumber)) {
      validationErrors.aadhaarNumber = 'Aadhaar number must be 12 digits';
    }

    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      validationErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await register({
        ...formData,
        aadhaarNumber: formData.aadhaarNumber.trim(),
        dateOfBirth: formData.dateOfBirth.toISOString().split('T')[0]
      });
      navigate('/login', { 
        state: { message: 'Registration successful! Please login.' }
      });
    } catch (err) {
      if (err.response?.data?.data) {
        setErrors(err.response.data.data);
      } else {
        setErrors({ general: err.response?.data?.message || 'Registration failed' });
      }
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4
        }}
      >
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        {errors.general && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {errors.general}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="fullName"
            label="Full Name"
            name="fullName"
            autoComplete="name"
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
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChange={handleDateChange}
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
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
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
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="aadhaarNumber"
            label="Aadhaar Number"
            inputProps={{
              maxLength: 12,
              pattern: "\\d*"
            }}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
            }}
            value={formData.aadhaarNumber}
            onChange={handleChange}
            error={!!errors.aadhaarNumber}
            helperText={errors.aadhaarNumber || "Enter 12 digit Aadhaar number"}
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
              <MenuItem value="Block A">Block A</MenuItem>
              <MenuItem value="Block B">Block B</MenuItem>
            </Select>
            {errors.block && <FormHelperText error>{errors.block}</FormHelperText>}
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
          <FormControl 
            fullWidth 
            margin="normal" 
            required
            error={!!errors.tshirtSize}
          >
            <InputLabel id="tshirt-size-label">T-Shirt Size</InputLabel>
            <Select
              labelId="tshirt-size-label"
              id="tshirtSize"
              name="tshirtSize"
              value={formData.tshirtSize}
              label="T-Shirt Size"
              onChange={handleChange}
            >
              <MenuItem value="S">Small</MenuItem>
              <MenuItem value="M">Medium</MenuItem>
              <MenuItem value="L">Large</MenuItem>
              <MenuItem value="XL">Extra Large</MenuItem>
              <MenuItem value="XXL">Double XL</MenuItem>
            </Select>
            {errors.tshirtSize && (
              <FormHelperText>{errors.tshirtSize}</FormHelperText>
            )}
          </FormControl>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password || "Password must be at least 6 characters"}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Sign in
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default Register; 