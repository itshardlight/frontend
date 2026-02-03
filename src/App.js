import { Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { 
  Login, 
  Register, 
  VerifyOTP, 
  ForgotPassword, 
  ResetPassword 
} from "./pages/auth";
import { 
  AdminPanel, 
  AdminStudentProfile, 
  StudentRegistration 
} from "./pages/admin";
import { 
  StudentResults, 
  StudentAttendance, 
  StudentFees, 
  StudentAchievements, 
  StudentProfile 
} from "./pages/student";
import { 
  Attendance, 
  ResultsPage 
} from "./pages/teacher";
import { 
  FeeDepartmentDashboard, 
  FeePage 
} from "./pages/fee-department";
import {
  PaymentSuccess,
  PaymentFailure
} from "./pages/payment";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

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
        
        {/* Student Routes */}
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/results" element={<StudentResults />} />
        <Route path="/student/attendance" element={<StudentAttendance />} />
        <Route path="/student/fees" element={<StudentFees />} />
        <Route path="/student/achievements" element={<StudentAchievements />} />
        
        {/* Admin Routes */}
        <Route path="/admin/panel" element={<AdminPanel />} />
        <Route path="/admin/student-profile/:id" element={<AdminStudentProfile />} />
        <Route path="/admin/student-registration" element={<StudentRegistration />} />
        
        {/* Teacher Routes */}
        <Route path="/teacher/attendance" element={<Attendance />} />
        <Route path="/teacher/results" element={<ResultsPage />} />
        
        {/* Fee Department Routes */}
        <Route path="/fee-department/dashboard" element={<FeeDepartmentDashboard />} />
        <Route path="/fee-department/fees" element={<FeePage />} />
        
        {/* Payment Routes */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failure" element={<PaymentFailure />} />
        
        {/* Legacy Routes for Backward Compatibility */}
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/student-profile/:id" element={<AdminStudentProfile />} />
        <Route path="/student-results" element={<StudentResults />} />
        <Route path="/student-attendance" element={<StudentAttendance />} />
        <Route path="/student-fees" element={<StudentFees />} />
        <Route path="/student-achievements" element={<StudentAchievements />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/student-registration" element={<StudentRegistration />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/fees" element={<FeePage />} />
        <Route path="/fee-department" element={<FeeDepartmentDashboard />} />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;
