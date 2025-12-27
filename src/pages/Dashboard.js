import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ResultsManagement from "../components/ResultsManagement";
import "bootstrap/dist/css/bootstrap.min.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

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
    </div>
  );

  // Teacher/Admin Dashboard Content
  const TeacherDashboard = () => (
    <div className="row g-4">
      <div className="col-md-4">
        <div className="card shadow-sm h-100">
          <div className="card-body text-center">
            <div className="mb-3">
              <i className="bi bi-people" style={{ fontSize: "3rem", color: "#0d6efd" }}></i>
            </div>
            <h5>My Students</h5>
            <p className="text-muted">Manage student records</p>
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
            <h5>Assignments</h5>
            <p className="text-muted">Create and grade assignments</p>
            <button className="btn btn-purple btn-sm" style={{ backgroundColor: "#6f42c1", color: "white" }}>Manage Assignments</button>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card shadow-sm h-100">
          <div className="card-body text-center">
            <div className="mb-3">
              <i className="bi bi-graph-up" style={{ fontSize: "3rem", color: "#dc3545" }}></i>
            </div>
            <h5>Student Results</h5>
            <p className="text-muted">Upload and manage exam results</p>
            <button 
              className="btn btn-danger btn-sm"
              onClick={() => setActiveComponent('results')}
            >
              Manage Results
            </button>
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
              <h3 className="text-success mb-0">Rs. 0</h3>
              <small className="text-muted">This Month</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-warning">
            <div className="card-body text-center">
              <h6 className="text-muted small">Pending Fees</h6>
              <h3 className="text-warning mb-0">Rs. 0</h3>
              <small className="text-muted">Due Amount</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-danger">
            <div className="card-body text-center">
              <h6 className="text-muted small">Overdue</h6>
              <h3 className="text-danger mb-0">0</h3>
              <small className="text-muted">Students</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-primary">
            <div className="card-body text-center">
              <h6 className="text-muted small">Today's Collection</h6>
              <h3 className="text-primary mb-0">Rs. 0</h3>
              <small className="text-muted">Cash + Online</small>
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
                Fee Collection
              </h5>
              <ul className="list-unstyled mt-3 small">
                <li>✓ Generate invoices</li>
                <li>✓ Collect payments</li>
                <li>✓ eSewa verification</li>
                <li>✓ Print receipts</li>
              </ul>
              <button className="btn btn-success btn-sm w-100 mt-2">Collect Fee</button>
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
              <div className="card-body">
                <h2 className="mb-2">Welcome, {user.username}!</h2>
                <p className="text-muted mb-0">
                  Role: <span className={`badge ${getRoleBadgeClass(user.role)}`}>{user.role.toUpperCase()}</span>
                </p>
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
