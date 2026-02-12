import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ResultsManagement } from "../components/teacher";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalFeeCollected: 0,
    pendingFees: 0,
    recentActivities: [],
    loading: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Fetch dashboard statistics
      fetchDashboardStats(parsedUser);
    }
  }, [navigate]);

  const fetchDashboardStats = async (currentUser) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setDashboardStats(prev => ({ ...prev, loading: true }));

      // Fetch different data based on user role
      if (currentUser.role === 'admin' || currentUser.role === 'teacher') {
        // Fetch comprehensive stats for admin/teacher
        const [studentsRes, feeRes] = await Promise.all([
          axios.get('http://localhost:5000/api/students', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          currentUser.role === 'admin' ? axios.get('http://localhost:5000/api/fees/analytics', {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: { data: {} } })) : Promise.resolve({ data: { data: {} } })
        ]);

        const students = studentsRes.data.data || [];
        const feeAnalytics = feeRes.data.data || {};

        setDashboardStats({
          totalStudents: students.length,
          totalTeachers: students.filter(s => s.role === 'teacher').length || 5, // Fallback
          totalFeeCollected: feeAnalytics.totalPaidAmount || 0,
          pendingFees: feeAnalytics.totalPendingAmount || 0,
          recentActivities: generateRecentActivities(students, feeAnalytics),
          loading: false
        });

      } else if (currentUser.role === 'student') {
        // Fetch student-specific data
        try {
          const profileRes = await axios.get('http://localhost:5000/api/profiles/me/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });

          const profile = profileRes.data.profile;
          setDashboardStats({
            totalStudents: 0, // Not relevant for students
            totalTeachers: 0,
            totalFeeCollected: profile?.feeInfo?.paidAmount || 0,
            pendingFees: profile?.feeInfo?.pendingAmount || 0,
            recentActivities: generateStudentActivities(profile),
            loading: false
          });
        } catch (error) {
          console.error('Error fetching student profile:', error);
          setDashboardStats(prev => ({ ...prev, loading: false }));
        }

      } else if (currentUser.role === 'fee_department') {
        // Fetch fee-specific data
        try {
          const feeRes = await axios.get('http://localhost:5000/api/fees/analytics', {
            headers: { Authorization: `Bearer ${token}` }
          });

          const feeAnalytics = feeRes.data.data || {};
          setDashboardStats({
            totalStudents: feeAnalytics.totalStudents || 0,
            totalTeachers: 0,
            totalFeeCollected: feeAnalytics.totalPaidAmount || 0,
            pendingFees: feeAnalytics.totalPendingAmount || 0,
            recentActivities: generateFeeActivities(feeAnalytics),
            loading: false
          });
        } catch (error) {
          console.error('Error fetching fee analytics:', error);
          setDashboardStats(prev => ({ ...prev, loading: false }));
        }

      } else {
        // Default for other roles
        setDashboardStats(prev => ({ ...prev, loading: false }));
      }

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setDashboardStats(prev => ({ ...prev, loading: false }));
    }
  };

  const generateRecentActivities = (students, feeAnalytics) => {
    const activities = [];
    
    if (students.length > 0) {
      activities.push({
        icon: 'bi-person-plus',
        text: `${students.length} students registered`,
        time: 'Today',
        type: 'success'
      });
    }

    if (feeAnalytics.fullyPaidStudents > 0) {
      activities.push({
        icon: 'bi-cash-stack',
        text: `${feeAnalytics.fullyPaidStudents} students completed fee payment`,
        time: 'This week',
        type: 'info'
      });
    }

    if (feeAnalytics.pendingStudents > 0) {
      activities.push({
        icon: 'bi-exclamation-triangle',
        text: `${feeAnalytics.pendingStudents} students have pending fees`,
        time: 'Current',
        type: 'warning'
      });
    }

    return activities.slice(0, 5); // Limit to 5 activities
  };

  const generateStudentActivities = (profile) => {
    const activities = [];
    
    if (profile?.feeInfo?.feeHistory?.length > 0) {
      const lastPayment = profile.feeInfo.feeHistory[profile.feeInfo.feeHistory.length - 1];
      activities.push({
        icon: 'bi-cash',
        text: `Payment of Rs.${lastPayment.amount.toLocaleString()} recorded`,
        time: new Date(lastPayment.paymentDate).toLocaleDateString(),
        type: 'success'
      });
    }

    if (profile?.achievements?.length > 0) {
      activities.push({
        icon: 'bi-trophy',
        text: `${profile.achievements.length} achievements recorded`,
        time: 'This semester',
        type: 'info'
      });
    }

    if (profile?.feeInfo?.pendingAmount > 0) {
      activities.push({
        icon: 'bi-exclamation-circle',
        text: `Rs.${profile.feeInfo.pendingAmount.toLocaleString()} fee pending`,
        time: 'Due soon',
        type: 'warning'
      });
    }

    return activities;
  };

  const generateFeeActivities = (feeAnalytics) => {
    const activities = [];
    
    activities.push({
      icon: 'bi-graph-up',
      text: `${feeAnalytics.collectionRate || 0}% collection rate achieved`,
      time: 'Current',
      type: 'success'
    });

    if (feeAnalytics.totalPaidAmount > 0) {
      activities.push({
        icon: 'bi-cash-stack',
        text: `Rs.${(feeAnalytics.totalPaidAmount || 0).toLocaleString()} collected this year`,
        time: 'Year to date',
        type: 'info'
      });
    }

    return activities;
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const navigateTo = (path) => {
    navigate(path);
    closeSidebar();
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin": return "badge-admin";
      case "teacher": return "badge-teacher";
      case "student": return "badge-student";
      case "fee_department": return "badge-fee-department";
      default: return "bg-secondary";
    }
  };

  // Student Dashboard Content
  const StudentDashboard = () => (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div className="stat-info">
            <h3>Rs.{dashboardStats.totalFeeCollected.toLocaleString()}</h3>
            <p>Fees Paid</p>
          </div>
        </div>
        <div className="stat-card stat-card-warning">
          <div className="stat-icon">
            <i className="bi bi-exclamation-circle"></i>
          </div>
          <div className="stat-info">
            <h3>Rs.{dashboardStats.pendingFees.toLocaleString()}</h3>
            <p>Pending Fees</p>
          </div>
        </div>
      </div>

      <div className="action-cards-grid">
        <div className="action-card" onClick={() => navigateTo("/student/profile")}>
          <div className="action-icon action-icon-primary">
            <i className="bi bi-person-badge"></i>
          </div>
          <h5>My Profile</h5>
          <p>View and edit personal details</p>
        </div>
        <div className="action-card" onClick={() => navigateTo("/student/attendance")}>
          <div className="action-icon action-icon-success">
            <i className="bi bi-calendar-check"></i>
          </div>
          <h5>Attendance</h5>
          <p>Check attendance record</p>
        </div>
        <div className="action-card" onClick={() => navigateTo("/student/results")}>
          <div className="action-icon action-icon-info">
            <i className="bi bi-graph-up"></i>
          </div>
          <h5>My Results</h5>
          <p>View exam results and grades</p>
        </div>
        <div className="action-card" onClick={() => navigateTo("/student/fees")}>
          <div className="action-icon action-icon-warning">
            <i className="bi bi-cash-stack"></i>
          </div>
          <h5>My Fees</h5>
          <p>View fee details and payment history</p>
        </div>
      </div>
    </div>
  );

  // Teacher/Admin Dashboard Content
  const TeacherDashboard = () => (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">
            <i className="bi bi-people"></i>
          </div>
          <div className="stat-info">
            <h3>{dashboardStats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-icon">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div className="stat-info">
            <h3>Rs.{dashboardStats.totalFeeCollected.toLocaleString()}</h3>
            <p>Fees Collected</p>
          </div>
        </div>
        <div className="stat-card stat-card-warning">
          <div className="stat-icon">
            <i className="bi bi-exclamation-triangle"></i>
          </div>
          <div className="stat-info">
            <h3>Rs.{dashboardStats.pendingFees.toLocaleString()}</h3>
            <p>Pending Fees</p>
          </div>
        </div>
      </div>

      <div className="action-cards-grid">
        <div className="action-card" onClick={() => navigateTo("/admin/student-registration")}>
          <div className="action-icon action-icon-primary">
            <i className="bi bi-people"></i>
          </div>
          <h5>My Students</h5>
          <p>Manage student records</p>
          <span className="badge bg-primary">{dashboardStats.totalStudents} Students</span>
        </div>
        <div className="action-card" onClick={() => navigateTo("/teacher/attendance")}>
          <div className="action-icon action-icon-success">
            <i className="bi bi-clipboard-check"></i>
          </div>
          <h5>Attendance</h5>
          <p>Mark student attendance</p>
          <span className="badge bg-success">Daily Tracking</span>
        </div>
        <div className="action-card" onClick={() => navigateTo("/teacher/results")}>
          <div className="action-icon action-icon-info">
            <i className="bi bi-journal-text"></i>
          </div>
          <h5>Results Management</h5>
          <p>Upload and manage exam results</p>
          <span className="badge bg-secondary">Exam Results</span>
        </div>
        {user.role === "admin" && (
          <div className="action-card" onClick={() => navigateTo("/fee-department/fees")}>
            <div className="action-icon action-icon-warning">
              <i className="bi bi-cash-stack"></i>
            </div>
            <h5>Fee Management</h5>
            <p>Manage student fees and payments</p>
            <span className="badge bg-success">Rs.{dashboardStats.totalFeeCollected.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );



  // Fee Department Dashboard Content
  const FeeDepartmentDashboard = () => (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="stat-card stat-card-success">
          <div className="stat-icon">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div className="stat-info">
            <h3>Rs.{dashboardStats.totalFeeCollected.toLocaleString()}</h3>
            <p>Total Collected</p>
          </div>
        </div>
        <div className="stat-card stat-card-warning">
          <div className="stat-icon">
            <i className="bi bi-exclamation-triangle"></i>
          </div>
          <div className="stat-info">
            <h3>Rs.{dashboardStats.pendingFees.toLocaleString()}</h3>
            <p>Pending Fees</p>
          </div>
        </div>
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">
            <i className="bi bi-people"></i>
          </div>
          <div className="stat-info">
            <h3>{dashboardStats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>
      </div>

      <div className="action-cards-grid">
        <div className="action-card" onClick={() => navigateTo("/fee-department/fees")}>
          <div className="action-icon action-icon-success">
            <i className="bi bi-cash-stack"></i>
          </div>
          <h5>Fee Management System</h5>
          <p>Complete fee management & payment processing</p>
        </div>
        <div className="action-card">
          <div className="action-icon action-icon-primary">
            <i className="bi bi-search"></i>
          </div>
          <h5>Student Fee Overview</h5>
          <p>Search by name/class/roll & view fee status</p>
        </div>
        <div className="action-card">
          <div className="action-icon action-icon-warning">
            <i className="bi bi-gear"></i>
          </div>
          <h5>Fee Structure</h5>
          <p>Set fee categories & manage discounts</p>
        </div>
        <div className="action-card">
          <div className="action-icon action-icon-info">
            <i className="bi bi-clipboard-data"></i>
          </div>
          <h5>Payment Tracking</h5>
          <p>Daily collection & pending fee reports</p>
        </div>
        <div className="action-card">
          <div className="action-icon action-icon-danger">
            <i className="bi bi-graph-up-arrow"></i>
          </div>
          <h5>Reports & Analytics</h5>
          <p>Monthly revenue & collection graphs</p>
        </div>
        <div className="action-card">
          <div className="action-icon action-icon-secondary">
            <i className="bi bi-bell"></i>
          </div>
          <h5>Notifications</h5>
          <p>Payment reminders & due alerts</p>
        </div>
      </div>
    </div>
  );

  if (!user) return null;

  // Sidebar Menu Items based on role
  const getSidebarMenuItems = () => {
    const commonItems = [
      { icon: 'bi-speedometer2', label: 'Dashboard', path: '/dashboard' },
      { icon: 'bi-person-circle', label: 'Profile', path: '/profile' }
    ];

    const roleSpecificItems = {
      student: [
        { icon: 'bi-person-badge', label: 'My Profile', path: '/student/profile' },
        { icon: 'bi-calendar-check', label: 'Attendance', path: '/student/attendance' },
        { icon: 'bi-graph-up', label: 'Results', path: '/student/results' },
        { icon: 'bi-cash-stack', label: 'Fees', path: '/student/fees' }
      ],
      teacher: [
        { icon: 'bi-people', label: 'Students', path: '/admin/student-registration' },
        { icon: 'bi-clipboard-check', label: 'Attendance', path: '/teacher/attendance' },
        { icon: 'bi-journal-text', label: 'Results', path: '/teacher/results' }
      ],
      admin: [
        { icon: 'bi-gear', label: 'Admin Panel', path: '/admin/panel' },
        { icon: 'bi-people', label: 'Students', path: '/admin/student-registration' },
        { icon: 'bi-clipboard-check', label: 'Attendance', path: '/teacher/attendance' },
        { icon: 'bi-journal-text', label: 'Results', path: '/teacher/results' },
        { icon: 'bi-cash-stack', label: 'Fee Management', path: '/fee-department/fees' }
      ],
      fee_department: [
        { icon: 'bi-cash-stack', label: 'Fee Management', path: '/fee-department/fees' },
        { icon: 'bi-graph-up-arrow', label: 'Reports', path: '/fee-department/fees' }
      ]
    };

    return [...commonItems, ...(roleSpecificItems[user.role] || [])];
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h4>Menu</h4>
          <button className="close-sidebar" onClick={closeSidebar}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <nav className="sidebar-nav">
          {getSidebarMenuItems().map((item, index) => (
            <button
              key={index}
              className="sidebar-item"
              onClick={() => navigateTo(item.path)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
          <button className="sidebar-item sidebar-logout" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <button className="hamburger-btn" onClick={toggleSidebar}>
              <i className="bi bi-list"></i>
            </button>
            <h1 className="header-title">Student Management System</h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{user.username}</span>
                <span className={`user-role badge ${getRoleBadgeClass(user.role)}`}>
                  {user.role.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="dashboard-body">
          <div className="welcome-section">
            <div className="welcome-text">
              <h2>Welcome back, {user.username}!</h2>
              <p>Here's what's happening with your account today.</p>
            </div>
            <button 
              className="refresh-btn"
              onClick={() => fetchDashboardStats(user)}
              disabled={dashboardStats.loading}
            >
              {dashboardStats.loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <i className="bi bi-arrow-clockwise me-2"></i>
              )}
              Refresh
            </button>
          </div>

          {/* Role-specific Dashboard */}
          {user.role === "student" && <StudentDashboard />}
          {(user.role === "teacher" || user.role === "admin") && <TeacherDashboard />}
          {user.role === "fee_department" && <FeeDepartmentDashboard />}
        </main>

        {/* Footer */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <p>&copy; 2024 Student Management System. All rights reserved.</p>
            <div className="footer-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#support">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
