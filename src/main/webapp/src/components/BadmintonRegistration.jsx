import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Button,
  Alert,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Divider,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip,
  FormGroup
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon, AddCircleOutline as AddIcon } from '@mui/icons-material';
import api, { badmintonApi } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const steps = ['Upload Documents', 'Select Categories', 'Jersey & Payment'];
const MAX_FILE_SIZE_MB = 5;

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
  <><strong>Players</strong> will be categorized as per tournament criteria.</>,
  <>By registering, every player <strong>agrees to abide by all ANPL Tournament Rules &amp; Regulations</strong> and acknowledges that the <strong>ANPL Organisers’ decision will be final and binding</strong> in all matters related to the tournament.</>
];

const jerseySizeOptions = [
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'SIZE_2XL', label: '2XL' },
  { value: 'SIZE_3XL', label: '3XL' },
  { value: 'SIZE_4XL', label: '4XL' },
  { value: 'SIZE_5XL', label: '5XL' },
  { value: 'SIZE_30', label: '30' },
  { value: 'SIZE_32', label: '32' },
  { value: 'SIZE_34', label: '34' },
  { value: 'SIZE_36', label: '36' }
];

const dateLabelFormatter = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: '2-digit',
  month: 'long',
  year: 'numeric'
});

const buildEventDateOptions = (startDate, endDate) => {
  if (!startDate || !endDate) return [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return [];
  }
  const options = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const iso = cursor.toISOString().split('T')[0];
    options.push({ value: iso, label: dateLabelFormatter.format(cursor) });
    cursor.setDate(cursor.getDate() + 1);
  }
  return options;
};

const getFileUrl = (path = '') => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  return `/uploads/${path}`;
};

const isImagePath = (path = '') => /\.(png|jpe?g|gif|webp)$/i.test(path);
const createEntryId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const formatRelationLabel = (value = '') =>
  value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const calculateAge = (dobString) => {
  if (!dobString) {
    return null;
  }
  const dob = new Date(dobString);
  if (Number.isNaN(dob.getTime())) {
    return null;
  }
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age > 0 ? age : null;
};

