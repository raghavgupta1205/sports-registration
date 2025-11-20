import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Download as DownloadIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { registration, payment } from '../services/api';
import api from '../api/axios';

function TabPanel({ children, value, index }) {
  return value === index && children;
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [registrations, setRegistrations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [regResponse, payResponse] = await Promise.all([
        registration.getAll(),
        payment.getHistory()
      ]);
      setRegistrations(regResponse.data.data);
      setPayments(payResponse.data.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/api/admin/registrations/export', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'registrations.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export registrations');
    }
  };

  const handleStatusChange = async (registrationId, newStatus) => {
    try {
      await registration.updateStatus(registrationId, newStatus);
      loadData(); // Reload data after status update
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = 
      reg.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.user.phoneNumber.includes(searchTerm) ||
      reg.registrationNumber.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'ALL' || reg.registrationStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Registrations" />
            <Tab label="Payments" />
            <Tab label="Statistics" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  label="Search"
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ flexGrow: 1 }}
                  InputProps={{
                    endAdornment: <SearchIcon />
                  }}
                />
                <TextField
                  select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  size="small"
                  sx={{ width: 150 }}
                >
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </TextField>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportExcel}
                >
                  Export Excel
                </Button>
                <IconButton onClick={loadData}>
                  <RefreshIcon />
                </IconButton>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Registration #</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Block</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Payment</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRegistrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>{reg.registrationNumber}</TableCell>
                        <TableCell>{reg.user.fullName}</TableCell>
                        <TableCell>
                          {reg.user.email}<br />
                          {reg.user.phoneNumber}
                        </TableCell>
                        <TableCell>{reg.user.block}</TableCell>
                        <TableCell>
                          <Chip
                            label={reg.registrationStatus}
                            color={getStatusColor(reg.registrationStatus)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={reg.paymentStatus}
                            color={reg.paymentStatus === 'SUCCESS' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            value={reg.registrationStatus}
                            onChange={(e) => handleStatusChange(reg.id, e.target.value)}
                          >
                            <MenuItem value="PENDING">Pending</MenuItem>
                            <MenuItem value="CONFIRMED">Confirm</MenuItem>
                            <MenuItem value="REJECTED">Reject</MenuItem>
                          </TextField>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Transactions
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Registration #</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Transaction ID</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.map((pay) => (
                      <TableRow key={pay.id}>
                        <TableCell>{new Date(pay.paymentDate).toLocaleString()}</TableCell>
                        <TableCell>{pay.registration.registrationNumber}</TableCell>
                        <TableCell>{pay.registration.user.fullName}</TableCell>
                        <TableCell>₹{pay.amount}</TableCell>
                        <TableCell>{pay.razorpayPaymentId}</TableCell>
                        <TableCell>
                          <Chip
                            label={pay.paymentStatus}
                            color={pay.paymentStatus === 'SUCCESS' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => payment.downloadReceipt(pay.id)}
                          >
                            Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Registrations
                  </Typography>
                  <Typography variant="h3">
                    {registrations.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Confirmed Registrations
                  </Typography>
                  <Typography variant="h3">
                    {registrations.filter(r => r.registrationStatus === 'CONFIRMED').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h3">
                    ₹{payments.reduce((sum, p) => sum + (p.paymentStatus === 'SUCCESS' ? p.amount : 0), 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Container>
  );
}

export default AdminDashboard; 