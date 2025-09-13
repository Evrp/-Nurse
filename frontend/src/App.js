import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios'; // Import axios
import Login from './components/Login';
import Register from './components/Register';
import NurseDashboard from './components/NurseDashboard';
import HeadNurseDashboard from './components/HeadNurseDashboard';
import './App.css';

axios.defaults.withCredentials = true; // Configure axios to send cookies globally

// Create an Auth Context
const AuthContext = createContext(null);

// Custom hook to use auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const role = localStorage.getItem('role');
    return { role };
  });

  useEffect(() => {
    if (auth.role) {
      localStorage.setItem('role', auth.role);
    } else {
      localStorage.removeItem('role');
    }
  }, [auth]);

  const logout = () => {
    setAuth({ role: null });
    // Optionally, make an API call to clear the HTTP-only cookie on the backend
    // axios.post(`${process.env.REACT_APP_API_URL}/auth/logout`);
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { auth } = useAuth();

  // For now, we rely on the role in localStorage to determine if authenticated
  // A more robust solution would involve an API call to validate the session
  if (!auth.role) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { auth, setAuth, logout } = useAuth();

  return (
    <div className="App">
      <header className="App-header">
        <nav>
          {auth.role ? (
            <>
              <span>Welcome, {auth.role}!</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/">Login</Link>
              <Link to="/register" style={{ marginLeft: '10px' }}>Register</Link>
            </>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Login setAuth={setAuth} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/nurse-dashboard"
            element={
              <ProtectedRoute allowedRoles={['nurse']}>
                <NurseDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/head-nurse-dashboard"
            element={
              <ProtectedRoute allowedRoles={['head_nurse']}>
                <HeadNurseDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// Wrap App with AuthProvider
const AppWrapper = () => (
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);

export default AppWrapper;
