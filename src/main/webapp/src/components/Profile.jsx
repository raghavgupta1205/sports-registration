import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import StraightenIcon from '@mui/icons-material/Straighten';
import api, { authApi, registrationApi } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [badmintonEntries, setBadmintonEntries] = useState([]);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await authApi.me();
        setProfile(response.data.data);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (tab === 2) {
      loadHistory();
    }
  }, [tab]);

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const [eventHistoryRes, badmintonRes] = await Promise.all([
        registrationApi.getProfileHistory(),
        registrationApi.getProfileBadmintonEntries()
      ]);
      setHistory(eventHistoryRes.data.data || []);
      setBadmintonEntries(badmintonRes.data.data || []);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: '', message: '' });
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    try {
      await authApi.changePassword(passwordForm);
      setPasswordStatus({ type: 'success', message: 'Password updated successfully' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setPasswordStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update password'
      });
    }
  };

  const profilePhotoUrl = useMemo(() => {
    if (!profile?.playerPhoto) return '';
    if (profile.playerPhoto.startsWith('http')) return profile.playerPhoto;
    return `/uploads/${profile.playerPhoto}`;
  }, [profile]);

  const renderProfileOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
              <Avatar
                src={profilePhotoUrl}
                sx={{ width: 120, height: 120, fontSize: 40 }}
              >
                {profile?.fullName?.charAt(0) || '?'}
              </Avatar>
              <Box>
                <Typography variant="h5">{profile?.fullName}</Typography>
                <Typography color="text.secondary">UID: {profile?.registrationNumber}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {profile?.gender && <Chip label={profile.gender} size="small" />}
                  {profile?.block && <Chip label={profile.block} size="small" />}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Contact Details
            </Typography>
            <Stack spacing={1}>
              <Typography>Email: {profile?.email || 'N/A'}</Typography>
              <Typography>Phone: {profile?.phoneNumber || 'N/A'}</Typography>
              {/* <Typography>WhatsApp: {profile?.whatsappNumber || 'N/A'}</Typography> */}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Address
            </Typography>
            <Stack spacing={1}>
              <Typography>House: {profile?.houseNumber || 'N/A'}</Typography>
              <Typography>Block: {profile?.block || 'N/A'}</Typography>
              {/* <Typography>Address: {profile?.residentialAddress || 'N/A'}</Typography> */}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderChangePassword = () => (
    <Box component="form" onSubmit={submitPasswordChange}>
      <Stack spacing={2} alignItems="flex-start">
        {passwordStatus.message && (
          <Alert severity={passwordStatus.type}>{passwordStatus.message}</Alert>
        )}
        <TextField
          label="Current Password"
          type="password"
          fullWidth
          required
          name="currentPassword"
          value={passwordForm.currentPassword}
          onChange={handlePasswordChange}
        />
        <TextField
          label="New Password"
          type="password"
          fullWidth
          required
          name="newPassword"
          value={passwordForm.newPassword}
          onChange={handlePasswordChange}
        />
        <TextField
          label="Confirm New Password"
          type="password"
          fullWidth
          required
          name="confirmNewPassword"
          value={passwordForm.confirmNewPassword}
          onChange={handlePasswordChange}
        />
        <Button type="submit" variant="contained" startIcon={<CompareArrowsIcon />}>
          Update Password
        </Button>
      </Stack>
    </Box>
  );

  const renderHistory = () => (
    <Stack spacing={3}>
      {historyLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Card>
            <CardContent>
              <Typography variant="h6">Cricket / Event Registrations</Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {history.length === 0 && <Typography>No registrations yet.</Typography>}
                {history.map((item) => (
                  <Box key={`${item.eventId}-${item.registrationId}`} sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                    <Typography variant="subtitle1">{item.eventName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.eventType} · Reg ID: {item.registrationCode || 'N/A'}
                    </Typography>
                    <Typography variant="body2">Status: {item.status}</Typography>
                    <Typography variant="body2">
                      Registered On: {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6">Badminton Entries</Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {badmintonEntries.length === 0 && <Typography>No badminton entries yet.</Typography>}
                {badmintonEntries.map((entry) => (
                  <Box key={entry.entryId} sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                    <Typography variant="subtitle1">
                      {entry.categoryName} · {entry.categoryType}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reg ID: {entry.registrationCode} · Partner: {entry.partnerName || 'N/A'}
                    </Typography>
                    <Typography variant="body2">Status: {entry.status}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </>
      )}
    </Stack>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <Typography color="error">Failed to load profile.</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Change Password" />
        <Tab label="Registrations" />
      </Tabs>

      {tab === 0 && renderProfileOverview()}
      {tab === 1 && renderChangePassword()}
      {tab === 2 && renderHistory()}
    </Container>
  );
};

export default Profile;

