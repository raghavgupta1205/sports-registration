export const validateRegistrationForm = (formData) => {
  const errors = {};
  
  // ... other validations ...

  if (!formData.aadhaarNumber) {
    errors.aadhaarNumber = 'Aadhaar number is required';
  } else if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
    errors.aadhaarNumber = 'Please enter a valid 12-digit Aadhaar number';
  }

  return errors;
}; 