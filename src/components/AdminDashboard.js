import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  return (
    <>
      {/* Quick Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-primary">
            <div className="card-body text-center">
              <i className="bi bi-people-fill icon-primary" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">0</h3>
              <small className="text-muted">Total Students</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-success">
            <div className="card-body text-center">
              <i className="bi bi-person-badge icon-accent" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">0</h3>
              <small className="text-muted">Total Teachers</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-warning">
            <div className="card-body text-center">
              <i className="bi bi-door-open" style={{ fontSize: "2rem", color: "#f59e0b" }}></i>
              <h3 className="mt-2 mb-0">0</h3>
              <small className="text-muted">Total Classes</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-info">
            <div className="card-body text-center">
              <i className="bi bi-person-plus icon-secondary" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">0</h3>
              <small className="text-muted">New Admissions</small>
            </div>
          </div>
        </div>
      </div>

      {/* Main Features */}
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100 dashboard-card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-people me-2 icon-primary"></i>
                User Management
              </h5>
              <p className="text-muted small">Create, edit, and manage user accounts</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Create new users</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Edit user details</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Disable accounts</li>
              </ul>
              <button className="btn btn-primary btn-sm w-100 mt-2">Manage Users</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100 dashboard-card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-cash-stack me-2 icon-accent"></i>
                Fee Collection Status
              </h5>
              <p className="text-muted small">Monitor fee payments and dues</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Total collected</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Pending payments</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Overdue students</li>
              </ul>
              <button className="btn btn-success btn-sm w-100 mt-2">View Fees</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100 dashboard-card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-calendar-check me-2 icon-secondary"></i>
                Attendance Overview
              </h5>
              <p className="text-muted small">Track student and teacher attendance</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Daily attendance</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Monthly reports</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Absentee alerts</li>
              </ul>
              <button className="btn btn-info btn-sm w-100 mt-2" onClick={() => navigate("/attendance")}>View Attendance</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100 dashboard-card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-megaphone me-2" style={{ color: "#f59e0b" }}></i>
                Notice & Announcements
              </h5>
              <p className="text-muted small">Post notices and announcements</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Create notices</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Event announcements</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Holiday alerts</li>
              </ul>
              <button className="btn btn-warning btn-sm w-100 mt-2">Manage Notices</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100 dashboard-card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-clock me-2 icon-primary"></i>
                Timetable Management
              </h5>
              <p className="text-muted small">Create and manage class schedules</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Class timetables</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Teacher schedules</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Exam schedules</li>
              </ul>
              <button className="btn btn-primary btn-sm w-100 mt-2">Manage Timetable</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100 dashboard-card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-file-earmark-bar-graph me-2 text-danger"></i>
                Report Generator
              </h5>
              <p className="text-muted small">Generate academic and financial reports</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Academic reports</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Financial reports</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Export to PDF/Excel</li>
              </ul>
              <button className="btn btn-danger btn-sm w-100 mt-2">Generate Reports</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100 dashboard-card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-person-plus me-2 icon-secondary"></i>
                Admissions
              </h5>
              <p className="text-muted small">Manage new student admissions</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>New applications</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Pending approvals</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Admission records</li>
              </ul>
              <button className="btn btn-info btn-sm w-100 mt-2" onClick={() => navigate("/student-registration")}>View Admissions</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100 dashboard-card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-chat-dots me-2 icon-accent"></i>
                Messages
              </h5>
              <p className="text-muted small">View messages from parents and teachers</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Unread messages: 0</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Parent inquiries</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Teacher requests</li>
              </ul>
              <button className="btn btn-success btn-sm w-100 mt-2">View Messages</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
