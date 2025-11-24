import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { 
  Home, 
  Login, 
  Register, 
  Dashboard,
  CricketRegistration,
  PrivateRoute,
  ForgotPassword,
  ResetPassword
} from './components';
import PageLayout from './components/PageLayout';

function App() {
  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/cricket-registration/:eventId"
          element={
            <PrivateRoute>
              <CricketRegistration />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </PageLayout>
  );
}

export default App;