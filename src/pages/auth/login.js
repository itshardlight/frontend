import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", formData);

      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userRole", response.data.user.role);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/google-login", {
        credential: credentialResponse.credential
      });

      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userRole", response.data.user.role);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Google login failed");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "420px" }}>
        <div className="text-center mb-4">
          <h3>Student Management System</h3>
          <p className="text-muted">Sign in to continue</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Username or Email</label>
            <input
              type="text"
              name="username"
              className="form-control"
              placeholder="Enter username or email"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="mb-3 text-end">
            <Link to="/forgot-password" className="text-decoration-none small">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center mb-3">
          <span className="text-muted">or</span>
        </div>

        <div className="d-flex justify-content-center mb-3">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login failed")}
            useOneTap
          />
        </div>

        <div className="text-center">
          <p className="text-muted small">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
