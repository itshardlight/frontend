import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { studentService } from "../services/studentService";
import LoginModal from "../components/LoginModal";

const StudentRegistration = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("list");
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    newThisMonth: 0,
    totalClasses: 8
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    class: "",
    section: "",
    rollNumber: "",
    admissionDate: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    emergencyContact: "",
    previousSchool: "",
    medicalConditions: ""
  });
  const [editingStudent, setEditingStudent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load students and stats on component mount
  useEffect(() => {
    loadStudents();
    loadStats();
    
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setCurrentUser(JSON.parse(user));
      setIsAuthenticated(true);
    }
  }, []);

  // Filter students based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => 
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.includes(searchTerm) ||
        student.classSection.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [students, searchTerm]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await studentService.getStudents();
      setStudents(response.data || []);
    } catch (err) {
      setError("Failed to load students: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await studentService.getStudentStats();
      setStats(response.data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      bloodGroup: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      class: "",
      section: "",
      rollNumber: "",
      admissionDate: "",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      emergencyContact: "",
      previousSchool: "",
      medicalConditions: ""
    });
    setEditingStudent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (editingStudent) {
        await studentService.updateStudent(editingStudent._id, formData);
        setSuccess("Student updated successfully!");
      } else {
        await studentService.createStudent(formData);
        setSuccess("Student registered successfully!");
      }
      
      // Reset form
      resetForm();

      // Reload students and stats
      loadStudents();
      loadStats();
      
      // Switch to list tab to see the changes
      setTimeout(() => {
        setActiveTab("list");
      }, 2000);
      
    } catch (err) {
      setError(`Failed to ${editingStudent ? 'update' : 'register'} student: ` + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : "",
      gender: student.gender,
      bloodGroup: student.bloodGroup || "",
      email: student.email,
      phone: student.phone,
      address: student.address,
      city: student.city,
      state: student.state,
      zipCode: student.zipCode,
      class: student.class,
      section: student.section,
      rollNumber: student.rollNumber,
      admissionDate: student.admissionDate ? student.admissionDate.split('T')[0] : "",
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail || "",
      emergencyContact: student.emergencyContact,
      previousSchool: student.previousSchool || "",
      medicalConditions: student.medicalConditions || ""
    });
    setActiveTab("register");
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    
    setLoading(true);
    setError("");
    try {
      await studentService.deleteStudent(studentToDelete._id);
      setSuccess(`Student ${studentToDelete.fullName} deleted successfully!`);
      
      // Reload students and stats
      await loadStudents();
      await loadStats();
      
      setShowDeleteModal(false);
      setStudentToDelete(null);
    } catch (err) {
      setError("Failed to delete student: " + err.message);
      setShowDeleteModal(false);
      setStudentToDelete(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    resetForm();
    setActiveTab("list");
  };

  const handleLogin = (user, token) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const requireAuth = (action) => {
    if (!isAuthenticated) {
      setError(`Please login to ${action} students`);
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  const handleEditWithAuth = (student) => {
    if (requireAuth('edit')) {
      handleEdit(student);
    }
  };

  const handleDeleteWithAuth = (student) => {
    if (requireAuth('delete')) {
      handleDeleteClick(student);
    }
  };

  const getStatusBadge = (status) => {
    return status === "active" ? "badge bg-success" : "badge bg-secondary";
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-person-plus me-2 text-primary"></i>
            Student Registration
          </h2>
          <p className="text-muted mb-0">Register and manage student records</p>
        </div>
        <div className="d-flex gap-2">
          {isAuthenticated ? (
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted">
                <i className="bi bi-person-circle me-1"></i>
                {currentUser?.fullName} ({currentUser?.role})
              </span>
              <button 
                className="btn btn-outline-danger btn-sm" 
                onClick={handleLogout}
                title="Logout"
              >
                <i className="bi bi-box-arrow-right me-1"></i>Logout
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-outline-primary btn-sm" 
              onClick={() => setShowLoginModal(true)}
              title="Login to access edit/delete features"
            >
              <i className="bi bi-key me-1"></i>Admin Login
            </button>
          )}
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-2"></i>Back
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-primary">
            <div className="card-body text-center">
              <i className="bi bi-people-fill text-primary" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{stats.totalStudents}</h3>
              <small className="text-muted">Total Students</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-success">
            <div className="card-body text-center">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{stats.activeStudents}</h3>
              <small className="text-muted">Active Students</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-warning">
            <div className="card-body text-center">
              <i className="bi bi-person-plus-fill text-warning" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{stats.newThisMonth}</h3>
              <small className="text-muted">New This Month</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-info">
            <div className="card-body text-center">
              <i className="bi bi-door-open text-info" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{stats.totalClasses}</h3>
              <small className="text-muted">Total Classes</small>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "list" ? "active" : ""}`}
            onClick={() => setActiveTab("list")}
          >
            <i className="bi bi-list-ul me-2"></i>Student List
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "register" ? "active" : ""}`}
            onClick={() => {
              if (editingStudent) {
                resetForm();
              }
              setActiveTab("register");
            }}
          >
            <i className="bi bi-person-plus me-2"></i>
            {editingStudent ? "Edit Student" : "Register New Student"}
          </button>
        </li>
      </ul>

      {/* Global Success/Error Messages */}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle me-2"></i>
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
        </div>
      )}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError("")}></button>
        </div>
      )}

      {/* Student List Tab */}
      {activeTab === "list" && (
        <>
          <div className="card shadow-sm">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">Registered Students</h5>
              <small className="text-muted">
                {searchTerm ? 
                  `${filteredStudents.length} of ${students.length} students` : 
                  `${students.length} total students`
                }
              </small>
            </div>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search students..."
                style={{ width: "250px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  loadStudents();
                  loadStats();
                }}
                disabled={loading}
                title="Refresh"
              >
                <i className="bi bi-arrow-clockwise"></i>
              </button>
              <button className="btn btn-sm btn-outline-primary">
                <i className="bi bi-funnel"></i>
              </button>
              <button className="btn btn-sm btn-primary">
                <i className="bi bi-download me-1"></i>Export
              </button>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Admission Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        {searchTerm ? `No students found matching "${searchTerm}"` : "No students found"}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student._id}>
                        <td className="align-middle">
                          <strong>{student.rollNumber}</strong>
                        </td>
                        <td className="align-middle">
                          <div className="d-flex align-items-center">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                                 style={{ width: "35px", height: "35px", fontSize: "14px" }}>
                              {student.firstName[0]}{student.lastName[0]}
                            </div>
                            {student.fullName}
                          </div>
                        </td>
                        <td className="align-middle">
                          <span className="badge bg-info">{student.classSection}</span>
                        </td>
                        <td className="align-middle">{student.email}</td>
                        <td className="align-middle">{student.phone}</td>
                        <td className="align-middle">
                          {new Date(student.admissionDate).toLocaleDateString()}
                        </td>
                        <td className="align-middle">
                          <span className={getStatusBadge(student.status)}>
                            {student.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="align-middle">
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-primary" title="View">
                              <i className="bi bi-eye"></i>
                            </button>
                            <button 
                              className={`btn ${isAuthenticated ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                              title={isAuthenticated ? "Edit" : "Login to Edit"}
                              onClick={() => handleEditWithAuth(student)}
                              disabled={!isAuthenticated}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className={`btn ${isAuthenticated ? 'btn-outline-danger' : 'btn-outline-secondary'}`}
                              title={isAuthenticated ? "Delete" : "Login to Delete"}
                              onClick={() => handleDeleteWithAuth(student)}
                              disabled={!isAuthenticated}
                            >
                              <i className="bi bi-trash"></i>
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
          <div className="card-footer bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted">
                Showing {filteredStudents.length} of {students.length} students
                {searchTerm && ` (filtered by "${searchTerm}")`}
              </span>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className="page-item disabled">
                    <span className="page-link">Previous</span>
                  </li>
                  <li className="page-item active">
                    <span className="page-link">1</span>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">2</a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">3</a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">Next</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Registration Form Tab */}
      {activeTab === "register" && (
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h5 className="mb-0">
              {editingStudent ? `Edit Student - ${editingStudent.fullName}` : "New Student Registration Form"}
            </h5>
            {editingStudent && (
              <small className="text-muted">
                Roll Number: {editingStudent.rollNumber} | Class: {editingStudent.classSection}
              </small>
            )}
          </div>
          <div className="card-body">
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {error}
                <button type="button" className="btn-close" onClick={() => setError("")}></button>
              </div>
            )}
            {success && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                {success}
                <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <h6 className="text-primary mb-3">
                <i className="bi bi-person me-2"></i>Personal Information
              </h6>
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-control"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-control"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className="form-control"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Gender *</label>
                  <select
                    name="gender"
                    className="form-select"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Blood Group</label>
                  <select
                    name="bloodGroup"
                    className="form-select"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Address Information */}
              <h6 className="text-primary mb-3">
                <i className="bi bi-geo-alt me-2"></i>Address Information
              </h6>
              <div className="row g-3 mb-4">
                <div className="col-md-12">
                  <label className="form-label">Address *</label>
                  <textarea
                    name="address"
                    className="form-control"
                    rows="2"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <div className="col-md-4">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    name="state"
                    className="form-control"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Zip Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    className="form-control"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Academic Information */}
              <h6 className="text-primary mb-3">
                <i className="bi bi-book me-2"></i>Academic Information
              </h6>
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label">Class *</label>
                  <select
                    name="class"
                    className="form-select"
                    value={formData.class}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Class</option>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Section *</label>
                  <select
                    name="section"
                    className="form-select"
                    value={formData.section}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Section</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Roll Number *</label>
                  <input
                    type="text"
                    name="rollNumber"
                    className="form-control"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Admission Date *</label>
                  <input
                    type="date"
                    name="admissionDate"
                    className="form-control"
                    value={formData.admissionDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-8">
                  <label className="form-label">Previous School</label>
                  <input
                    type="text"
                    name="previousSchool"
                    className="form-control"
                    value={formData.previousSchool}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <h6 className="text-primary mb-3">
                <i className="bi bi-people me-2"></i>Parent/Guardian Information
              </h6>
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label">Parent/Guardian Name *</label>
                  <input
                    type="text"
                    name="parentName"
                    className="form-control"
                    value={formData.parentName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Parent Phone *</label>
                  <input
                    type="tel"
                    name="parentPhone"
                    className="form-control"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Parent Email</label>
                  <input
                    type="email"
                    name="parentEmail"
                    className="form-control"
                    value={formData.parentEmail}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Emergency Contact *</label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    className="form-control"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Medical Information */}
              <h6 className="text-primary mb-3">
                <i className="bi bi-heart-pulse me-2"></i>Medical Information
              </h6>
              <div className="row g-3 mb-4">
                <div className="col-md-12">
                  <label className="form-label">Medical Conditions (if any)</label>
                  <textarea
                    name="medicalConditions"
                    className="form-control"
                    rows="3"
                    placeholder="List any allergies, chronic conditions, or special medical needs..."
                    value={formData.medicalConditions}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>

              {/* Form Actions */}
              <div className="d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={handleCancelEdit}
                >
                  <i className="bi bi-x-circle me-2"></i>Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      {editingStudent ? 'Updating...' : 'Registering...'}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      {editingStudent ? 'Update Student' : 'Register Student'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                  Confirm Delete
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this student?</p>
                {studentToDelete && (
                  <div className="alert alert-warning">
                    <strong>Student Details:</strong><br />
                    <strong>Name:</strong> {studentToDelete.fullName}<br />
                    <strong>Roll Number:</strong> {studentToDelete.rollNumber}<br />
                    <strong>Class:</strong> {studentToDelete.classSection}<br />
                    <strong>Email:</strong> {studentToDelete.email}
                  </div>
                )}
                <p className="text-danger">
                  <small><strong>Warning:</strong> This action cannot be undone.</small>
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash me-2"></i>
                      Delete Student
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal 
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default StudentRegistration;
