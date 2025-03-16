import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');

  const API_BASE_URL = 'http://localhost:5195';

  const handleRegister = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      if (!res.ok) {
        console.error('Register failed:', res.statusText);
        return;
      }
      // Başarılı kayıt
      alert('Registration successful. You can now log in.');
      navigate('/'); // Login sayfasına yönlendir
    } catch (err) {
      console.error('Register exception:', err);
    }
  };

  return (
    <div style={{ margin: '2rem' }}>
      <h2>Register</h2>
      <div>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={handleRegister}>Register</button>

      <p>Already have an account? <a href="/">Login</a></p>
    </div>
  );
};

export default RegisterPage;
