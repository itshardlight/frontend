import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
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

  if (loading) {
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
            <h2>User Management</h2>
            <p className="text-muted">Manage user roles and permissions</p>
          </div>
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
                  {users.map((user) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5>Statistics</h5>
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
      </div>
    </div>
  );
};

export default AdminPanel;
