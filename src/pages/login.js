import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  // 🧠 Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🧠 Email-password login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);

      if (res.data) {
        localStorage.setItem("user", JSON.stringify(res.data));
        alert(`Welcome, ${res.data.user?.name || "User"}!`);
        navigate("/dashboard");
      } else {
        alert("Unexpected response from server");
      }
    } catch (err) {
      console.error("Login failed:", err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Google login
  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      alert("No credential returned from Google");
      return;
    }

    setLoading(true);
    try {
      const token = credentialResponse.credential;
      const res = await axios.post("http://localhost:5000/api/auth/google", { token });

      if (res.data) {
        localStorage.setItem("user", JSON.stringify(res.data));
        alert(`Welcome, ${res.data.user?.name || "User"}!`);
        navigate("/dashboard");
      } else {
        alert("Unexpected response from server");
      }
    } catch (err) {
      console.error("Google login failed:", err?.response?.data || err.message);
      alert("Google login failed. Check backend console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <div className="text-center mb-3">
          <img
            src="/logo192.png"
            alt="logo"
            className="rounded-circle bg-primary bg-opacity-10 p-2"
            width="80"
            height="80"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>

        <h3 className="text-center mb-4">Sign in to Shikshyasetu</h3>

        {/* Email / Password form */}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="d-flex align-items-center my-3">
          <hr className="flex-grow-1" />
          <span className="mx-2 text-muted small">or continue with</span>
          <hr className="flex-grow-1" />
        </div>

        {/* Google Login */}
        <div className="text-center">
          {loading ? (
            <button className="btn btn-outline-secondary w-100" disabled>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Signing in...
            </button>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => alert("Google Sign-In error")}
            />
          )}
        </div>

        <p className="text-center text-muted small mt-4">
          By signing in, you agree to our{" "}
          <a href="#" className="text-decoration-none">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-decoration-none">
            Privacy Policy
          </a>.
        </p>
      </div>
    </div>
  );
};

export default Login;
