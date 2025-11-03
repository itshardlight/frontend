import React, { useState } from 'react';
import axios from 'axios';

// **IMPORTANT**: Replace with your actual backend URL/port (e.g., 5000)
const API_URL = 'http://localhost:5000/api/users/login'; 

function LoginPage() {
  // 1. State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // 2. Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form submission

    try {
      // 3. Make a POST request to the backend login route
      const response = await axios.post(API_URL, { email, password });

      // 4. Handle success (e.g., save the user token and redirect)
      const token = response.data.token;
      
      // Save token (e.g., in localStorage) for future requests
      localStorage.setItem('authToken', token); 
      
      setMessage('Login Successful! Redirecting...');
      
      // *** In a real app, you would use React Router to navigate here ***
      // Example: history.push('/dashboard'); 

    } catch (error) {
      // 5. Handle errors (e.g., 401 Unauthorized, Network error)
      const errorMsg = error.response 
        ? error.response.data.message // Message from the Express backend
        : 'Network error or server is down.';
        
      setMessage(`Login Failed: ${errorMsg}`);
      console.error('Login Error:', error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Log In</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default LoginPage;