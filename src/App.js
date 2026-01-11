import { Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Login from "./pages/login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import StudentProfile from "./pages/StudentProfile";
import AdminPanel from "./pages/AdminPanel";
import AdminStudentProfile from "./pages/AdminStudentProfile";
import Attendance from "./pages/Attendance";
import StudentRegistration from "./pages/StudentRegistration";
import ResultsPage from "./pages/ResultsPage";
import FeePage from "./pages/FeePage";

const GOOGLE_CLIENT_ID = "778363983589-j716s0a5ddtapkpbqu758t00elk6hd3g.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/student-profile/:id" element={<AdminStudentProfile />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/student-registration" element={<StudentRegistration />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/fees" element={<FeePage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;
