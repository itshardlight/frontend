import React from 'react';
import { Routes, Route, Link } from 'react-router-dom'; // 👈 Import Routes, Route, and Link
import LoginPage from './pages/LoginPage'; // 👈 Your new component
// import HomePage from './pages/HomePage'; // (You will add this later)

function App() {
  return (
    <div className="App">
      <nav>
        {/* Navigation links to easily access pages */}
        <Link to="/">Home</Link> | 
        <Link to="/login">Login</Link> |
        <Link to="/register">Register</Link> 
      </nav>

      {/* Routes component defines the path-to-component mapping */}
      <Routes>
        {/* Route for the Home Page */}
        <Route path="/" element={<h1>Welcome to the MERN App!</h1>} /> 

        {/* This is the key part: it renders LoginPage when the URL is /login */}
        <Route path="/login" element={<LoginPage />} /> 

        {/* You will add other routes here later */}
        <Route path="/register" element={<h2>Register Page Coming Soon!</h2>} /> 
      </Routes>
    </div>
  );
}

export default App;