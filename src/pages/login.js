import React from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const handleGoogleLogin = async (credentialResponse) => {
    const token = credentialResponse.credential;

    try {
      const res = await axios.post("http://localhost:5000/api/auth/google", { token });
      console.log("Backend response:", res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      alert(`Welcome ${res.data.user.name}`);
    } catch (error) {
      console.error("Google Login failed:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Login</h2>
      
      {/* Google Login Button */}
      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => console.log("Login Failed")}
      />
    </div>
  );
};

export default Login;