function BadmintonRegistration() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const userAge = useMemo(() => calculateAge(user?.dateOfBirth), [user]);
  const defaultSelfName = user?.fullName || '';
  const defaultSelfAge = userAge ? String(userAge) : '';
  const userContactNumber = user?.whatsappNumber || user?.phoneNumber || '';

  const [activeStep, setActiveStep] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [event, setEvent] = useState(null);
  const [eventDates, setEventDates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [existingData, setExistingData] = useState(null);
  const [pendingCategoryCode, setPendingCategoryCode] = useState('');
  const [uploading, setUploading] = useState({});
  const [categoryForms, setCategoryForms] = useState([]);
  const [previews, setPreviews] = useState({
    aadhaarFrontPhoto: '',
    aadhaarBackPhoto: '',
    playerPhoto: ''
  });
  const previewUrlsRef = useRef({});

  const [formData, setFormData] = useState({
    tshirtSize: user?.preferredTshirtSize || '',
    aadhaarFrontPhoto: '',
    aadhaarBackPhoto: '',
    playerPhoto: '',
    tshirtName: '',
    jerseyNumber: '',
    availableAllDays: true,
    unavailableDates: [],
    termsAccepted: false
  });

  useEffect(() => {
    return () => {
      Object.values(previewUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setInitialLoading(true);
        setError('');

        const [eventRes, categoryRes, registrationRes] = await Promise.all([
          api.get(`/events/${eventId}`),
          badmintonApi.getCategories(eventId),
          badmintonApi.getRegistration(eventId)
        ]);

        const eventData = eventRes.data.data;
        setEvent(eventData);
        setEventDates(buildEventDateOptions(eventData?.eventStartDate, eventData?.eventEndDate));

        const categoryList = categoryRes.data.data || [];
        setCategories(categoryList);

        const registration = registrationRes.data.data;
        if (registration) {
          hydrateFromRegistration(registration, categoryList);
        } else {
          setExistingData(null);
          setCategoryForms([]);
          setFormData((prev) => ({
            ...prev,
            aadhaarFrontPhoto: user?.aadhaarFrontPhoto || '',
            aadhaarBackPhoto: user?.aadhaarBackPhoto || '',
            playerPhoto: user?.playerPhoto || ''
          }));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load badminton registration');
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [eventId, user]);

  const hydrateFromRegistration = (data, categoryList) => {
    setExistingData(data);
    setFormData((prev) => ({
      ...prev,
      tshirtSize: data.tshirtSize || prev.tshirtSize || '',
      aadhaarFrontPhoto: data.aadhaarFrontPhoto || prev.aadhaarFrontPhoto || '',
      aadhaarBackPhoto: data.aadhaarBackPhoto || prev.aadhaarBackPhoto || '',
      playerPhoto: data.playerPhoto || prev.playerPhoto || '',
      tshirtName: data.tshirtName || prev.tshirtName || '',
      jerseyNumber: data.jerseyNumber ? String(data.jerseyNumber) : prev.jerseyNumber,
      availableAllDays: typeof data.availableAllDays === 'boolean' ? data.availableAllDays : true,
      unavailableDates: data.unavailableDates || [],
      termsAccepted: false
    }));

    const selectionEntries = (data.selectedCategories || []).map((entry) => ({
      id: createEntryId(),
      categoryCode: entry.categoryCode,
      primaryPlayerName: entry.primaryPlayerName || user?.fullName || '',
      primaryPlayerAge: entry.primaryPlayerAge?.toString() || '',
      primaryPlayerRelation: entry.primaryPlayerRelation || 'SELF',
      partnerPlayerName: entry.partnerPlayerName || '',
      partnerPlayerAge: entry.partnerPlayerAge ? entry.partnerPlayerAge.toString() : '',
      partnerPlayerRelation: entry.partnerPlayerRelation || '',
      notes: entry.notes || ''
    }));

    setCategoryForms(selectionEntries);

    if (selectionEntries.length === 0 && categoryList?.length) {
      setPendingCategoryCode(categoryList[0].code);
    }
  };

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat.code] = cat;
    });
    return map;
  }, [categories]);

  const getRelationOptionsForCategory = (categoryCode) =>
    categoryMap[categoryCode]?.relationOptions || [];

  const availableCategoryOptions = useMemo(() => {
    return categories.filter(
      (cat) => !categoryForms.some((entry) => entry.categoryCode === cat.code)
    );
  }, [categories, categoryForms]);

  useEffect(() => {
    if (availableCategoryOptions.length === 0) {
      setPendingCategoryCode('');
      return;
    }
    if (
      !pendingCategoryCode ||
      !availableCategoryOptions.some((option) => option.code === pendingCategoryCode)
    ) {
      setPendingCategoryCode(availableCategoryOptions[0].code);
    }
  }, [availableCategoryOptions, pendingCategoryCode]);

  const totalParticipants = useMemo(
    () =>
      categoryForms.reduce(
        (sum, entry) => sum + (categoryMap[entry.categoryCode]?.participantsPerEntry || 1),
        0
      ),
    [categoryForms, categoryMap]
  );

  const totalAmount = useMemo(() => {
    if (!event?.price) return 0;
    return totalParticipants * Number(event.price || 0);
  }, [totalParticipants, event]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleJerseyChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 3);
    setFormData((prev) => ({ ...prev, jerseyNumber: digitsOnly }));
  };

  const handleAvailabilityChange = (e) => {
    const isAvailable = e.target.value === 'YES';
    setFormData((prev) => ({
      ...prev,
      availableAllDays: isAvailable,
      unavailableDates: isAvailable ? [] : prev.unavailableDates
    }));
  };

  const handleUnavailableDateToggle = (dateValue) => {
    setFormData((prev) => {
      const exists = prev.unavailableDates.includes(dateValue);
      return {
        ...prev,
        unavailableDates: exists
          ? prev.unavailableDates.filter((d) => d !== dateValue)
          : [...prev.unavailableDates, dateValue]
      };
    });
  };

  const handleAddCategory = () => {
    if (!pendingCategoryCode || categoryForms.some((entry) => entry.categoryCode === pendingCategoryCode)) {
      return;
    }

    const meta = categoryMap[pendingCategoryCode];
    const relationOptions = meta?.categoryType === 'FAMILY' ? getRelationOptionsForCategory(pendingCategoryCode) : [];
    const defaultRelation = relationOptions.length ? relationOptions[0] : null;

    const newEntry = {
      id: createEntryId(),
      categoryCode: pendingCategoryCode,
      primaryPlayerName: defaultSelfName,
      primaryPlayerAge: defaultSelfAge,
      primaryPlayerRelation: meta?.categoryType === 'FAMILY' ? defaultRelation?.selfRole || 'SELF' : '',
      partnerPlayerName: '',
      partnerPlayerAge: '',
      partnerPlayerRelation: meta?.categoryType === 'FAMILY' ? defaultRelation?.partnerRole || '' : '',
      notes: ''
    };
    setCategoryForms((prev) => [...prev, newEntry]);
    setSuccess('');
  };

  const handleCategoryFieldChange = (id, field, value) => {
    setCategoryForms((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
    );
  };

  const handleRelationSelection = (id, selectedSelfRole) => {
    setCategoryForms((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) {
          return entry;
        }
        const relationOptions = getRelationOptionsForCategory(entry.categoryCode);
        const matchedOption = relationOptions.find((option) => option.selfRole === selectedSelfRole);
        return {
          ...entry,
          primaryPlayerRelation: selectedSelfRole,
          partnerPlayerRelation: matchedOption?.partnerRole || entry.partnerPlayerRelation
        };
      })
    );
  };

  const handleRemoveCategory = (id) => {
    setCategoryForms((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleFileChange = async (event, field, uploadKey) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File exceeds ${MAX_FILE_SIZE_MB}MB limit`);
      return;
    }
    setUploading((prev) => ({ ...prev, [uploadKey]: true }));
    setError('');

    try {
      let uploadFn = null;
      if (field === 'aadhaarFrontPhoto') uploadFn = badmintonApi.uploadAadhaarFront;
      if (field === 'aadhaarBackPhoto') uploadFn = badmintonApi.uploadAadhaarBack;
      if (field === 'playerPhoto') uploadFn = badmintonApi.uploadPlayerPhoto;
      if (!uploadFn) {
        throw new Error('Unsupported upload field');
      }

      const response = await uploadFn(file);
      const filePath = response.data.data.filePath;
      setFormData((prev) => ({ ...prev, [field]: filePath }));

      const previewUrl = URL.createObjectURL(file);
      if (previewUrlsRef.current[field]) {
        URL.revokeObjectURL(previewUrlsRef.current[field]);
      }
      previewUrlsRef.current[field] = previewUrl;
      setPreviews((prev) => ({ ...prev, [field]: previewUrl }));
      setSuccess('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading((prev) => ({ ...prev, [uploadKey]: false }));
    }
  };

  const validateCategory = (entry) => {
    const meta = categoryMap[entry.categoryCode];
    if (!meta) return false;
    if (!entry.primaryPlayerName?.trim()) return false;
    const primaryAge = Number(entry.primaryPlayerAge);
    if (!Number.isInteger(primaryAge) || primaryAge <= 0) return false;

    if (meta.categoryType === 'FAMILY') {
      if (!entry.primaryPlayerRelation?.trim()) return false;
    }

    if (meta.categoryType === 'DOUBLE' || meta.categoryType === 'FAMILY') {
      if (!entry.partnerPlayerName?.trim()) return false;
      const partnerAge = Number(entry.partnerPlayerAge);
      if (!Number.isInteger(partnerAge) || partnerAge <= 0) return false;
    }

    if (meta.categoryType === 'FAMILY' && !entry.partnerPlayerRelation?.trim()) {
      return false;
    }
    return true;
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: {
        return (
          formData.aadhaarFrontPhoto &&
          formData.aadhaarBackPhoto &&
          formData.playerPhoto
        );
      }
      case 1: {
        return categoryForms.length > 0 && categoryForms.every(validateCategory);
      }
      case 2: {
        const jersey = Number(formData.jerseyNumber);
        const requiresUnavailableSelection =
          formData.availableAllDays === false && eventDates.length > 0;
        return (
          formData.tshirtName?.trim() &&
          formData.tshirtSize &&
          Number.isInteger(jersey) &&
          jersey >= 1 &&
          jersey <= 999 &&
          formData.termsAccepted &&
          (!requiresUnavailableSelection || formData.unavailableDates.length > 0)
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
      setSuccess('');
    } else {
      setError('Please fill all required fields correctly');
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
    setError('');
    setSuccess('');
  };

  const buildPayload = () => ({
    eventId: Number(eventId),
    gender: user?.gender || null,
    tshirtSize: formData.tshirtSize || null,
    residentialAddress: user?.residentialAddress || '',
    whatsappNumber: userContactNumber || '',
    aadhaarFrontPhoto: formData.aadhaarFrontPhoto,
    aadhaarBackPhoto: formData.aadhaarBackPhoto,
    playerPhoto: formData.playerPhoto,
    tshirtName: formData.tshirtName.trim(),
    jerseyNumber: Number(formData.jerseyNumber),
    availableAllDays: formData.availableAllDays,
    unavailableDates: formData.availableAllDays ? [] : formData.unavailableDates,
    termsAccepted: formData.termsAccepted,
    categories: categoryForms.map((entry) => {
      const meta = categoryMap[entry.categoryCode];
      const type = meta?.categoryType;
      const requiresFamilyRelation = type === 'FAMILY';

      return {
        categoryCode: entry.categoryCode,
        primaryPlayerName: entry.primaryPlayerName.trim(),
        primaryPlayerAge: Number(entry.primaryPlayerAge),
        primaryPlayerRelation: entry.primaryPlayerRelation?.trim() || 'SELF',
        partnerPlayerName: entry.partnerPlayerName?.trim() || null,
        partnerPlayerAge: entry.partnerPlayerAge ? Number(entry.partnerPlayerAge) : null,
        partnerPlayerRelation: requiresFamilyRelation
          ? entry.partnerPlayerRelation?.trim() || null
          : null,
        notes: entry.notes?.trim() || ''
      };
    })
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) {
      setError('Please fill all required fields and accept the terms to continue');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = buildPayload();
      const response = await badmintonApi.completeRegistration(payload);
      const data = response.data.data;
      setExistingData(data);
      hydrateFromRegistration(data, categories);

      if (data.readyForPayment && data.eventRegistrationId && data.totalPayableAmount > 0) {
        await initiatePayment(data.eventRegistrationId, data.totalPayableAmount, data.eventName);
      } else {
        setSuccess('Registration saved. Complete all required details to proceed with payment.');
        setSubmitting(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete registration');
      setSubmitting(false);
    }
  };

  const initiatePayment = async (registrationId, amount, eventName) => {
    try {
      if (typeof window === 'undefined' || !window.Razorpay) {
        throw new Error('Payment SDK is not loaded. Please refresh the page and try again.');
      }

      const paymentInit = await api.post('/payments/initiate', {
        registrationId,
        amount
      });
      const paymentData = paymentInit.data.data;
      const orderId = paymentData.razorpayOrderId;
      const payableAmount = Number(amount) * 100;

      const options = {
        key: 'rzp_test_RgO20QqKKlOShG',
        amount: payableAmount,
        currency: 'INR',
        name: 'ANPL Sports',
        description: `Badminton registration for ${eventName || 'ANPL'}`,
        order_id: orderId,
        handler: async (paymentResult) => {
          try {
            await api.post('/payments/verify', {
              registrationId,
              orderId: paymentResult.razorpay_order_id,
              paymentId: paymentResult.razorpay_payment_id,
              signature: paymentResult.razorpay_signature
            });
            navigate('/dashboard', {
              state: { message: 'Badminton registration and payment successful!' }
            });
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          }
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: userContactNumber || user?.phoneNumber || ''
        },
        theme: { color: '#1976d2' }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment');
      setSubmitting(false);
    }
  };

  const renderDocumentStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info">Upload clear documents (JPG/PNG/PDF up to {MAX_FILE_SIZE_MB}MB)</Alert>
      </Grid>

      {[
        { id: 'aadhaar-front', label: 'Aadhaar Front', field: 'aadhaarFrontPhoto' },
        { id: 'aadhaar-back', label: 'Aadhaar Back', field: 'aadhaarBackPhoto' },
        { id: 'player-photo', label: 'Player Photo', field: 'playerPhoto', accept: 'image/*' }
      ].map((item) => (
        <Grid item xs={12} md={4} key={item.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {item.label}
              </Typography>
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
                  fullWidth
                  startIcon={uploading[item.id] ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                  disabled={uploading[item.id]}
                >
                  Upload
                </Button>
              </label>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                JPG/PNG/PDF up to {MAX_FILE_SIZE_MB}MB
              </Typography>

              {(() => {
                const previewValue = previews[item.field];
                const storedValue = formData[item.field];
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
                  if (isImagePath(storedValue)) {
                    return (
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
                    );
                  }
                  return (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Saved document{' '}
                        <a href={storedUrl} target="_blank" rel="noopener noreferrer">
                          (view)
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
      <Grid item xs={12}>
        <Alert severity="info">
          Personal details (gender, contact number, address) will be picked automatically from your ANPL profile.
        </Alert>
      </Grid>
    </Grid>
  );

  const renderCategoryStep = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Each category costs ₹{event?.price || 0} per participant. Double/Family categories cost ₹
        {(event?.price || 0) * 2}.
      </Alert>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={8}>
          <FormControl fullWidth>
            <InputLabel>Select Category</InputLabel>
            <Select
              label="Select Category"
              value={pendingCategoryCode}
              onChange={(e) => setPendingCategoryCode(e.target.value)}
              disabled={availableCategoryOptions.length === 0}
            >
              {availableCategoryOptions.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                  {option.displayName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            fullWidth
            onClick={handleAddCategory}
            disabled={!pendingCategoryCode}
          >
            Add Category
          </Button>
        </Grid>
      </Grid>

      <Stack spacing={2} sx={{ mt: 3 }}>
        {categoryForms.length === 0 && (
          <Alert severity="warning">Add at least one category to continue.</Alert>
        )}

        {categoryForms.map((entry) => {
          const meta = categoryMap[entry.categoryCode];
          const typeLabel = meta?.categoryType || 'SOLO';
          const relationOptionsForCategory = getRelationOptionsForCategory(entry.categoryCode);
          const hasPredefinedRelations = relationOptionsForCategory.length > 0;
          const matchedRelation = relationOptionsForCategory.find(
            (option) => option.selfRole === entry.primaryPlayerRelation
          );
          const partnerRelationDisplay = hasPredefinedRelations
            ? matchedRelation?.partnerRole || relationOptionsForCategory[0].partnerRole
            : entry.partnerPlayerRelation;
          return (
            <Paper key={entry.id} sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="h6">{meta?.displayName || 'Category'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {typeLabel === 'SOLO'
                      ? 'Solo entry'
                      : typeLabel === 'DOUBLE'
                      ? 'Requires partner details'
                      : 'Requires partner & relation details'}
                  </Typography>
                </Box>
                <Box display="flex" gap={1} alignItems="center">
                  <Chip label={typeLabel} color={typeLabel === 'SOLO' ? 'default' : typeLabel === 'DOUBLE' ? 'primary' : 'secondary'} />
                  <Tooltip title="Remove category">
                    <IconButton color="error" onClick={() => handleRemoveCategory(entry.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Player Name"
                    value={entry.primaryPlayerName}
                    onChange={(e) => handleCategoryFieldChange(entry.id, 'primaryPlayerName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    required
                    label="Age"
                    value={entry.primaryPlayerAge}
                    onChange={(e) =>
                      handleCategoryFieldChange(entry.id, 'primaryPlayerAge', e.target.value.replace(/\D/g, ''))
                    }
                    inputProps={{ inputMode: 'numeric' }}
                  />
                </Grid>
                {meta?.categoryType === 'FAMILY' && (
                  <Grid item xs={12} md={3}>
                    {hasPredefinedRelations ? (
                      <FormControl fullWidth required>
                        <InputLabel>Your Relation</InputLabel>
                        <Select
                          label="Your Relation"
                          value={entry.primaryPlayerRelation || relationOptionsForCategory[0].selfRole}
                          onChange={(e) => handleRelationSelection(entry.id, e.target.value)}
                        >
                          {relationOptionsForCategory.map((option) => (
                            <MenuItem key={option.selfRole} value={option.selfRole}>
                              {formatRelationLabel(option.selfRole)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        fullWidth
                        required
                        label="Relation"
                        value={entry.primaryPlayerRelation}
                        onChange={(e) => handleCategoryFieldChange(entry.id, 'primaryPlayerRelation', e.target.value)}
                        helperText="E.g., SELF"
                      />
                    )}
                  </Grid>
                )}

                {(meta?.categoryType === 'DOUBLE' || meta?.categoryType === 'FAMILY') && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        label={meta?.categoryType === 'FAMILY' ? 'Family Partner Name' : 'Partner Name'}
                        value={entry.partnerPlayerName}
                        onChange={(e) =>
                          handleCategoryFieldChange(entry.id, 'partnerPlayerName', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        required
                        label="Partner Age"
                        value={entry.partnerPlayerAge}
                        onChange={(e) =>
                          handleCategoryFieldChange(entry.id, 'partnerPlayerAge', e.target.value.replace(/\D/g, ''))
                        }
                        inputProps={{ inputMode: 'numeric' }}
                      />
                    </Grid>
                    {meta?.categoryType === 'FAMILY' && (
                      <Grid item xs={12} md={3}>
                        {hasPredefinedRelations ? (
                          <TextField
                            fullWidth
                            label="Partner Relation"
                            value={partnerRelationDisplay ? formatRelationLabel(partnerRelationDisplay) : ''}
                            InputProps={{ readOnly: true }}
                          />
                        ) : (
                          <TextField
                            fullWidth
                            required
                            label="Partner Relation"
                            value={entry.partnerPlayerRelation}
                            onChange={(e) =>
                              handleCategoryFieldChange(entry.id, 'partnerPlayerRelation', e.target.value)
                            }
                            helperText="E.g., HUSBAND"
                          />
                        )}
                      </Grid>
                    )}
                  </>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes / Preferences"
                    value={entry.notes}
                    onChange={(e) => handleCategoryFieldChange(entry.id, 'notes', e.target.value)}
                    multiline
                    minRows={2}
                  />
                </Grid>
              </Grid>
            </Paper>
          );
        })}
      </Stack>

      <Paper variant="outlined" sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">
            Categories selected: <strong>{categoryForms.length}</strong>
          </Typography>
          <Typography variant="body2">
            Total participants: <strong>{totalParticipants}</strong>
          </Typography>
          <Typography variant="h6">
            Total Amount: {formatCurrency(totalAmount)}
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );

  const renderJerseyStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          label="Name for Jersey"
          name="tshirtName"
          value={formData.tshirtName}
          onChange={handleInputChange}
          helperText="Letters only"
          inputProps={{ maxLength: 50 }}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          label="Jersey Number (1-999)"
          name="jerseyNumber"
          value={formData.jerseyNumber}
          onChange={handleJerseyChange}
          inputProps={{ maxLength: 3, inputMode: 'numeric' }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Jersey Size</InputLabel>
          <Select name="tshirtSize" value={formData.tshirtSize} onChange={handleInputChange} label="Jersey Size">
            {jerseySizeOptions.map((option) => (
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
              Tournament dates are not available yet. We will assume you are available on all days once the schedule is
              announced.
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Select the dates you are unavailable:
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
        <Typography variant="subtitle1" gutterBottom>
          Registration Rules &amp; Terms
        </Typography>
        <Box
          sx={{
            border: (theme) => `1px solid ${theme.palette.divider}`,
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
              onChange={handleInputChange}
              required
            />
          }
          label={
            <Typography variant="body2">
              I confirm that the provided information is accurate and I agree to the tournament Terms & Conditions.
            </Typography>
          }
        />
      </Grid>

      <Grid item xs={12}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Total Payable: {formatCurrency(totalAmount)}</strong>
            <br />
            Payment will cover all selected categories in a single transaction.
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
        return renderCategoryStep();
      case 2:
        return renderJerseyStep();
      default:
        return null;
    }
  };

  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Badminton Event Registration
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
          {event?.name || 'Loading event...'}
        </Typography>
        <Typography variant="body2" align="center" color="error" gutterBottom>
          Complete all steps to register and pay once.
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mt: 4, mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button disabled={activeStep === 0 || submitting} onClick={handleBack} variant="outlined">
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting || !validateStep(activeStep)}
                  startIcon={submitting ? <CircularProgress size={20} /> : null}
                >
                  {submitting ? 'Processing...' : 'Complete & Pay'}
                </Button>
              ) : (
                <Button onClick={handleNext} variant="contained" disabled={!validateStep(activeStep)}>
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

export default BadmintonRegistration;

