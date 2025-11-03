import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Login from "./pages/login"; // adjust path if different

function App() {
  return (
    <GoogleOAuthProvider clientId="838743403493-o2t5ivtistueoga8oi8i5t6brn070ipi.apps.googleusercontent.com">
      <Login />
    </GoogleOAuthProvider>
  );
}

export default App;
