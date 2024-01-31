import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export function Login () {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    // Add your authentication logic here
    // For simplicity, we'll just set loggedIn to true if username and password are not empty
    if (username && password) {
      setLoggedIn(true);
      alert('Login successful!');
      localStorage.setItem('user_id', username);
    } else {
      alert('Username and password are required.');
    }
  };

  return (
    <div>
      <h2>Login Page</h2>
      {loggedIn ? (
        <div>
          <p>Welcome, {username}!</p>
          <button onClick={() => setLoggedIn(false)}>Logout</button>
        </div>
      ) : (
        <div>
          <label>
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <br />
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <br />
          <button onClick={handleLogin}>Login</button>
          <Link to="/signup">Don't have an account? Register</Link>
        </div>
      )}
    </div>
  );
};
