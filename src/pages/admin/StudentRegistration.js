import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { studentService } from "../../services/studentService";

const StudentRegistration = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("register");
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
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

  // Load stats on component mount
  useEffect(() => {
    loadStats();
    if (activeTab === "manage") {
      fetchStudents();
    }
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const response = await studentService.getStudentStats();
      setStats(response.data);
    } catch (err) {
      console.error("Failed to load stats:", err);
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
        // Update stats with actual data
        setStats(prev => ({
          ...prev,
          totalStudents: response.data.data.length,
          activeStudents: response.data.data.filter(s => s.status === 'active').length
        }));
      }
    } catch (err) {
      setStudentsError("Failed to load students");
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student? This will also delete their user account.")) {
      return;
    }

    try {
      await studentService.deleteStudent(studentId);
      setSuccess("Student deleted successfully!");
      fetchStudents();
      loadStats();
    } catch (err) {
      setStudentsError(err.message || "Failed to delete student");
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    const updatedFormData = { ...formData, [name]: value };
    
    // Auto-generate roll number and email when firstName, class, or section changes
    if (name === 'firstName' || name === 'class' || name === 'section') {
      const firstName = name === 'firstName' ? value : formData.firstName;
      const classValue = name === 'class' ? value : formData.class;
      const section = name === 'section' ? value : formData.section;
      
      if (firstName && classValue && section) {
        try {
          // Generate unique roll number from backend
          const rollResponse = await studentService.generateRollNumber(classValue, section);
          const rollNumber = rollResponse.data.rollNumber;
          
          // Generate email: firstname + rollnumber + @gmail.com
          const email = `${firstName.toLowerCase()}${rollNumber}@gmail.com`;
          
          updatedFormData.rollNumber = rollNumber;
          updatedFormData.email = email;
        } catch (error) {
          console.error('Error generating roll number:', error);
          // Fallback to client-side generation
          const rollNumber = `${classValue}${section}${Math.floor(100 + Math.random() * 900)}`;
          const email = `${firstName.toLowerCase()}${rollNumber}@gmail.com`;
          
          updatedFormData.rollNumber = rollNumber;
          updatedFormData.email = email;
        }
      } else {
        // Clear auto-generated fields if required data is missing
        updatedFormData.rollNumber = "";
        updatedFormData.email = "";
      }
    }
    
    setFormData(updatedFormData);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await studentService.createStudent(formData);
      setSuccess("Student registered successfully!");
      
      // Reset form
      resetForm();

      // Reload stats
      loadStats();
      fetchStudents(); // Refresh student list if on manage tab
      
    } catch (err) {
      setError(`Failed to register student: ` + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get unique classes and sections for filters
  const uniqueClasses = [...new Set(students.map(s => s.class))].sort();
  const uniqueSections = [...new Set(students.map(s => s.section))].sort();

  // Filter students based on search and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === "" || 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = filterClass === "" || student.class === filterClass;
    const matchesSection = filterSection === "" || student.section === filterSection;

    return matchesSearch && matchesClass && matchesSection;
  });

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-people me-2 text-primary"></i>
            My Students
          </h2>
          <p className="text-muted mb-0">Register new students and manage existing records</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <div className="badge bg-primary fs-6">
            {stats.totalStudents} Total Students
          </div>
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-2"></i>Back
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            <i className="bi bi-person-plus me-2"></i>
            Register New Student
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === "manage" ? "active" : ""}`}
            onClick={() => setActiveTab("manage")}
          >
            <i className="bi bi-people me-2"></i>
            Manage Students ({stats.totalStudents})
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
      {studentsError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {studentsError}
          <button type="button" className="btn-close" onClick={() => setStudentsError("")}></button>
        </div>
      )}

      {/* Register Tab Content */}
      {activeTab === "register" && (
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h5 className="mb-0">New Student Registration Form</h5>
          </div>
          <div className="card-body">
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
                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    className="form-control bg-light"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    readOnly
                    placeholder="Auto-generated"
                    title="Email will be auto-generated as firstname+rollnumber@gmail.com"
                  />
                  <span className="input-group-text">
                    <i className="bi bi-gear text-muted" 
                       title="Auto-generated"></i>
                  </span>
                </div>
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Auto-generated as firstname+rollnumber@gmail.com
                </small>
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
                <div className="input-group">
                  <input
                    type="text"
                    name="rollNumber"
                    className="form-control bg-light"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    required
                    readOnly
                    placeholder="Auto-generated"
                    title="Roll number will be auto-generated based on class and section"
                  />
                  <span className="input-group-text">
                    <i className="bi bi-gear text-muted" 
                       title="Auto-generated"></i>
                  </span>
                  {formData.class && formData.section && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={async () => {
                        try {
                          const rollResponse = await studentService.generateRollNumber(formData.class, formData.section);
                          const rollNumber = rollResponse.data.rollNumber;
                          const email = formData.firstName ? 
                            `${formData.firstName.toLowerCase()}${rollNumber}@gmail.com` : 
                            formData.email;
                          
                          setFormData({
                            ...formData,
                            rollNumber,
                            email
                          });
                        } catch (error) {
                          setError('Failed to generate new roll number: ' + error.message);
                        }
                      }}
                      title="Generate new roll number"
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                    </button>
                  )}
                </div>
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Auto-generated when class and section are selected
                </small>
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
                onClick={resetForm}
              >
                <i className="bi bi-x-circle me-2"></i>Clear Form
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Registering...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Register Student
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      )}

      {/* Manage Students Tab Content */}
      {activeTab === "manage" && (
        <>
          {/* Search and Filter Section */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small">Search Students</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, roll number, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small">Filter by Class</label>
                  <select
                    className="form-select"
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                  >
                    <option value="">All Classes</option>
                    {uniqueClasses.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label small">Filter by Section</label>
                  <select
                    className="form-select"
                    value={filterSection}
                    onChange={(e) => setFilterSection(e.target.value)}
                  >
                    <option value="">All Sections</option>
                    {uniqueSections.map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-0">
                {filteredStudents.length} Student{filteredStudents.length !== 1 ? 's' : ''} Found
              </h5>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-success btn-sm"
                onClick={() => setActiveTab("register")}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add New Student
              </button>
              <button 
                className="btn btn-outline-primary btn-sm"
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
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Students Table */}
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
                    {studentsLoading ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <div className="text-muted">
                            <i className="bi bi-search fa-2x mb-2"></i>
                            <p>No students found</p>
                            {searchTerm || filterClass || filterSection ? (
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => {
                                  setSearchTerm("");
                                  setFilterClass("");
                                  setFilterSection("");
                                }}
                              >
                                Clear Filters
                              </button>
                            ) : (
                              <button 
                                className="btn btn-sm btn-primary"
                                onClick={() => setActiveTab("register")}
                              >
                                Register First Student
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
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
                                <i className="bi bi-eye me-1"></i>
                                View
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteStudent(student._id)}
                              >
                                <i className="bi bi-trash me-1"></i>
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

          
        </>
      )}

    </div>
  );
};

export default StudentRegistration;