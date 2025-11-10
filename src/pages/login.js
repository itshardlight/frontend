import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmail, signInWithGoogle, signUpWithEmail, resetPassword } from "../firebase/authService";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login"); // "login", "signup", "forgot"
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const result = await signInWithEmail(form.email, form.password);
    setLoading(false);

    if (result.success) {
      localStorage.setItem("user", JSON.stringify(result));
      alert(`Welcome back, ${result.user.name}!`);
      navigate("/dashboard");
    } else {
      alert(result.error);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password || !form.name) {
      alert("Please fill in all fields.");
      return;
    }

    if (form.password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    const result = await signUpWithEmail(form.email, form.password, form.name);
    setLoading(false);

    if (result.success) {
      localStorage.setItem("user", JSON.stringify(result));
      alert(`Account created successfully! Welcome, ${result.user.name}!`);
      navigate("/dashboard");
    } else {
      alert(result.error);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!form.email) {
      alert("Please enter your email address.");
      return;
    }

    setLoading(true);
    const result = await resetPassword(form.email);
    setLoading(false);

    if (result.success) {
      alert("Password reset email sent! Check your inbox.");
      setMode("login");
      setForm({ email: "", password: "", name: "" });
    } else {
      alert(result.error);
    }
  };

  // Handle Google Sign In
  const handleGoogleLogin = async () => {
    setLoading(true);
    const result = await signInWithGoogle();
    setLoading(false);

    if (result.success) {
      localStorage.setItem("user", JSON.stringify(result));
      alert(`Welcome, ${result.user.name}!`);
      navigate("/dashboard");
    } else {
      alert(result.error);
    }
  };

  // Switch between modes
  const switchMode = (newMode) => {
    setMode(newMode);
    setForm({ email: "", password: "", name: "" });
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "420px" }}>
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

        <h3 className="text-center mb-4">
          {mode === "login" && "Sign in to Shikshyasetu"}
          {mode === "signup" && "Create Account"}
          {mode === "forgot" && "Reset Password"}
        </h3>

        {/* Login Form */}
        {mode === "login" && (
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

            <div className="mb-3 text-end">
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-decoration-none"
                onClick={() => switchMode("forgot")}
              >
                Forgot Password?
              </button>
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
        )}

        {/* Sign Up Form */}
        {mode === "signup" && (
          <form onSubmit={handleSignUp}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your full name"
                required
              />
            </div>

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
                placeholder="At least 6 characters"
                required
                minLength="6"
              />
              <small className="text-muted">Must be at least 6 characters</small>
            </div>

            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        )}

        {/* Forgot Password Form */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword}>
            <p className="text-muted small mb-3">
              Enter your email address and we'll send you a link to reset your password.
            </p>

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

            <button
              type="submit"
              className="btn btn-warning w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        {mode !== "forgot" && (
          <>
            <div className="d-flex align-items-center my-3">
              <hr className="flex-grow-1" />
              <span className="mx-2 text-muted small">or continue with</span>
              <hr className="flex-grow-1" />
            </div>

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center"
              disabled={loading}
            >
              <svg className="me-2" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              {loading ? "Signing in..." : "Sign in with Google"}
            </button>
          </>
        )}

        {/* Mode Switcher */}
        <div className="text-center mt-4">
          {mode === "login" && (
            <p className="text-muted small mb-0">
              Don't have an account?{" "}
              <button
                className="btn btn-link btn-sm p-0 text-decoration-none"
                onClick={() => switchMode("signup")}
              >
                Sign up
              </button>
            </p>
          )}
          {mode === "signup" && (
            <p className="text-muted small mb-0">
              Already have an account?{" "}
              <button
                className="btn btn-link btn-sm p-0 text-decoration-none"
                onClick={() => switchMode("login")}
              >
                Sign in
              </button>
            </p>
          )}
          {mode === "forgot" && (
            <p className="text-muted small mb-0">
              Remember your password?{" "}
              <button
                className="btn btn-link btn-sm p-0 text-decoration-none"
                onClick={() => switchMode("login")}
              >
                Sign in
              </button>
            </p>
          )}
        </div>

        <p className="text-center text-muted small mt-3 mb-0">
          By continuing, you agree to our{" "}
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
