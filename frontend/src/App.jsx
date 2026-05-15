import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import AdminDashboard from './pages/AdminDashboard';
import Placeholder from './pages/Placeholder';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const ProtectedRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" />;
  };

  const AdminRoute = ({ children }) => {
    return user && (user.role === 'admin' || user.role === 'manager') ? children : <Navigate to="/login" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/contact" element={<Placeholder title="Contact" description="Contact our support team for restaurant and account questions." />} />
          <Route path="/cart" element={<Placeholder title="Shopping Cart" description="Review and manage your menu items in your cart." />} />
          <Route path="/demo" element={<Placeholder title="Demo" description="Explore the Foodey demo and review product highlights." />} />
          <Route path="/terms" element={<Placeholder title="Terms of Service" description="Review the terms of service for using Foodey." />} />
          <Route path="/privacy" element={<Placeholder title="Privacy Policy" description="Read how we protect your privacy and data." />} />
          <Route path="/forgot-password" element={<Placeholder title="Forgot Password" description="Use this page to recover your account." />} />
          <Route 
            path="/admin/*" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route path="/admin/menu" element={<AdminRoute><Placeholder title="Admin Menu Management" description="Create and manage menu items for your restaurant." /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><Placeholder title="Admin Orders" description="Review and manage your restaurant orders." /></AdminRoute>} />
          <Route path="/admin/staff" element={<AdminRoute><Placeholder title="Staff Management" description="Manage staff members and schedules." /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><Placeholder title="Admin Settings" description="Update restaurant and system settings." /></AdminRoute>} />
          <Route path="*" element={<Placeholder title="Page Not Found" description="The page you are looking for does not exist." />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
