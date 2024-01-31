import React, { useState } from 'react';

export function SignUp () {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSignUp = () => {
    // Add your authentication logic here
    // For simplicity, we'll just set loggedIn to true if username and password are not empty
    if (username && password) {
      setLoggedIn(true);
      alert('Login successful!');
    } else {
      alert('Username and password are required.');
    }
  };

  return (
    <div>
      <h2>Sign Up Page</h2>
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
          <button onClick={handleSignUp}>Login</button>
        </div>
      )}
    </div>
  );
};
