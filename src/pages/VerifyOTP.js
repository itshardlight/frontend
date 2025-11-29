import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;
  const email = location.state?.email;

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    }
  }, [userId, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        userId,
        otp
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/resend-otp", {
        userId
      });

      if (response.data.success) {
        setSuccess("OTP resent successfully! Check your email.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "420px" }}>
        <div className="text-center mb-4">
          <h3>Verify Your Email</h3>
          <p className="text-muted">
            {email ? `We sent a code to ${email}` : "Enter the OTP sent to your email"}
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleVerify}>
          <div className="mb-3">
            <label className="form-label">Enter OTP</label>
            <input
              type="text"
              className="form-control text-center"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              disabled={loading}
              style={{ fontSize: "24px", letterSpacing: "10px" }}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="text-center">
          <p className="text-muted small">
            Didn't receive the code?{" "}
            <button
              className="btn btn-link p-0 text-decoration-none"
              onClick={handleResendOTP}
              disabled={resending}
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          </p>
          <button
            className="btn btn-link text-decoration-none small"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
