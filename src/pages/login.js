import React, { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse || !credentialResponse.credential) {
      alert("No credential returned from Google");
      return;
    }

    setLoading(true);
    try {
      const token = credentialResponse.credential;

      const res = await axios.post("http://localhost:5000/api/auth/google", {
        token,
      });

      if (res.data) {
        localStorage.setItem("user", JSON.stringify(res.data));
        alert(`Welcome, ${res.data.user?.name || "user"}!`);
      } else {
        alert("Unexpected response from server");
      }
    } catch (err) {
      console.error("Google login failed:", err?.response?.data || err.message || err);
      alert("Login failed. Check backend console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleFakeSubmit = (e) => {
    e.preventDefault();
    alert("This email/password form is just a placeholder — please use Google login.");
  };

  return (
    <>
      {/* Inline CSS styles */}
      <style>{`
        :root {
          --bg: #f4f7fb;
          --card: #ffffff;
          --muted: #6b7280;
          --accent: #2563eb;
          --shadow: rgba(16, 24, 40, 0.06);
        }

        * {
          box-sizing: border-box;
        }

        body, #root {
          height: 100%;
          margin: 0;
          font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          background: var(--bg);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
        }

        .login-card {
          width: 380px;
          background: var(--card);
          border-radius: 12px;
          padding: 28px;
          box-shadow: 0 8px 30px var(--shadow);
          text-align: center;
        }

        .login-avatar {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          object-fit: cover;
          margin: 0 auto 12px;
          display: block;
          background: #eef2ff;
          padding: 8px;
        }

        .login-title {
          margin: 0 0 18px;
          font-size: 20px;
          color: #111827;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 14px;
        }

        .login-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #e6e9ef;
          outline: none;
          font-size: 14px;
        }

        .login-input:focus {
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
          border-color: var(--accent);
        }

        .login-button {
          cursor: pointer;
          padding: 10px 12px;
          border-radius: 8px;
          border: none;
          background: var(--accent);
          color: #fff;
          font-weight: 600;
          font-size: 14px;
        }

        .divider {
          margin: 16px 0;
          color: var(--muted);
          font-size: 13px;
        }

        .google-wrapper {
          display: flex;
          justify-content: center;
        }

        .loading {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #e6e9ef;
          color: var(--muted);
          background: #fff;
        }

        .note {
          margin-top: 14px;
          font-size: 12px;
          color: var(--muted);
        }
      `}</style>

      <div className="login-container">
        <div className="login-card">
          <img
            src="/logo192.png"
            alt="logo"
            className="login-avatar"
            onError={(e) => (e.target.style.display = "none")}
          />

          <h2 className="login-title">Sign in to Shikshyasetu</h2>

          <form className="login-form" onSubmit={handleFakeSubmit}>
            <input className="login-input" type="email" placeholder="Email" />
            <input className="login-input" type="password" placeholder="Password" />
            <button className="login-button" type="submit">
              Sign in
            </button>
          </form>

          <div className="divider">Or</div>

          <div className="google-wrapper">
            {loading ? (
              <div className="loading">Signing in...</div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => alert("Google Sign-In error")}
              />
            )}
          </div>

          <p className="note">
            By signing in you accept the Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
