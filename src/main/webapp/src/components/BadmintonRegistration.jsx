import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Checkbox,
  FormControlLabel,
  Stack,
  Avatar,
  Chip,
  Tooltip
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  CheckCircleOutline as CheckCircleOutlineIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api, { badmintonApi, userApi } from '../api/axios';
import { cricketTournamentRules } from '../constants/registrationRules';

const steps = ['Player Photo', 'Select Categories', 'Review & Pay'];
const MAX_FILE_SIZE_MB = 5;

const getFileUrl = (path = '') => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  if (path.startsWith('/')) {
    return path;
  }
  return `/uploads/${path}`;
};

const formatGenderLabel = (value) => {
  if (!value) return '';
  const lower = value.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const FAMILY_RELATIONS = {
  'Husband & Wife': [
    { self: 'Husband', partner: 'Wife', selfGender: 'MALE', partnerGender: 'FEMALE' },
    { self: 'Wife', partner: 'Husband', selfGender: 'FEMALE', partnerGender: 'MALE' }
  ],
  'Father Daughter': [
    { self: 'Father', partner: 'Daughter', selfGender: 'MALE', partnerGender: 'FEMALE' },
    { self: 'Daughter', partner: 'Father', selfGender: 'FEMALE', partnerGender: 'MALE' }
  ],
  'Mother Daughter': [
    { self: 'Mother', partner: 'Daughter', selfGender: 'FEMALE', partnerGender: 'FEMALE' },
    { self: 'Daughter', partner: 'Mother', selfGender: 'FEMALE', partnerGender: 'FEMALE' }
  ],
  'Mother Son': [
    { self: 'Mother', partner: 'Son', selfGender: 'FEMALE', partnerGender: 'MALE' },
    { self: 'Son', partner: 'Mother', selfGender: 'MALE', partnerGender: 'FEMALE' }
  ],
  'Saas Bahu': [
    { self: 'Saas', partner: 'Bahu', selfGender: 'FEMALE', partnerGender: 'FEMALE' },
    { self: 'Bahu', partner: 'Saas', selfGender: 'FEMALE', partnerGender: 'FEMALE' }
  ],
  'Father Son 15+': [
    { self: 'Father', partner: 'Son', selfGender: 'MALE', partnerGender: 'MALE' },
    { self: 'Son', partner: 'Father', selfGender: 'MALE', partnerGender: 'MALE' }
  ],
  'Father Son U15': [
    { self: 'Father', partner: 'Son', selfGender: 'MALE', partnerGender: 'MALE' },
    { self: 'Son', partner: 'Father', selfGender: 'MALE', partnerGender: 'MALE' }
  ]
};

const getFamilyRelationMeta = (category, selfRelation) => {
  const options = FAMILY_RELATIONS[category] || [];
  return options.find((option) => option.self === selfRelation) || null;
};

const relationPartnerMap = (category, selfRelation) =>
  getFamilyRelationMeta(category, selfRelation)?.partner || '';

const hasUploadedAadhaar = (userRecord) => {
  if (!userRecord) {
    return false;
  }
  if (typeof userRecord.hasAadhaarDocuments === 'boolean') {
    return userRecord.hasAadhaarDocuments;
  }
  return Boolean(userRecord.aadhaarFrontPhoto && userRecord.aadhaarBackPhoto);
};

const detectGenderRequirement = (categoryName = '', categoryType) => {
  if (!categoryName || categoryType === 'FAMILY') return null;
  const lower = categoryName.toLowerCase();
  if (lower.includes('women') || lower.includes('womens') || lower.includes('girl') || lower.includes('ladies') || lower.includes('female')) {
    return 'FEMALE';
  }
  if (
    lower.includes('boys') ||
    lower.includes("men's") ||
    lower.includes('mens') ||
    lower.startsWith('men ') ||
    lower.startsWith('men\'') ||
    lower.includes(' men ') ||
    lower.includes(' male')
  ) {
    return 'MALE';
  }
  return null;
};

const describeAgeLimit = (ageLimit = '') => {
  if (!ageLimit || ageLimit.trim().toUpperCase() === 'OPEN') {
    return 'Open category';
  }
  const normalized = ageLimit.trim().toUpperCase();
  if (normalized.startsWith('U')) {
    return `Under ${normalized.substring(1).replace(/[^0-9]/g, '')}`;
  }
  if (normalized.endsWith('+')) {
    return `${normalized.replace('+', '')}+ years`;
  }
  return ageLimit;
};

const evaluateAgeEligibility = (ageLimit, age) => {
  if (!ageLimit || age === null || age === undefined || Number.isNaN(age)) {
    return { eligible: true, label: describeAgeLimit(ageLimit) };
  }
  const normalized = ageLimit.trim().toUpperCase();
  if (normalized === 'OPEN') {
    return { eligible: true, label: describeAgeLimit(ageLimit) };
  }
  if (normalized.startsWith('U')) {
    const limit = parseInt(normalized.substring(1).replace(/[^0-9]/g, ''), 10);
    if (Number.isNaN(limit)) {
      return { eligible: true, label: describeAgeLimit(ageLimit) };
    }
    return { eligible: age <= limit, label: `Under ${limit}` };
  }
  if (normalized.endsWith('+')) {
    const min = parseInt(normalized.replace('+', '').replace(/[^0-9]/g, ''), 10);
    if (Number.isNaN(min)) {
      return { eligible: true, label: describeAgeLimit(ageLimit) };
    }
    return { eligible: age >= min, label: `${min}+ years` };
  }
  return { eligible: true, label: ageLimit };
};

const calcAge = (dateString) => {
  if (!dateString) return null;
  const dob = new Date(dateString);
  if (Number.isNaN(dob)) return null;
  const diff = Date.now() - dob.getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
};

const mapServerEntryToSelection = (entry) => ({
  entryId: entry.entryId || null,
  categoryId: entry.categoryId,
  categoryName: entry.categoryName,
  categoryType: entry.categoryType,
  pricePerPlayer: entry.pricePerPlayer,
  registrationCode: entry.registrationCode || null,
  partnerInfo: entry.partnerInfo || null,
  selfRelation: entry.selfRelation || null,
  partnerRelation: entry.partnerRelation || null
});

const BadmintonRegistration = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [playerPhoto, setPlayerPhoto] = useState('');
  const [playerPhotoPreview, setPlayerPhotoPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [dialogState, setDialogState] = useState({
    open: false,
    category: null,
    partnerQuery: '',
    searchResults: [],
    selectedPartner: null,
    selfRelation: ''
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [photoPrefilled, setPhotoPrefilled] = useState(false);
  const [pendingBundleId, setPendingBundleId] = useState(null);
  const [hasPendingBundle, setHasPendingBundle] = useState(false);

  const playerAge = useMemo(() => calcAge(user?.dateOfBirth), [user]);
  const playerGender = user?.gender || null;
  const playerGenderCode = playerGender ? playerGender.toUpperCase() : null;
  const selectedFamilyMeta = useMemo(() => {
    if (dialogState.category?.categoryType !== 'FAMILY' || !dialogState.selfRelation) {
      return null;
    }
    return getFamilyRelationMeta(dialogState.category.name, dialogState.selfRelation);
  }, [dialogState.category, dialogState.selfRelation]);
  const relationGenderWarning = useMemo(() => {
    if (!selectedFamilyMeta || !selectedFamilyMeta.selfGender) {
      return null;
    }
    if (!playerGenderCode) {
      return 'Please update your gender in profile to select this relation.';
    }
    if (selectedFamilyMeta.selfGender !== playerGenderCode) {
      return `Selected relation requires a ${selectedFamilyMeta.selfGender.toLowerCase()} player.`;
    }
    return null;
  }, [selectedFamilyMeta, playerGenderCode]);
  const isFamilyDialog = dialogState.category?.categoryType === 'FAMILY';
  const isPartnerSearchTemporarilyDisabled =
    isFamilyDialog && (!dialogState.selfRelation || !!relationGenderWarning);
  const resolvedPlayerPhoto = useMemo(
    () => playerPhotoPreview || getFileUrl(playerPhoto),
    [playerPhotoPreview, playerPhoto]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventResp, categoryResp, pendingResp] = await Promise.all([
          api.get(`/events/${eventId}`),
          badmintonApi.getCategories(),
          badmintonApi.getPendingBundle(eventId)
        ]);
        setEvent(eventResp.data.data);
        setCategories(categoryResp.data.data || []);
        const pendingData = pendingResp.data.data;
        if (pendingData?.entries?.length) {
          setSelectedEntries(pendingData.entries.map(mapServerEntryToSelection));
          setPendingBundleId(pendingData.bundleRegistrationId);
          setHasPendingBundle(true);
          setTermsAccepted(true);
          if (pendingData.playerPhoto) {
            setPlayerPhoto(pendingData.playerPhoto);
            setPlayerPhotoPreview(getFileUrl(pendingData.playerPhoto));
            setPhotoPrefilled(true);
          }
        } else {
          setPendingBundleId(null);
          setHasPendingBundle(false);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load badminton registration');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  useEffect(() => {
    if (photoPrefilled || !user?.playerPhoto) {
      return;
    }
    const url = getFileUrl(user.playerPhoto);
    setPlayerPhoto(user.playerPhoto);
    setPlayerPhotoPreview(url);
    setPhotoPrefilled(true);
  }, [user, photoPrefilled]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size must be under ${MAX_FILE_SIZE_MB}MB`);
      return;
    }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await badmintonApi.uploadPlayerPhoto(formData);
      setPlayerPhoto(response.data.data.filePath);
      if (playerPhotoPreview && playerPhotoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(playerPhotoPreview);
      }
      setPlayerPhotoPreview(URL.createObjectURL(file));
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const openCategoryDialog = (category) => {
    if (selectedEntries.find((entry) => entry.categoryId === category.id)) {
      setError('You have already selected this category');
      return;
    }
    if (category.categoryType === 'SOLO') {
      addEntry({
        categoryId: category.id,
        categoryName: category.name,
        categoryType: category.categoryType,
        pricePerPlayer: category.pricePerPlayer
      });
      return;
    }
    setDialogState({
      open: true,
      category,
      partnerQuery: '',
      searchResults: [],
      selectedPartner: null,
      selfRelation: ''
    });
  };

  const closeCategoryDialog = () => {
    setDialogState((prev) => ({
      ...prev,
      open: false,
      category: null,
      partnerQuery: '',
      searchResults: [],
      selectedPartner: null,
      selfRelation: ''
    }));
  };

  const handlePartnerSearch = async (value) => {
    setDialogState((prev) => ({ ...prev, partnerQuery: value }));
    if (!value || value.trim().length < 2) {
      setDialogState((prev) => ({ ...prev, searchResults: [] }));
      setSearchLoading(false);
      return;
    }
    try {
      setSearchLoading(true);
      const response = await userApi.search(value.trim());
      setDialogState((prev) => ({ ...prev, searchResults: response.data.data || [] }));
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const addEntry = (entry) => {
    setSelectedEntries((prev) => [...prev, entry]);
    setHasPendingBundle(false);
    setPendingBundleId(null);
    setError('');
  };

  const handleDialogSave = () => {
    const { category, selectedPartner, selfRelation } = dialogState;
    if (!category) return;
    if (category.categoryType === 'DOUBLE' && !selectedPartner) {
      setError('Please select a partner');
      return;
    }
    if (
      category.categoryType === 'DOUBLE' &&
      !hasUploadedAadhaar(selectedPartner)
    ) {
      setError('Selected partner must upload Aadhaar front and back images before registering.');
      return;
    }
    if (category.categoryType === 'FAMILY') {
      if (!selfRelation) {
        setError('Please select your relation');
        return;
      }
      if (!selectedPartner) {
        setError('Please select a partner');
        return;
      }
      if (!hasUploadedAadhaar(selectedPartner)) {
        setError('Selected partner must upload Aadhaar front and back images before registering.');
        return;
      }
      const relationMeta = getFamilyRelationMeta(category.name, selfRelation);
      if (!relationMeta) {
        setError('Invalid relation selected');
        return;
      }
      if (relationMeta.selfGender) {
        if (!playerGenderCode) {
          setError('Please update your gender in profile to select this relation.');
          return;
        }
        if (relationMeta.selfGender !== playerGenderCode) {
          setError(`Selected relation requires a ${relationMeta.selfGender.toLowerCase()} player.`);
          return;
        }
      }
      if (relationMeta.partnerGender) {
        const partnerGenderCode = selectedPartner.gender ? selectedPartner.gender.toUpperCase() : null;
        if (!partnerGenderCode) {
          setError('Selected partner must update their gender information to enroll in this relation.');
          return;
        }
        if (partnerGenderCode !== relationMeta.partnerGender) {
          setError(
            `Selected partner must be ${relationMeta.partnerGender.toLowerCase()} for this relation.`
          );
          return;
        }
      }
    }

    let entryPayload = {
      entryId: null,
      registrationCode: null,
      categoryId: category.id,
      categoryName: category.name,
      categoryType: category.categoryType,
      pricePerPlayer: category.pricePerPlayer
    };

    if (category.categoryType === 'DOUBLE') {
      entryPayload = {
        ...entryPayload,
        partnerInfo: {
          userId: selectedPartner.id,
          fullName: selectedPartner.fullName,
          age: calcAge(selectedPartner.dateOfBirth),
          contactNumber: selectedPartner.phoneNumber,
          playerPhoto: selectedPartner.playerPhoto || null,
          houseNumber: selectedPartner.houseNumber || null
        }
      };
    }

    if (category.categoryType === 'FAMILY') {
      const relationMeta = getFamilyRelationMeta(category.name, selfRelation);
      entryPayload = {
        ...entryPayload,
        selfRelation,
        partnerRelation: relationMeta?.partner || relationPartnerMap(category.name, selfRelation),
        partnerInfo: {
          userId: selectedPartner.id,
          fullName: selectedPartner.fullName,
          age: calcAge(selectedPartner.dateOfBirth),
          contactNumber: selectedPartner.phoneNumber,
          playerPhoto: selectedPartner.playerPhoto || null,
          houseNumber: selectedPartner.houseNumber || null
        }
      };
    }

    addEntry(entryPayload);
    closeCategoryDialog();
  };

  const handleRemoveEntry = (categoryId) => {
    setSelectedEntries((prev) => prev.filter((entry) => entry.categoryId !== categoryId));
    setHasPendingBundle(false);
    setPendingBundleId(null);
  };

  const PRICE_PER_PLAYER = 800;
  const buildCategoryEligibility = (category) => {
    const ageMeta = evaluateAgeEligibility(category.ageLimit, playerAge);
    const genderRequirement = detectGenderRequirement(category.name, category.categoryType);
    const genderEligible =
      !genderRequirement || !playerGender || playerGender.toUpperCase() === genderRequirement;
    return {
      ageLabel: ageMeta.label,
      ageEligible: ageMeta.eligible,
      genderRequirement,
      genderEligible
    };
  };

  const totalAmount = useMemo(() => {
    return selectedEntries.reduce((sum, entry) => {
      const perPlayer = entry.pricePerPlayer || PRICE_PER_PLAYER;
      if (entry.categoryType === 'SOLO') {
        return sum + perPlayer;
      }
      return sum + perPlayer * 2;
    }, 0);
  }, [selectedEntries]);

  const validateStep = (step) => {
    if (step === 0) {
      return !!playerPhoto;
    }
    if (step === 1) {
      return selectedEntries.length > 0;
    }
    if (step === 2) {
      return termsAccepted;
    }
    return false;
  };

  const handleNext = () => {
    if (!validateStep(activeStep)) {
      setError('Please complete the required fields');
      return;
    }
    setActiveStep((prev) => prev + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
    setError('');
  };

  const handleSubmit = async () => {
    try {
      if (!validateStep(2)) {
        setError('Please accept terms and conditions');
        return;
      }
      setError('');
      let bundleRegistrationId = pendingBundleId;
      if (!hasPendingBundle) {
        const payload = {
          eventId: Number(eventId),
          entries: selectedEntries.map((entry) => ({
            categoryId: entry.categoryId,
            categoryType: entry.categoryType,
            partnerInfo: entry.partnerInfo || null,
            selfRelation: entry.selfRelation || null,
            partnerRelation: entry.partnerRelation || null
          })),
          playerPhoto,
          termsAccepted,
          totalAmount
        };

        const response = await badmintonApi.submitBundle(payload);
        const registrationData = response.data.data;
        if (registrationData?.entries?.length) {
          setSelectedEntries(registrationData.entries.map(mapServerEntryToSelection));
        }
        bundleRegistrationId = registrationData.bundleRegistrationId;
        setPendingBundleId(bundleRegistrationId);
        setHasPendingBundle(true);
      }

      if (!bundleRegistrationId) {
        setError('Unable to determine bundle to pay for');
        return;
      }

      const orderResponse = await badmintonApi.createOrder(bundleRegistrationId);
      const { orderId, amount } = orderResponse.data.data;

      const options = {
        key: 'rzp_test_RgO20QqKKlOShG',
        amount: amount * 100,
        currency: 'INR',
        name: 'ANPL Sports',
        description: `Badminton Registration - ${event?.name}`,
        order_id: orderId,
        handler: async (res) => {
          try {
            await badmintonApi.verifyPayment({
              bundleId: bundleRegistrationId,
              orderId: res.razorpay_order_id,
              paymentId: res.razorpay_payment_id,
              signature: res.razorpay_signature
            });
            navigate('/dashboard', {
              state: { message: 'Registration successful!' }
            });
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user.fullName,
          email: user.email,
          contact: user.phoneNumber
        },
        theme: {
          color: '#1976d2'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const renderPhotoStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Player Photo
            </Typography>
            {resolvedPlayerPhoto ? (
              <Box
                component="img"
                src={resolvedPlayerPhoto}
                alt="Player preview"
                sx={{
                  width: '100%',
                  maxWidth: 280,
                  borderRadius: 3,
                  mx: 'auto',
                  mb: 3,
                  boxShadow: 3,
                  objectFit: 'cover'
                }}
              />
            ) : (
              <Stack
                spacing={1}
                justifyContent="center"
                alignItems="center"
                sx={{
                  width: '100%',
                  maxWidth: 280,
                  height: 220,
                  borderRadius: 3,
                  mx: 'auto',
                  mb: 3,
                  border: (theme) => `1px dashed ${theme.palette.divider}`,
                  backgroundColor: 'grey.50'
                }}
              >
                <CloudUploadIcon color="action" fontSize="large" />
                <Typography color="text.secondary">No photo uploaded yet</Typography>
              </Stack>
            )}
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="player-photo-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="player-photo-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={uploading ? <CircularProgress size={18} /> : <CloudUploadIcon />}
                disabled={uploading}
              >
                {playerPhoto ? 'Replace Photo' : 'Upload Photo'}
              </Button>
            </label>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>
              JPG/PNG up to {MAX_FILE_SIZE_MB}MB. Existing photo will be reused if you skip this step.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Photo Guidelines
            </Typography>
            <List dense>
              {[
                'Use a recent photo with a plain background.',
                'Face should be clearly visible without sunglasses or caps.',
                'Upload a portrait image (minimum 600px on the shorter side).',
                'Ensure lighting is even—avoid harsh shadows.',
                'You can update this photo anytime before payment.'
              ].map((rule, idx) => (
                <ListItem key={idx} disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleOutlineIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary={rule} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderPlayerInfo = () => (
    <Card
      sx={{
        mb: 3,
        background: 'linear-gradient(135deg, rgba(25,118,210,0.08), rgba(118,255,210,0.15))'
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Your Profile
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
          <Avatar src={resolvedPlayerPhoto} sx={{ width: 86, height: 86, fontSize: 32 }}>
            {user.fullName ? user.fullName.charAt(0) : '?'}
          </Avatar>
          <Box>
            <Typography variant="h6">{user.fullName}</Typography>
            <Typography color="text.secondary">Reg ID: {user.registrationNumber}</Typography>
            <Typography color="text.secondary">Phone: {user.phoneNumber}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
              {playerAge !== null && playerAge !== undefined && (
                <Chip label={`Age ${playerAge}`} size="small" color="primary" />
              )}
              {playerGender && <Chip label={formatGenderLabel(playerGender)} size="small" />}
            </Stack>
          </Box>
        </Stack>
        {playerGender == null && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Please update your gender in profile to unlock gender-restricted categories.
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderCategoryCards = () => (
    <Grid container spacing={2}>
      {categories.map((category) => {
        const { ageEligible, ageLabel, genderRequirement, genderEligible } = buildCategoryEligibility(category);
        const alreadySelected = selectedEntries.some((entry) => entry.categoryId === category.id);
        const disabled = alreadySelected || !ageEligible || !genderEligible;
        const actionLabel = alreadySelected ? 'Selected' : 'Add';
        const tooltipMessage = !ageEligible
          ? `Category requires ${ageLabel}.`
          : !genderEligible
            ? `Category requires ${formatGenderLabel(genderRequirement)} players.`
            : alreadySelected
              ? 'Category already selected.'
              : '';
        return (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                borderColor: !ageEligible || !genderEligible ? 'error.light' : 'divider',
                backgroundColor: disabled ? 'action.hover' : 'background.paper'
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{category.name}</Typography>
                  <Chip size="small" label={category.categoryType} variant="outlined" />
                </Stack>
                <Typography variant="body2" color={ageEligible ? 'text.secondary' : 'error.main'} sx={{ mt: 1 }}>
                  {ageLabel}
                </Typography>
                {genderRequirement && (
                  <Typography
                    variant="body2"
                    color={genderEligible ? 'text.secondary' : 'error.main'}
                  >
                    Requires {formatGenderLabel(genderRequirement)} players
                  </Typography>
                )}
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                  Fee: ₹{category.categoryType === 'SOLO' ? category.pricePerPlayer : category.pricePerPlayer * 2}
                </Typography>
              </CardContent>
              <CardActions>
                <Tooltip title={tooltipMessage}>
                  <span>
                    <Button size="small" onClick={() => openCategoryDialog(category)} disabled={disabled}>
                      {actionLabel}
                    </Button>
                  </span>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );

const renderSelectedEntries = () => (
  <Stack spacing={1}>
    {selectedEntries.map((entry) => (
      <Card variant="outlined" key={entry.categoryId}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
            <Box>
              <Typography variant="subtitle1">{entry.categoryName}</Typography>
              <Typography color="text.secondary">{entry.categoryType}</Typography>
              {entry.registrationCode && (
                <Chip
                  label={`Reg ID: ${entry.registrationCode}`}
                  size="small"
                  color="primary"
                  sx={{ mt: 1 }}
                />
              )}
              {entry.categoryType === 'FAMILY' && (
                <Typography variant="body2" color="text.secondary">
                  Self: {entry.selfRelation} · Partner: {entry.partnerRelation}
                </Typography>
              )}
              {entry.partnerInfo && (
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                  {entry.partnerInfo.playerPhoto && (
                    <Avatar
                      src={getFileUrl(entry.partnerInfo.playerPhoto)}
                      sx={{ width: 56, height: 56 }}
                    >
                      {entry.partnerInfo.fullName?.charAt(0) || '?'}
                    </Avatar>
                  )}
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Partner: {entry.partnerInfo.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      House: {entry.partnerInfo.houseNumber || 'NA'}
                    </Typography>
                  </Box>
                </Stack>
              )}
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2">
                ₹{entry.categoryType === 'SOLO' ? entry.pricePerPlayer : entry.pricePerPlayer * 2}
              </Typography>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleRemoveEntry(entry.categoryId)}
              >
                Remove
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    ))}
    {selectedEntries.length === 0 && (
      <Alert severity="info">No categories selected yet.</Alert>
    )}
  </Stack>
);

  const renderRulesSection = () => (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Tournament Rules
        </Typography>
        <List dense>
          {cricketTournamentRules.map((rule, idx) => (
            <ListItem key={idx} alignItems="flex-start">
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleOutlineIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary={rule} primaryTypographyProps={{ variant: 'body2' }} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #eef2ff 0%, #f5fbff 45%, #eef7ff 100%)',
        minHeight: '100vh',
        py: 6
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            mb: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1a237e, #3949ab)',
            borderRadius: 4,
            color: 'common.white',
            py: 4,
            px: 2
          }}
        >
          <Typography variant="h4" gutterBottom>
            Badminton Registration
          </Typography>
          <Typography variant="subtitle1">
            {event?.name || 'Loading event...'}
          </Typography>
        </Box>

        <Paper elevation={6} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
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

          {activeStep === 0 && renderPhotoStep()}

          {activeStep === 1 && (
            <Stack spacing={3}>
              {renderPlayerInfo()}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Selected Categories
                </Typography>
                {renderSelectedEntries()}
              </Box>
              <Divider />
              <Typography variant="h6">Available Categories</Typography>
              {renderCategoryCards()}
            </Stack>
          )}

          {activeStep === 2 && (
            <Stack spacing={3}>
              <Typography variant="h6">Review & Pay</Typography>
              {renderSelectedEntries()}
              {renderRulesSection()}
              <Typography variant="h5" align="right">
                Total: ₹{totalAmount}
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                }
                label="I agree to the Terms & Conditions"
              />
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={selectedEntries.length === 0 || !termsAccepted}
              >
                Proceed to Pay
              </Button>
            </Stack>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            {activeStep < steps.length - 1 && (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </Container>

      <Dialog open={dialogState.open} onClose={closeCategoryDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add {dialogState.category?.name}
        </DialogTitle>
        <DialogContent dividers>
          {dialogState.category?.categoryType === 'FAMILY' && (
            <Stack spacing={2} sx={{ mb: 2 }}>
              <TextField
                label="Your relation"
                select
                SelectProps={{ native: true }}
                value={dialogState.selfRelation}
                onChange={(e) => {
                  const value = e.target.value;
                  setDialogState((prev) => ({
                    ...prev,
                    selfRelation: value,
                    selectedPartner: null,
                    partnerQuery: '',
                    searchResults: []
                  }));
                }}
              >
                <option value="">Select relation</option>
                {(FAMILY_RELATIONS[dialogState.category?.name] || []).map((option) => (
                  <option key={option.self} value={option.self}>
                    {option.self}
                  </option>
                ))}
              </TextField>
              {dialogState.selfRelation && (
                <Alert severity="info">
                  Partner relation will be set to{' '}
                  {relationPartnerMap(dialogState.category.name, dialogState.selfRelation)}
                </Alert>
              )}
              {relationGenderWarning && (
                <Alert severity="error">{relationGenderWarning}</Alert>
              )}
            </Stack>
          )}

          {['DOUBLE', 'FAMILY'].includes(dialogState.category?.categoryType) && (
            <>
              <TextField
                label="Search partner by name, registration ID, or phone"
                fullWidth
                value={dialogState.partnerQuery}
                onChange={(e) => handlePartnerSearch(e.target.value)}
                sx={{ mb: 2 }}
                disabled={isPartnerSearchTemporarilyDisabled}
                helperText={
                  isFamilyDialog && !dialogState.selfRelation
                    ? 'Select your relation to enable partner search'
                    : isFamilyDialog && relationGenderWarning
                      ? 'Resolve the relation gender mismatch to continue'
                      : ''
                }
              />
              <List dense>
                {dialogState.searchResults.map((result) => {
                  const requiredGender = isFamilyDialog
                    ? selectedFamilyMeta?.partnerGender
                    : detectGenderRequirement(
                        dialogState.category?.name,
                        dialogState.category?.categoryType
                      );
                  const genderLabel = formatGenderLabel(result.gender) || 'Gender NA';
                  const partnerGenderCode = result.gender ? result.gender.toUpperCase() : null;
                  const genderMismatch =
                    requiredGender && partnerGenderCode && partnerGenderCode !== requiredGender;
                  const missingGender = requiredGender && !partnerGenderCode;
                  const isSelected = dialogState.selectedPartner?.id === result.id;
                  const partnerPreview = isSelected
                    ? result.playerPhoto
                      ? getFileUrl(result.playerPhoto)
                      : null
                    : null;
                  const hasDocs = hasUploadedAadhaar(result);
                  const docMismatch = !hasDocs;
                  const disableReason =
                    isPartnerSearchTemporarilyDisabled
                      ? 'Relation needs to be selected'
                      : genderMismatch
                        ? 'Gender does not match this category'
                        : missingGender
                          ? 'Partner gender not specified'
                          : docMismatch
                            ? 'Aadhaar documents missing'
                            : null;
                  const secondaryIssues = [
                    genderMismatch ? 'Gender does not match this category' : null,
                    missingGender ? 'Gender unavailable' : null,
                    docMismatch ? 'Aadhaar documents missing' : null
                  ]
                    .filter(Boolean)
                    .join(' — ');
                  return (
                    <ListItemButton
                      key={result.id}
                      disabled={Boolean(disableReason)}
                      selected={isSelected}
                      onClick={() => setDialogState((prev) => ({ ...prev, selectedPartner: result }))}
                      sx={(theme) => ({
                        borderRadius: 2,
                        mb: 1,
                        border: `1px solid ${
                          isSelected ? theme.palette.primary.main : theme.palette.divider
                        }`
                      })}
                    >
                      <ListItemText
                        primary={
                          <Stack direction="column" spacing={1}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                              <Box>
                                <Typography variant="subtitle2">{result.fullName}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Reg: {result.registrationNumber} · House: {result.houseNumber || 'NA'} · Gender: {genderLabel}
                                </Typography>
                              </Box>
                              {isSelected && (
                                <Chip
                                  size="small"
                                  color="success"
                                  label="Selected"
                                  icon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                                />
                              )}
                            </Stack>
                            {isSelected && partnerPreview && (
                              <Box
                                component="img"
                                src={partnerPreview}
                                alt={`${result.fullName} preview`}
                                sx={{
                                  width: 72,
                                  height: 72,
                                  borderRadius: 2,
                                  border: (theme) => `1px solid ${theme.palette.divider}`,
                                  objectFit: 'cover'
                                }}
                              />
                            )}
                          </Stack>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            color={
                              secondaryIssues
                                ? 'error.main'
                                : 'text.secondary'
                            }
                          >
                            {secondaryIssues && ` — ${secondaryIssues}`}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  );
                })}
                {!searchLoading && dialogState.searchResults.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Type at least 3 characters to search existing players.
                  </Typography>
                )}
                {searchLoading && (
                  <Typography variant="body2" color="text.secondary">
                    Searching players...
                  </Typography>
                )}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCategoryDialog}>Cancel</Button>
          <Button onClick={handleDialogSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
  </Box>
  );
};

export default BadmintonRegistration;
