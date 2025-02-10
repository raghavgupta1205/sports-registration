import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { 
  Home, 
  Login, 
  Register, 
  Dashboard, 
  PrivateRoute 
} from './components';
import PageLayout from './components/PageLayout';

function App() {
  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </PageLayout>
  );
}

export default App;