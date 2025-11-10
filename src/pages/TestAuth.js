import { useState } from "react";
import { signInWithGoogle, signUpWithEmail, resetPassword } from "../firebase/authService";

const TestAuth = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("test@example.com");

  const testGoogle = async () => {
    console.log("🔵 Testing Google Sign-In...");
    setLoading(true);
    setResult("Testing Google Sign-In...");
    
    try {
      const res = await signInWithGoogle();
      console.log("✅ Google Result:", res);
      setResult(JSON.stringify(res, null, 2));
    } catch (error) {
      console.error("❌ Google Error:", error);
      setResult(JSON.stringify({ 
        error: error.message,
        code: error.code,
        details: "Check console for full error"
      }, null, 2));
    }
    
    setLoading(false);
  };

  const testPasswordReset = async () => {
    if (!testEmail) {
      alert("Please enter an email address");
      return;
    }

    console.log("🔵 Testing Password Reset for:", testEmail);
    setLoading(true);
    setResult("Sending password reset email...");
    
    try {
      const res = await resetPassword(testEmail);
      console.log("✅ Reset Result:", res);
      setResult(JSON.stringify(res, null, 2));
      
      if (res.success) {
        alert("✅ Password reset email sent! Check your inbox and spam folder.");
      }
    } catch (error) {
      console.error("❌ Reset Error:", error);
      setResult(JSON.stringify({ 
        error: error.message,
        code: error.code
      }, null, 2));
    }
    
    setLoading(false);
  };

  const testSignUp = async () => {
    const email = "testuser" + Date.now() + "@example.com";
    const password = "test123456";
    const name = "Test User";

    console.log("🔵 Testing Sign Up with:", email);
    setLoading(true);
    setResult("Creating test account...");
    
    try {
      const res = await signUpWithEmail(email, password, name);
      console.log("✅ SignUp Result:", res);
      setResult(JSON.stringify(res, null, 2));
      
      if (res.success) {
        alert("✅ Account created successfully!");
      }
    } catch (error) {
      console.error("❌ SignUp Error:", error);
      setResult(JSON.stringify({ 
        error: error.message,
        code: error.code
      }, null, 2));
    }
    
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h2>🔥 Firebase Authentication Test</h2>
      
      <div style={{ marginBottom: "30px", padding: "15px", backgroundColor: "#e3f2fd", borderRadius: "8px" }}>
        <h3 style={{ marginTop: 0 }}>📋 Before Testing:</h3>
        <ol>
          <li>Go to: <a href="https://console.firebase.google.com/project/shikshyasetu-dabe2/authentication/providers" target="_blank" rel="noopener noreferrer">Firebase Console</a></li>
          <li>Enable <strong>Email/Password</strong> provider</li>
          <li>Enable <strong>Google</strong> provider</li>
          <li>Open browser console (F12) to see detailed logs</li>
        </ol>
      </div>

      {/* Test 1: Email Sign Up */}
      <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h3>Test 1: Email/Password Sign Up</h3>
        <p>Creates a test account with random email</p>
        <button 
          onClick={testSignUp}
          disabled={loading}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            width: "100%"
          }}
        >
          {loading ? "Testing..." : "Test Email Sign Up"}
        </button>
      </div>

      {/* Test 2: Password Reset */}
      <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h3>Test 2: Password Reset Email</h3>
        <p>Sends password reset email to your address</p>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="Enter your email"
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            fontSize: "14px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            boxSizing: "border-box"
          }}
        />
        <button 
          onClick={testPasswordReset}
          disabled={loading}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            backgroundColor: "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            width: "100%"
          }}
        >
          {loading ? "Sending..." : "Test Password Reset"}
        </button>
      </div>

      {/* Test 3: Google Sign In */}
      <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h3>Test 3: Google Sign-In</h3>
        <p>Opens Google sign-in popup</p>
        <button 
          onClick={testGoogle}
          disabled={loading}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            backgroundColor: "#4285F4",
            color: "white",
            border: "none",
            borderRadius: "4px",
            width: "100%"
          }}
        >
          {loading ? "Testing..." : "Test Google Sign-In"}
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          border: "1px solid #ddd"
        }}>
          <strong>📊 Result:</strong>
          <pre style={{ margin: "10px 0 0 0", fontSize: "12px" }}>{result}</pre>
        </div>
      )}

      {/* Common Errors */}
      <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#fff3cd", borderRadius: "8px" }}>
        <h3>❌ Common Errors & Solutions:</h3>
        <ul style={{ fontSize: "14px" }}>
          <li><strong>auth/operation-not-allowed</strong> → Provider not enabled in Firebase Console</li>
          <li><strong>auth/popup-blocked</strong> → Allow popups in browser settings</li>
          <li><strong>auth/unauthorized-domain</strong> → Add localhost to authorized domains</li>
          <li><strong>No email received</strong> → Check spam folder, verify Email/Password is enabled</li>
        </ul>
      </div>
    </div>
  );
};

export default TestAuth;
