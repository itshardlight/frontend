import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ResultsManagement from "../components/ResultsManagement";
import "bootstrap/dist/css/bootstrap.min.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeComponent, setActiveComponent] = useState('dashboard');
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
    navigate("/login");
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin": return "badge-admin";
      case "teacher": return "badge-teacher";
      case "student": return "badge-student";
      case "parent": return "badge-parent";
      case "fee_department": return "badge-fee-department";
      default: return "bg-secondary";
    }
  };

  // Student Dashboard Content
  const StudentDashboard = () => (
    <div>
      {/* Student Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary bg-opacity-10 border-primary">
            <div className="card-body text-center">
              <i className="bi bi-cash-stack text-primary" style={{ fontSize: '2rem' }}></i>
              <h4 className="mt-2 mb-0 text-primary">
                Rs.{dashboardStats.loading ? '...' : dashboardStats.totalFeeCollected.toLocaleString()}
              </h4>
              <small className="text-muted">Fee Paid</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning bg-opacity-10 border-warning">
            <div className="card-body text-center">
              <i className="bi bi-clock text-warning" style={{ fontSize: '2rem' }}></i>
              <h4 className="mt-2 mb-0 text-warning">
                Rs.{dashboardStats.loading ? '...' : dashboardStats.pendingFees.toLocaleString()}
              </h4>
              <small className="text-muted">Fee Pending</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success bg-opacity-10 border-success">
            <div className="card-body text-center">
              <i className="bi bi-trophy text-success" style={{ fontSize: '2rem' }}></i>
              <h4 className="mt-2 mb-0 text-success">
                {dashboardStats.loading ? '...' : dashboardStats.recentActivities.filter(a => a.icon === 'bi-trophy').length}
              </h4>
              <small className="text-muted">Achievements</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info bg-opacity-10 border-info">
            <div className="card-body text-center">
              <i className="bi bi-calendar-check text-info" style={{ fontSize: '2rem' }}></i>
              <h4 className="mt-2 mb-0 text-info">85%</h4>
              <small className="text-muted">Attendance</small>
            </div>
          </div>
        </div>
      </div>

      {/* Student Action Cards */}
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100 dashboard-card">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-person-badge icon-primary" style={{ fontSize: "3rem" }}></i>
              </div>
              <h5>My Profile</h5>
              <p className="text-muted">View and edit personal details</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("/student-profile")}>View Profile</button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100 dashboard-card">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-calendar-check icon-accent" style={{ fontSize: "3rem" }}></i>
              </div>
              <h5>Attendance</h5>
              <p className="text-muted">Check attendance record</p>
              <button className="btn btn-success btn-sm" onClick={() => navigate("/attendance")}>View Attendance</button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100 dashboard-card">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-trophy icon-secondary" style={{ fontSize: "3rem" }}></i>
              </div>
              <h5>Achievements</h5>
              <p className="text-muted">View and add achievements</p>
              <button className="btn btn-warning btn-sm" onClick={() => navigate("/student-profile")}>Manage Achievements</button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100 dashboard-card">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-graph-up icon-primary" style={{ fontSize: "3rem" }}></i>
              </div>
              <h5>My Results</h5>
              <p className="text-muted">View exam results and grades</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("/student-profile")}>View Results</button>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="col-md-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-light">
              <h6 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Recent Activities
              </h6>
            </div>
            <div className="card-body">
              {dashboardStats.loading ? (
                <div className="text-center">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : dashboardStats.recentActivities.length > 0 ? (
                <div className="list-group list-group-flush">
                  {dashboardStats.recentActivities.map((activity, index) => (
                    <div key={index} className="list-group-item border-0 px-0">
                      <div className="d-flex align-items-center">
                        <i className={`${activity.icon} text-${activity.type} me-3`}></i>
                        <div className="flex-grow-1">
                          <div className="fw-bold">{activity.text}</div>
                          <small className="text-muted">{activity.time}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted">
                  <i className="bi bi-info-circle me-2"></i>
                  No recent activities
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Teacher/Admin Dashboard Content
  const TeacherDashboard = () => (
    <div>
      {/* Admin/Teacher Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary bg-opacity-10 border-primary">
            <div className="card-body text-center">
              <i className="bi bi-people text-primary" style={{ fontSize: '2rem' }}></i>
              <h4 className="mt-2 mb-0 text-primary">
                {dashboardStats.loading ? '...' : dashboardStats.totalStudents}
              </h4>
              <small className="text-muted">Total Students</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success bg-opacity-10 border-success">
            <div className="card-body text-center">
              <i className="bi bi-cash-stack text-success" style={{ fontSize: '2rem' }}></i>
              <h4 className="mt-2 mb-0 text-success">
                Rs.{dashboardStats.loading ? '...' : dashboardStats.totalFeeCollected.toLocaleString()}
              </h4>
              <small className="text-muted">Fee Collected</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning bg-opacity-10 border-warning">
            <div className="card-body text-center">
              <i className="bi bi-clock text-warning" style={{ fontSize: '2rem' }}></i>
              <h4 className="mt-2 mb-0 text-warning">
                Rs.{dashboardStats.loading ? '...' : dashboardStats.pendingFees.toLocaleString()}
              </h4>
              <small className="text-muted">Pending Fees</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info bg-opacity-10 border-info">
            <div className="card-body text-center">
              <i className="bi bi-graph-up text-info" style={{ fontSize: '2rem' }}></i>
              <h4 className="mt-2 mb-0 text-info">
                {dashboardStats.loading ? '...' : Math.round((dashboardStats.totalFeeCollected / (dashboardStats.totalFeeCollected + dashboardStats.pendingFees)) * 100) || 0}%
              </h4>
              <small className="text-muted">Collection Rate</small>
            </div>
          </div>
        </div>
      </div>

      {/* Admin/Teacher Action Cards */}
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-people" style={{ fontSize: "3rem", color: "#0d6efd" }}></i>
              </div>
              <h5>My Students</h5>
              <p className="text-muted">Manage student records</p>
              <div className="mb-2">
                <span className="badge bg-primary">{dashboardStats.totalStudents} Students</span>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("/student-registration")}>View Students</button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-clipboard-check" style={{ fontSize: "3rem", color: "#198754" }}></i>
              </div>
              <h5>Attendance</h5>
              <p className="text-muted">Mark student attendance</p>
              <div className="mb-2">
                <span className="badge bg-success">Daily Tracking</span>
              </div>
              <button className="btn btn-success btn-sm" onClick={() => navigate("/attendance")}>Take Attendance</button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-journal-text" style={{ fontSize: "3rem", color: "#6f42c1" }}></i>
              </div>
              <h5>Results Management</h5>
              <p className="text-muted">Upload and manage exam results</p>
              <div className="mb-2">
                <span className="badge bg-secondary">Exam Results</span>
              </div>
              <button 
                className="btn btn-sm"
                style={{ backgroundColor: "#6f42c1", color: "white" }}
                onClick={() => navigate("/results")}
              >
                Manage Results
              </button>
            </div>
          </div>
        </div>
        {/* Fee Management - Only for Admin users */}
        {user.role === "admin" && (
          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-cash-stack" style={{ fontSize: "3rem", color: "#198754" }}></i>
                </div>
                <h5>Fee Management</h5>
                <p className="text-muted">Manage student fees and payments</p>
                <div className="mb-2">
                  <span className="badge bg-success">Rs.{dashboardStats.totalFeeCollected.toLocaleString()} Collected</span>
                </div>
                <button 
                  className="btn btn-success btn-sm"
                  onClick={() => navigate("/fee-department")}
                >
                  Manage Fees
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-journal-text" style={{ fontSize: "3rem", color: "#dc3545" }}></i>
              </div>
              <h5>Assignments</h5>
              <p className="text-muted">Create and grade assignments</p>
              <div className="mb-2">
                <span className="badge bg-secondary">Coming Soon</span>
              </div>
              <button className="btn btn-danger btn-sm" style={{ color: "white" }}>Manage Assignments</button>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="col-md-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-light">
              <h6 className="mb-0">
                <i className="bi bi-activity me-2"></i>
                System Activities
              </h6>
            </div>
            <div className="card-body">
              {dashboardStats.loading ? (
                <div className="text-center">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : dashboardStats.recentActivities.length > 0 ? (
                <div className="list-group list-group-flush">
                  {dashboardStats.recentActivities.map((activity, index) => (
                    <div key={index} className="list-group-item border-0 px-0">
                      <div className="d-flex align-items-center">
                        <i className={`${activity.icon} text-${activity.type} me-3`}></i>
                        <div className="flex-grow-1">
                          <div className="fw-bold">{activity.text}</div>
                          <small className="text-muted">{activity.time}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted">
                  <i className="bi bi-info-circle me-2"></i>
                  No recent activities
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Parent Dashboard Content
  const ParentDashboard = () => (
    <div className="row g-4">
      <div className="col-md-4">
        <div className="card shadow-sm h-100">
          <div className="card-body text-center">
            <div className="mb-3">
              <i className="bi bi-person-badge" style={{ fontSize: "3rem", color: "#0d6efd" }}></i>
            </div>
            <h5>My Children</h5>
            <p className="text-muted">View children's profiles</p>
            <button className="btn btn-primary btn-sm">View Children</button>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card shadow-sm h-100">
          <div className="card-body text-center">
            <div className="mb-3">
              <i className="bi bi-graph-up" style={{ fontSize: "3rem", color: "#198754" }}></i>
            </div>
            <h5>Academic Results</h5>
            <p className="text-muted">View children's exam results</p>
            <button className="btn btn-success btn-sm">View Results</button>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card shadow-sm h-100">
          <div className="card-body text-center">
            <div className="mb-3">
              <i className="bi bi-cash-coin" style={{ fontSize: "3rem", color: "#dc3545" }}></i>
            </div>
            <h5>Fee Payment</h5>
            <p className="text-muted">View and pay fees</p>
            <button className="btn btn-danger btn-sm">View Fees</button>
          </div>
        </div>
      </div>
    </div>
  );

  // Fee Department Dashboard Content
  const FeeDepartmentDashboard = () => (
    <>
      {/* Quick Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-success">
            <div className="card-body text-center">
              <h6 className="text-muted small">Total Collected</h6>
              <h3 className="text-success mb-0">
                Rs.{dashboardStats.loading ? '...' : dashboardStats.totalFeeCollected.toLocaleString()}
              </h3>
              <small className="text-muted">This Year</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-warning">
            <div className="card-body text-center">
              <h6 className="text-muted small">Pending Fees</h6>
              <h3 className="text-warning mb-0">
                Rs.{dashboardStats.loading ? '...' : dashboardStats.pendingFees.toLocaleString()}
              </h3>
              <small className="text-muted">Due Amount</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-danger">
            <div className="card-body text-center">
              <h6 className="text-muted small">Total Students</h6>
              <h3 className="text-danger mb-0">
                {dashboardStats.loading ? '...' : dashboardStats.totalStudents}
              </h3>
              <small className="text-muted">Registered</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-primary">
            <div className="card-body text-center">
              <h6 className="text-muted small">Collection Rate</h6>
              <h3 className="text-primary mb-0">
                {dashboardStats.loading ? '...' : Math.round((dashboardStats.totalFeeCollected / (dashboardStats.totalFeeCollected + dashboardStats.pendingFees)) * 100) || 0}%
              </h3>
              <small className="text-muted">Success Rate</small>
            </div>
          </div>
        </div>
      </div>

      {/* Main Features */}
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-search me-2 text-primary"></i>
                Student Fee Overview
              </h5>
              <ul className="list-unstyled mt-3 small">
                <li>✓ Search by name/class/roll</li>
                <li>✓ View fee status</li>
                <li>✓ Fee history</li>
              </ul>
              <button className="btn btn-primary btn-sm w-100 mt-2">Search Students</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-cash-stack me-2 text-success"></i>
                Fee Management System
              </h5>
              <ul className="list-unstyled mt-3 small">
                <li>✓ Complete fee management</li>
                <li>✓ Payment processing</li>
                <li>✓ Student fee tracking</li>
                <li>✓ Reports & analytics</li>
              </ul>
              <button 
                className="btn btn-success btn-sm w-100 mt-2"
                onClick={() => navigate("/fee-department")}
              >
                Open Fee Management
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-gear me-2 text-warning"></i>
                Fee Structure
              </h5>
              <ul className="list-unstyled mt-3 small">
                <li>✓ Set fee categories</li>
                <li>✓ Class-wise fees</li>
                <li>✓ Discounts & scholarships</li>
                <li>✓ Late payment fines</li>
              </ul>
              <button className="btn btn-warning btn-sm w-100 mt-2">Manage Structure</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-clipboard-data me-2 text-info"></i>
                Payment Tracking
              </h5>
              <ul className="list-unstyled mt-3 small">
                <li>✓ Daily collection report</li>
                <li>✓ Pending fee list</li>
                <li>✓ Overdue students</li>
                <li>✓ Partial payments</li>
              </ul>
              <button className="btn btn-info btn-sm w-100 mt-2">View Tracking</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-graph-up-arrow me-2 text-danger"></i>
                Reports & Analytics
              </h5>
              <ul className="list-unstyled mt-3 small">
                <li>✓ Monthly revenue</li>
                <li>✓ Collection graphs</li>
                <li>✓ Export PDF/Excel</li>
                <li>✓ Payment trends</li>
              </ul>
              <button className="btn btn-danger btn-sm w-100 mt-2">View Reports</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-bell me-2 text-secondary"></i>
                Notifications
              </h5>
              <ul className="list-unstyled mt-3 small">
                <li>✓ Payment reminders</li>
                <li>✓ SMS notifications</li>
                <li>✓ Due alerts</li>
                <li>✓ Auto reminders</li>
              </ul>
              <button className="btn btn-secondary btn-sm w-100 mt-2">Manage Alerts</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (!user) return null;

  // If showing results component, render it with back button
  if (activeComponent === 'results') {
    return (
      <div className="min-vh-100 bg-light">
        {/* Top Navigation */}
        <nav className="navbar navbar-dark shadow-sm">
          <div className="container-fluid px-4">
            <span className="navbar-brand mb-0 h1">Student Management System</span>
            <div className="d-flex align-items-center">
              <button 
                className="btn btn-outline-secondary btn-sm me-2"
                onClick={() => setActiveComponent('dashboard')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Dashboard
              </button>
              {user.role === "admin" && (
                <button 
                  className="btn btn-outline-warning btn-sm me-2" 
                  onClick={() => navigate("/admin")}
                >
                  Admin Panel
                </button>
              )}
              <button 
                className="btn btn-outline-info btn-sm me-2" 
                onClick={() => navigate("/profile")}
              >
                <i className="bi bi-person-circle me-1"></i>
                Profile
              </button>
              <button 
                className="btn btn-outline-light btn-sm" 
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Results Management Component */}
        <div className="container py-5">
          <ResultsManagement />
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Top Navigation */}
      <nav className="navbar navbar-dark shadow-sm">
        <div className="container-fluid px-4">
          <span className="navbar-brand mb-0 h1">Student Management System</span>
          <div className="d-flex align-items-center">
            {user.role === "admin" && (
              <button 
                className="btn btn-outline-warning btn-sm me-2" 
                onClick={() => navigate("/admin")}
              >
                Admin Panel
              </button>
            )}
            <button 
              className="btn btn-outline-info btn-sm me-2" 
              onClick={() => navigate("/profile")}
            >
              <i className="bi bi-person-circle me-1"></i>
              Profile
            </button>
            <button 
              className="btn btn-outline-light btn-sm" 
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-5">
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-2">Welcome, {user.username}!</h2>
                  <p className="text-muted mb-0">
                    Role: <span className={`badge ${getRoleBadgeClass(user.role)}`}>{user.role.toUpperCase()}</span>
                    {dashboardStats.loading && (
                      <span className="ms-2">
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </span>
                    )}
                  </p>
                </div>
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => fetchDashboardStats(user)}
                  disabled={dashboardStats.loading}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Role-specific Dashboard */}
        {user.role === "student" && <StudentDashboard />}
        {(user.role === "teacher" || user.role === "admin") && <TeacherDashboard />}
        {user.role === "parent" && <ParentDashboard />}
        {user.role === "fee_department" && <FeeDepartmentDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;
