import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

axios.defaults.withCredentials = true; // Configure axios to send cookies

function Login({ setAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
        email,
        password,
      });
      console.log('Login successful:', response.data);
      const { role } = response.data;
      console.log('Role:', role);


      if (!role) {
        setError('Login failed: Missing role from server.');
        console.error('Login failed: Missing role from server.', response.data);
        return;
      }

      localStorage.setItem('role', role); // Keep role in localStorage for now
      setAuth({ role });

      if (role === 'nurse') {
        navigate('/nurse-dashboard');
      } else if (role === 'head_nurse') {
        navigate('/head-nurse-dashboard');
      } else {
        setError('Login failed: Unknown user role.');
        console.error('Login failed: Unknown user role.', role);
      }
    } catch (err) {
      console.error('Login failed:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
