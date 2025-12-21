import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { studentService } from "../services/studentService";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentsError, setStudentsError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userData);
    setCurrentUser(user);

    if (user.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    fetchUsers(user.id);
    fetchStudents();
  }, [navigate]);

  const fetchUsers = async (adminId) => {
    try {
      const response = await axios.post("http://localhost:5000/api/admin/users", {
        userId: adminId
      });

      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get("http://localhost:5000/api/students", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (err) {
      setStudentsError("Failed to load students");
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleRoleChange = async (targetUserId, newRole) => {
    try {
      const response = await axios.post("http://localhost:5000/api/admin/update-role", {
        userId: currentUser.id,
        targetUserId,
        newRole
      });

      if (response.data.success) {
        alert("Role updated successfully!");
        fetchUsers(currentUser.id);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleDeleteUser = async (targetUserId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/admin/delete-user", {
        userId: currentUser.id,
        targetUserId
      });

      if (response.data.success) {
        alert("User deleted successfully!");
        fetchUsers(currentUser.id);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student? This will also delete their user account.")) {
      return;
    }

    try {
      await studentService.deleteStudent(studentId);
      alert("Student deleted successfully!");
      fetchStudents();
    } catch (err) {
      alert(err.message || "Failed to delete student");
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin": return "bg-danger";
      case "teacher": return "bg-primary";
      case "student": return "bg-success";
      case "parent": return "bg-info";
      case "fee_department": return "bg-warning";
      default: return "bg-secondary";
    }
  };

  if (loading || studentsLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Top Navigation */}
      <nav className="navbar navbar-dark bg-dark shadow-sm">
        <div className="container-fluid px-4">
          <span className="navbar-brand mb-0 h1">Admin Panel</span>
          <button 
            className="btn btn-outline-light btn-sm" 
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-5">
        <div className="row mb-4">
          <div className="col-12">
            <h2>Admin Panel</h2>
            <p className="text-muted">Manage users and students</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              User Management
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === "students" ? "active" : ""}`}
              onClick={() => setActiveTab("students")}
            >
              Student Management
            </button>
          </li>
        </ul>

        {/* Users Tab */}
        {activeTab === "users" && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4>User Management</h4>
                <p className="text-muted mb-0">Manage user roles and permissions</p>
              </div>
              <button 
                className="btn btn-outline-primary"
                onClick={() => fetchUsers(currentUser.id)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sync-alt me-2"></i>
                    Refresh
                  </>
                )}
              </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Verified</th>
                        <th>Registered</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            <div className="text-muted">
                              <i className="fas fa-user-friends fa-2x mb-2"></i>
                              <p>No users found</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user._id}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>
                              <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                                {user.role}
                              </span>
                            </td>
                            <td>
                              {user.isVerified ? (
                                <span className="badge bg-success">✓ Verified</span>
                              ) : (
                                <span className="badge bg-warning">Pending</span>
                              )}
                            </td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <select
                                  className="form-select form-select-sm"
                                  value={user.role}
                                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                  style={{ width: "150px" }}
                                >
                                  <option value="student">Student</option>
                                  <option value="teacher">Teacher</option>
                                  <option value="parent">Parent</option>
                                  <option value="fee_department">Fee Department</option>
                                  <option value="admin">Admin</option>
                                </select>
                                {user.role !== "admin" && (
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => handleDeleteUser(user._id)}
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5>User Statistics</h5>
                  <div className="row mt-3">
                    <div className="col-md-2">
                      <div className="text-center">
                        <h3 className="text-danger">{users.filter(u => u.role === "admin").length}</h3>
                        <p className="text-muted small">Admins</p>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="text-center">
                        <h3 className="text-primary">{users.filter(u => u.role === "teacher").length}</h3>
                        <p className="text-muted small">Teachers</p>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="text-center">
                        <h3 className="text-success">{users.filter(u => u.role === "student").length}</h3>
                        <p className="text-muted small">Students</p>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="text-center">
                        <h3 className="text-info">{users.filter(u => u.role === "parent").length}</h3>
                        <p className="text-muted small">Parents</p>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="text-center">
                        <h3 className="text-warning">{users.filter(u => u.role === "fee_department").length}</h3>
                        <p className="text-muted small">Fee Dept</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4>Student Management</h4>
                <p className="text-muted mb-0">Manage student records and accounts</p>
              </div>
              <button 
                className="btn btn-outline-primary"
                onClick={fetchStudents}
                disabled={studentsLoading}
              >
                {studentsLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sync-alt me-2"></i>
                    Refresh
                  </>
                )}
              </button>
            </div>

            {studentsError && <div className="alert alert-danger">{studentsError}</div>}

            <div className="card shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Roll Number</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Class</th>
                        <th>Section</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            <div className="text-muted">
                              <i className="fas fa-users fa-2x mb-2"></i>
                              <p>No students found</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        students.map((student) => (
                          <tr key={student._id}>
                            <td><strong>{student.rollNumber}</strong></td>
                            <td>{student.firstName} {student.lastName}</td>
                            <td>{student.email}</td>
                            <td>{student.class}</td>
                            <td>{student.section}</td>
                            <td>{student.phone}</td>
                            <td>
                              <span className={`badge ${student.status === 'active' ? 'bg-success' : 'bg-warning'}`}>
                                {student.status}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => navigate(`/student-profile/${student._id}`)}
                                >
                                  View
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDeleteStudent(student._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5>Student Statistics</h5>
                  <div className="row mt-3">
                    <div className="col-md-3">
                      <div className="text-center">
                        <h3 className="text-primary">{students.length}</h3>
                        <p className="text-muted small">Total Students</p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center">
                        <h3 className="text-success">{students.filter(s => s.status === "active").length}</h3>
                        <p className="text-muted small">Active Students</p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center">
                        <h3 className="text-warning">{students.filter(s => s.status === "inactive").length}</h3>
                        <p className="text-muted small">Inactive Students</p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center">
                        <h3 className="text-info">{new Set(students.map(s => s.class)).size}</h3>
                        <p className="text-muted small">Classes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
