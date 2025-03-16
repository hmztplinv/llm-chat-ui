import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const API_BASE_URL = 'http://localhost:5195';

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        console.error('Login failed:', res.statusText);
        return;
      }
      // Yanıt: { token: "...jwt..." }
      const data = await res.json();
      const token = data.token;
      if (token) {
        // Token'ı localStorage'a kaydet
        localStorage.setItem('access_token', token);

        // Chat sayfasına git
        navigate('/chat');
      } else {
        console.error('No token in response');
      }
    } catch (err) {
      console.error('Login exception:', err);
    }
  };

  return (
    <div style={{ margin: '2rem' }}>
      <h2>Login</h2>
      <div>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
      <button onClick={handleLogin}>Login</button>

      <p>Don't have an account? <a href="/register">Register</a></p>
    </div>
  );
};

export default LoginPage;
