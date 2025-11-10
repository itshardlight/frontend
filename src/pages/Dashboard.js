import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaCalendarCheck, 
  FaMoneyCheckAlt, 
  FaChartLine, 
  FaBook,
  FaClipboardList,
  FaBell,
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";

const Dashboard = () => {
  const [user, setUser] = useState(null);
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

  if (!user) return null;

  const stats = [
    { label: "Total Students", value: "1,245", color: "primary", icon: FaUserGraduate },
    { label: "Active Teachers", value: "87", color: "success", icon: FaChalkboardTeacher },
    { label: "Attendance Today", value: "94.2%", color: "info", icon: FaCalendarCheck },
    { label: "Pending Fees", value: "₹2.4L", color: "warning", icon: FaMoneyCheckAlt }
  ];

  const modules = [
    {
      title: "Student Management",
      description: "Add, edit, and manage student records, enrollment, and academic information.",
      icon: FaUserGraduate,
      color: "primary",
      link: "#"
    },
    {
      title: "Attendance Tracking",
      description: "Record and monitor daily attendance with automated reports and analytics.",
      icon: FaCalendarCheck,
      color: "success",
      link: "#"
    },
    {
      title: "Fee Management",
      description: "Process fee payments, generate receipts, and track outstanding balances.",
      icon: FaMoneyCheckAlt,
      color: "warning",
      link: "#"
    },
    {
      title: "Academic Records",
      description: "Maintain examination results, grades, and academic performance data.",
      icon: FaBook,
      color: "info",
      link: "#"
    },
    {
      title: "Reports & Analytics",
      description: "Generate comprehensive reports on performance, attendance, and finances.",
      icon: FaChartLine,
      color: "danger",
      link: "#"
    },
    {
      title: "Timetable Management",
      description: "Create and manage class schedules, periods, and teacher assignments.",
      icon: FaClipboardList,
      color: "secondary",
      link: "#"
    }
  ];

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Top Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container-fluid px-4">
          <a className="navbar-brand fw-bold fs-4" href="/">
            <FaBook className="me-2" />
            Student Management System
          </a>
          <div className="d-flex align-items-center">
            <div className="dropdown me-3">
              <button 
                className="btn btn-outline-light btn-sm dropdown-toggle" 
                type="button" 
                id="notificationDropdown" 
                data-bs-toggle="dropdown"
              >
                <FaBell className="me-1" />
                <span className="badge bg-danger rounded-pill ms-1">3</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><h6 className="dropdown-header">Notifications</h6></li>
                <li><a className="dropdown-item" href="#">New student enrollment pending</a></li>
                <li><a className="dropdown-item" href="#">Fee payment received</a></li>
                <li><a className="dropdown-item" href="#">Attendance report ready</a></li>
              </ul>
            </div>
            <div className="dropdown">
              <button 
                className="btn btn-outline-light btn-sm dropdown-toggle" 
                type="button" 
                id="userDropdown" 
                data-bs-toggle="dropdown"
              >
                <FaCog className="me-1" />
                {user.user?.name}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><a className="dropdown-item" href="#">Profile Settings</a></li>
                <li><a className="dropdown-item" href="#">System Settings</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-fluid px-4 py-4 flex-grow-1">
        {/* Welcome Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body py-3">
                <h4 className="mb-1">Welcome, {user.user?.name}</h4>
                <p className="text-muted mb-0">
                  <small>{user.user?.email} | Administrator Dashboard</small>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="col-12 col-sm-6 col-lg-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">{stat.label}</p>
                      <h3 className="mb-0 fw-bold">{stat.value}</h3>
                    </div>
                    <div className={`bg-${stat.color} bg-opacity-10 p-3 rounded`}>
                      <stat.icon className={`text-${stat.color}`} size={28} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Module Cards */}
        <div className="row mb-4">
          <div className="col-12 mb-3">
            <h5 className="fw-bold">System Modules</h5>
            <p className="text-muted small">Access and manage various aspects of the student management system</p>
          </div>
          {modules.map((module, index) => (
            <div key={index} className="col-12 col-md-6 col-lg-4 mb-4">
              <div className="card border-0 shadow-sm h-100 hover-shadow" style={{ transition: "all 0.3s" }}>
                <div className="card-body">
                  <div className={`bg-${module.color} bg-opacity-10 p-3 rounded d-inline-block mb-3`}>
                    <module.icon className={`text-${module.color}`} size={32} />
                  </div>
                  <h5 className="card-title fw-bold">{module.title}</h5>
                  <p className="card-text text-muted small mb-3">{module.description}</p>
                  <a href={module.link} className={`btn btn-${module.color} btn-sm`}>
                    Access Module
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="row">
          <div className="col-12 col-lg-8 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">Recent Activity</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0">Activity</th>
                        <th className="border-0">User</th>
                        <th className="border-0">Time</th>
                        <th className="border-0">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>New student enrollment</td>
                        <td>Admin User</td>
                        <td>10 minutes ago</td>
                        <td><span className="badge bg-success">Completed</span></td>
                      </tr>
                      <tr>
                        <td>Fee payment processed</td>
                        <td>Accounts Dept</td>
                        <td>25 minutes ago</td>
                        <td><span className="badge bg-success">Completed</span></td>
                      </tr>
                      <tr>
                        <td>Attendance marked - Class 10A</td>
                        <td>Teacher Name</td>
                        <td>1 hour ago</td>
                        <td><span className="badge bg-success">Completed</span></td>
                      </tr>
                      <tr>
                        <td>Report generation requested</td>
                        <td>Principal</td>
                        <td>2 hours ago</td>
                        <td><span className="badge bg-warning">Pending</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-12 col-lg-4 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">Quick Actions</h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary btn-sm text-start">
                    <FaUserGraduate className="me-2" />
                    Add New Student
                  </button>
                  <button className="btn btn-outline-success btn-sm text-start">
                    <FaCalendarCheck className="me-2" />
                    Mark Attendance
                  </button>
                  <button className="btn btn-outline-warning btn-sm text-start">
                    <FaMoneyCheckAlt className="me-2" />
                    Process Fee Payment
                  </button>
                  <button className="btn btn-outline-info btn-sm text-start">
                    <FaChartLine className="me-2" />
                    Generate Report
                  </button>
                  <button className="btn btn-outline-secondary btn-sm text-start">
                    <FaClipboardList className="me-2" />
                    View Timetable
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <div className="container">
          <p className="mb-0 small">
            &copy; {new Date().getFullYear()} Student Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
