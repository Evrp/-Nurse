import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('nurse'); // Default role
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, {
                name,
                email,
                password,
                role,
            });
            setMessage(res.data.message);
            navigate('/login'); // Redirect to login after successful registration
        } catch (err) {
            setMessage(err.response.data.message || 'Error registering user');
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Register</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Role:</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={styles.select}
                    >
                        <option value="nurse">Nurse</option>
                        <option value="head_nurse">Head Nurse</option>
                    </select>
                </div>
                <button type="submit" style={styles.button}>Register</button>
            </form>
            {message && <p style={styles.message}>{message}</p>}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        fontFamily: 'Arial, sans-serif',
    },
    heading: {
        color: '#333',
        marginBottom: '20px',
    },
    form: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
    },
    formGroup: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        color: '#555',
        fontWeight: 'bold',
    },
    input: {
        width: 'calc(100% - 20px)',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px',
    },
    select: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px',
        backgroundColor: '#fff',
    },
    button: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '18px',
        cursor: 'pointer',
        marginTop: '20px',
    },
    message: {
        marginTop: '20px',
        padding: '10px',
        borderRadius: '4px',
        backgroundColor: '#ffe0b2',
        color: '#e65100',
        textAlign: 'center',
        width: '100%',
        maxWidth: '400px',
    },
};

export default Register;