import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Image as ImageIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { adminApi } from '../api/axios';

const statusColors = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  FAILED: 'error',
  CANCELLED: 'default'
};

const getFileUrl = (path = '') => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  return `/uploads/${path}`;
};

const isImage = (path = '') => /\.(png|jpe?g|gif|webp)$/i.test(path);

const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null, loading: false });
  const [docDialog, setDocDialog] = useState({ open: false, label: '', url: '' });
  const [actionLoading, setActionLoading] = useState(null);
  const [eventFilter, setEventFilter] = useState('ALL');
  const [showRejectedOnly, setShowRejectedOnly] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, [eventFilter, showRejectedOnly]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { includeFailed: false };
      params.status = showRejectedOnly ? 'REJECTED' : 'APPROVED';
      if (eventFilter !== 'ALL') {
        params.eventType = eventFilter;
      }
      const response = await adminApi.getRegistrations(params);
      setRegistrations(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocs = (label, path) => {
    if (!path) return;
    setDocDialog({
      open: true,
      label,
      url: getFileUrl(path)
    });
  };

  const closeDocDialog = () => setDocDialog({ open: false, label: '', url: '' });

  const openDetailDialog = async (registrationId) => {
    try {
      setDetailDialog({ open: true, data: null, loading: true });
      const response = await adminApi.getRegistrationDetail(registrationId);
      setDetailDialog({
        open: true,
        data: response.data.data,
        loading: false
      });
    } catch (err) {
      setDetailDialog({ open: false, data: null, loading: false });
      setError(err.response?.data?.message || 'Failed to load registration details');
    }
  };

  const closeDetailDialog = () => setDetailDialog({ open: false, data: null, loading: false });

  const handleStatusUpdate = async (registrationId, status) => {
    try {
      setActionLoading(registrationId + status);
      await adminApi.updateRegistrationStatus(registrationId, status);
      await fetchRegistrations();
      if (detailDialog.data?.registrationId === registrationId) {
        setDetailDialog((prev) => ({
          ...prev,
          data: prev.data ? { ...prev.data, registrationStatus: status } : prev.data
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const detailAvailability = useMemo(() => {
    if (!detailDialog.data) return null;
    if (detailDialog.data.availableAllDays) {
      return 'Available for all tournament days';
    }
    if (detailDialog.data.unavailableDates?.length) {
      return detailDialog.data.unavailableDates
        .map((date) => new Date(date).toLocaleDateString('en-IN'))
        .join(', ');
    }
    return 'Not provided';
  }, [detailDialog.data]);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={2} mb={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4" fontWeight={600}>
            Admin · Event Registrations
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchRegistrations}
            disabled={loading}
          >
            Refresh
          </Button>
        </Stack>
        <Tabs
          value={eventFilter}
          onChange={(_, value) => setEventFilter(value)}
          aria-label="Event filter tabs"
        >
          <Tab label="All" value="ALL" />
          <Tab label="Cricket" value="CRICKET" />
          <Tab label="Badminton" value="BADMINTON" />
        </Tabs>
        <FormControlLabel
          control={
            <Switch
              checked={showRejectedOnly}
              onChange={(e) => setShowRejectedOnly(e.target.checked)}
              color="error"
            />
          }
          label="Show only rejected registrations"
        />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={6}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                <TableCell>Event</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registrations.map((reg) => (
                <TableRow key={reg.registrationId} hover>
                  <TableCell>
                    <Typography variant="subtitle2">{reg.fullName || '—'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {reg.phoneNumber || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{reg.eventName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {reg.eventType || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>{reg.registrationCategory || '—'}</TableCell>
                  <TableCell>{formatDateTime(reg.createdAt)}</TableCell>
                  <TableCell>
                    <Chip
                      label={reg.registrationStatus}
                      color={statusColors[reg.registrationStatus] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="View Aadhaar Front">
                        <span>
                          <IconButton
                            size="small"
                            disabled={!reg.aadhaarFrontPhoto}
                            onClick={() => handleViewDocs('Aadhaar Front', reg.aadhaarFrontPhoto)}
                          >
                            <ImageIcon fontSize="inherit" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="View Aadhaar Back">
                        <span>
                          <IconButton
                            size="small"
                            disabled={!reg.aadhaarBackPhoto}
                            onClick={() => handleViewDocs('Aadhaar Back', reg.aadhaarBackPhoto)}
                          >
                            <ImageIcon fontSize="inherit" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="View Player Photo">
                        <span>
                          <IconButton
                            size="small"
                            disabled={!reg.playerPhoto}
                            onClick={() => handleViewDocs('Player Photo', reg.playerPhoto)}
                          >
                            <VisibilityIcon fontSize="inherit" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => openDetailDialog(reg.registrationId)}>
                          <InfoIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Approve">
                        <span>
                          <IconButton
                            size="small"
                            color="success"
                            disabled={reg.registrationStatus === 'APPROVED' || actionLoading !== null}
                            onClick={() => handleStatusUpdate(reg.registrationId, 'APPROVED')}
                          >
                            {actionLoading === reg.registrationId + 'APPROVED' ? (
                              <CircularProgress size={16} />
                            ) : (
                              <CheckCircleIcon fontSize="inherit" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={reg.registrationStatus === 'REJECTED' || actionLoading !== null}
                            onClick={() => handleStatusUpdate(reg.registrationId, 'REJECTED')}
                          >
                            {actionLoading === reg.registrationId + 'REJECTED' ? (
                              <CircularProgress size={16} />
                            ) : (
                              <CancelIcon fontSize="inherit" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={docDialog.open} onClose={closeDocDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{docDialog.label}</DialogTitle>
        <DialogContent dividers>
          {docDialog.url ? (
            isImage(docDialog.url) ? (
              <Box
                component="img"
                src={docDialog.url}
                alt={docDialog.label}
                sx={{ width: '100%', borderRadius: 2 }}
              />
            ) : (
              <Button
                variant="contained"
                href={docDialog.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Document
              </Button>
            )
          ) : (
            <Typography variant="body2">File not available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDocDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detailDialog.open}
        onClose={closeDetailDialog}
        maxWidth="md"
        fullWidth
        scroll="body"
      >
        <DialogTitle>Registration Details</DialogTitle>
        <DialogContent dividers>
          {detailDialog.loading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress />
            </Box>
          ) : detailDialog.data ? (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" mt={1}>
                  <Chip
                    label={detailDialog.data.registrationStatus}
                    color={
                      statusColors[detailDialog.data.registrationStatus] || 'default'
                    }
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      disabled={detailDialog.data.registrationStatus === 'APPROVED'}
                      onClick={() =>
                        handleStatusUpdate(detailDialog.data.registrationId, 'APPROVED')
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      disabled={detailDialog.data.registrationStatus === 'REJECTED'}
                      onClick={() =>
                        handleStatusUpdate(detailDialog.data.registrationId, 'REJECTED')
                      }
                    >
                      Reject
                    </Button>
                  </Stack>
                </Stack>
              </Box>

              <Divider />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Player Snapshot
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {detailDialog.data.fullName || '—'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Father&apos;s Name:</strong>{' '}
                      {detailDialog.data.fathersName || '—'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Date of Birth:</strong>{' '}
                      {detailDialog.data.dateOfBirth
                        ? new Date(detailDialog.data.dateOfBirth).toLocaleDateString('en-IN')
                        : '—'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Gender:</strong> {detailDialog.data.gender || '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {detailDialog.data.phoneNumber || '—'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>WhatsApp:</strong> {detailDialog.data.whatsappNumber || '—'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Aadhaar:</strong> {detailDialog.data.aadhaarNumber || '—'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Preferred Jersey Size:</strong>{' '}
                      {detailDialog.data.preferredTshirtSize || '—'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Event & Registration
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Event:</strong> {detailDialog.data.eventName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Event Type:</strong> {detailDialog.data.eventType}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Dates:</strong>{' '}
                      {detailDialog.data.eventStartDate
                        ? `${new Date(detailDialog.data.eventStartDate).toLocaleDateString(
                            'en-IN'
                          )} - ${new Date(detailDialog.data.eventEndDate).toLocaleDateString('en-IN')}`
                        : '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Category:</strong> {detailDialog.data.registrationCategory || '—'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Team Role:</strong> {detailDialog.data.teamRole || '—'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Jersey Name & Number:</strong>{' '}
                      {detailDialog.data.tshirtName || '—'} · #
                      {detailDialog.data.jerseyNumber || '—'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Availability:</strong> {detailAvailability}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {detailDialog.data.playerProfileId && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Player Profile
                    </Typography>
                    <Typography variant="body2">
                      <strong>Skill Level:</strong> {detailDialog.data.skillLevel || '—'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Experience:</strong>{' '}
                      {detailDialog.data.yearsOfExperience != null
                        ? `${detailDialog.data.yearsOfExperience} yrs`
                        : '—'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Sports History:</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {detailDialog.data.sportsHistory || 'Not provided'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Achievements:</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {detailDialog.data.achievements || 'Not provided'}
                    </Typography>
                  </Box>
                </>
              )}

              {detailDialog.data.cricketSkillsId && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Cricket Skills
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2">
                          <strong>Primary Role:</strong> {detailDialog.data.primaryRole || '—'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Wicket Keeper:</strong>{' '}
                          {detailDialog.data.wicketKeeper ? 'Yes' : 'No'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>All-Rounder:</strong>{' '}
                          {detailDialog.data.allRounder ? 'Yes' : 'No'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Captaincy:</strong>{' '}
                          {detailDialog.data.hasCaptainExperience ? 'Has experience' : 'No'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2">
                          <strong>Batting Style:</strong>{' '}
                          {detailDialog.data.battingStyle || '—'} (
                          {detailDialog.data.battingHand || '—'})
                        </Typography>
                        <Typography variant="body2">
                          <strong>Bowling Style:</strong>{' '}
                          {detailDialog.data.bowlingStyle || '—'} ·{' '}
                          {detailDialog.data.bowlingType || '—'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Fielding Preference:</strong>{' '}
                          {detailDialog.data.preferredFieldingPosition || '—'}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      <strong>CricHeroes Stats:</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Matches: {detailDialog.data.cricHeroesMatchesPlayed ?? '—'} · Runs:{' '}
                      {detailDialog.data.cricHeroesTotalRuns ?? '—'} · Strike Rate:{' '}
                      {detailDialog.data.cricHeroesStrikeRate ?? '—'} · Wickets:{' '}
                      {detailDialog.data.cricHeroesTotalWickets ?? '—'} · Economy:{' '}
                      {detailDialog.data.cricHeroesBowlingEconomy ?? '—'}
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          ) : (
            <Typography variant="body2">Select a registration to view details.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetailDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminRegistrations;

