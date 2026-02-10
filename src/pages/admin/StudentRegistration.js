import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { studentService } from "../../services/studentService";
import "./StudentRegistration.css";

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
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    class: "",
    section: "",
    rollNumber: "",
    admissionDate: new Date().toISOString().split('T')[0], // Set to today's date
    fatherName: "",
    fatherContact: "",
    motherName: "",
    motherContact: "",
    guardianName: "",
    guardianContact: "",
    guardianEmail: "",
    guardianType: "Father",
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
    
    // Auto-generate roll number when firstName, class, or section changes
    if (name === 'firstName' || name === 'class' || name === 'section') {
      const firstName = name === 'firstName' ? value : formData.firstName;
      const classValue = name === 'class' ? value : formData.class;
      const section = name === 'section' ? value : formData.section;
      
      if (firstName && classValue && section) {
        try {
          // Generate unique roll number from backend
          const rollResponse = await studentService.generateRollNumber(classValue, section);
          const rollNumber = rollResponse.data.rollNumber;
          
          updatedFormData.rollNumber = rollNumber;
          
          // Auto-generate email: firstname + rollnumber + @gmail.com
          updatedFormData.email = `${firstName.toLowerCase()}${rollNumber}@gmail.com`;
        } catch (error) {
          console.error('Error generating roll number:', error);
          // Fallback to client-side generation
          const rollNumber = `${classValue}${section}${Math.floor(100 + Math.random() * 900)}`;
          
          updatedFormData.rollNumber = rollNumber;
          updatedFormData.email = `${firstName.toLowerCase()}${rollNumber}@gmail.com`;
        }
      } else {
        // Clear auto-generated fields if required data is missing
        updatedFormData.rollNumber = "";
        updatedFormData.email = "";
      }
    }
    
    // Auto-populate guardian fields based on guardianType selection
    if (name === 'guardianType') {
      if (value === 'Father') {
        updatedFormData.guardianName = formData.fatherName;
        updatedFormData.guardianContact = formData.fatherContact;
      } else if (value === 'Mother') {
        updatedFormData.guardianName = formData.motherName;
        updatedFormData.guardianContact = formData.motherContact;
      }
      // If 'Other', keep the fields editable (don't auto-populate)
    }
    
    // Auto-update guardian fields if father/mother info changes and they are selected as guardian
    if (name === 'fatherName' && formData.guardianType === 'Father') {
      updatedFormData.guardianName = value;
    }
    if (name === 'fatherContact' && formData.guardianType === 'Father') {
      updatedFormData.guardianContact = value;
    }
    if (name === 'motherName' && formData.guardianType === 'Mother') {
      updatedFormData.guardianName = value;
    }
    if (name === 'motherContact' && formData.guardianType === 'Mother') {
      updatedFormData.guardianContact = value;
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
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      class: "",
      section: "",
      rollNumber: "",
      admissionDate: new Date().toISOString().split('T')[0], // Reset to today's date
      fatherName: "",
      fatherContact: "",
      motherName: "",
      motherContact: "",
      guardianName: "",
      guardianContact: "",
      guardianEmail: "",
      guardianType: "Father",
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
      // Validate required fields before submission
      const missingFields = [];
      
      if (!formData.firstName) missingFields.push("First Name");
      if (!formData.lastName) missingFields.push("Last Name");
      if (!formData.dateOfBirth) missingFields.push("Date of Birth");
      if (!formData.gender) missingFields.push("Gender");
      if (!formData.phone) missingFields.push("Phone Number");
      if (!formData.address) missingFields.push("Address");
      if (!formData.city) missingFields.push("City");
      if (!formData.state) missingFields.push("State");
      if (!formData.class) missingFields.push("Class");
      if (!formData.section) missingFields.push("Section");
      if (!formData.rollNumber) missingFields.push("Roll Number");
      if (!formData.admissionDate) missingFields.push("Admission Date");
      if (!formData.guardianName) missingFields.push("Guardian Name");
      if (!formData.guardianContact) missingFields.push("Guardian Contact");
      if (!formData.guardianEmail) missingFields.push("Guardian Email");
      
      if (missingFields.length > 0) {
        setError(`Please fill in the following required fields: ${missingFields.join(", ")}`);
        setLoading(false);
        return;
      }

      console.log("Submitting student data:", formData);
      await studentService.createStudent(formData);
      setSuccess("Student registered successfully! Login credentials have been created.");
      
      // Reset form
      resetForm();

      // Reload stats
      loadStats();
      if (activeTab === "manage") {
        fetchStudents(); // Refresh student list if on manage tab
      }
      
    } catch (err) {
      console.error("Registration error:", err);
      setError(`Failed to register student: ${err.message}`);
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
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom">
            <h5 className="mb-0 text-dark">
              <i className="bi bi-person-plus me-2"></i>
              New Student Registration Form
            </h5>
            <small className="text-muted">Fill in all required fields marked with *</small>
          </div>
          <div className="card-body p-4">
          <form onSubmit={handleSubmit} className="student-registration-form">
            {/* Personal Information */}
            <div className="form-section">
              <h6 className="section-title">
                <i className="bi bi-person-circle"></i>Personal Information
              </h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">
                    First Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-control"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">
                    Last Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-control"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">
                    Date of Birth <span className="text-danger">*</span>
                  </label>
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
                  <label className="form-label">
                    Gender <span className="text-danger">*</span>
                  </label>
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
              </div>
            </div>

            {/* Contact Information */}
            <div className="form-section">
              <h6 className="section-title">
                <i className="bi bi-telephone"></i>Contact Information
              </h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control bg-light"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Auto-generated"
                    readOnly
                    required
                    title="Email will be auto-generated based on first name and roll number"
                  />
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Auto-generated as: firstname + rollnumber + @gmail.com
                  </small>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="form-section">
              <h6 className="section-title">
                <i className="bi bi-geo-alt"></i>Address Information
              </h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Street Address <span className="text-danger">*</span>
                  </label>
                  <textarea
                    name="address"
                    className="form-control"
                    rows="2"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete street address"
                    required
                  ></textarea>
                </div>
                <div className="col-md-3">
                  <label className="form-label">
                    City <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">
                    State <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    className="form-control"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="form-section">
              <h6 className="section-title">
                <i className="bi bi-book"></i>Academic Information
              </h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">
                    Class <span className="text-danger">*</span>
                  </label>
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
                  <label className="form-label">
                    Section <span className="text-danger">*</span>
                  </label>
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
                  <label className="form-label">
                    Admission Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="admissionDate"
                    className="form-control"
                    value={formData.admissionDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Roll Number <span className="text-danger">*</span>
                  </label>
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
                    <span className="input-group-text bg-white">
                      <i className="bi bi-gear text-secondary" 
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
                            
                            // Update both roll number and email
                            const newEmail = formData.firstName 
                              ? `${formData.firstName.toLowerCase()}${rollNumber}@gmail.com`
                              : "";
                            
                            setFormData({
                              ...formData,
                              rollNumber,
                              email: newEmail
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
                <div className="col-md-6">
                  <label className="form-label">Previous School</label>
                  <input
                    type="text"
                    name="previousSchool"
                    className="form-control"
                    value={formData.previousSchool}
                    onChange={handleChange}
                    placeholder="Enter previous school name"
                  />
                </div>
              </div>
            </div>

            {/* Family Information */}
            <div className="form-section">
              <h6 className="section-title">
                <i className="bi bi-people"></i>Family Information
              </h6>
              
              {/* Parents Information */}
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Enter parent details below. Guardian information will auto-populate based on your selection.
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    <i className="bi bi-person me-1"></i>Father's Name
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    className="form-control"
                    value={formData.fatherName}
                    onChange={handleChange}
                    placeholder="Enter father's name"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    <i className="bi bi-telephone me-1"></i>Father's Contact
                  </label>
                  <input
                    type="tel"
                    name="fatherContact"
                    className="form-control"
                    value={formData.fatherContact}
                    onChange={handleChange}
                    placeholder="Enter father's contact"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    <i className="bi bi-person me-1"></i>Mother's Name
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    className="form-control"
                    value={formData.motherName}
                    onChange={handleChange}
                    placeholder="Enter mother's name"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    <i className="bi bi-telephone me-1"></i>Mother's Contact
                  </label>
                  <input
                    type="tel"
                    name="motherContact"
                    className="form-control"
                    value={formData.motherContact}
                    onChange={handleChange}
                    placeholder="Enter mother's contact"
                  />
                </div>
              </div>

              {/* Guardian Information */}
              <div className="guardian-subsection">
                <h6>
                  <i className="bi bi-shield-check me-2"></i>Primary Guardian Details
                </h6>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label">
                      Guardian Type <span className="text-danger">*</span>
                    </label>
                    <select
                      name="guardianType"
                      className="form-select"
                      value={formData.guardianType}
                      onChange={handleChange}
                      required
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">
                      Guardian Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="guardianName"
                      className="form-control"
                      value={formData.guardianName}
                      onChange={handleChange}
                      placeholder="Guardian name"
                      required
                      readOnly={formData.guardianType !== 'Other'}
                      style={{
                        backgroundColor: formData.guardianType !== 'Other' ? '#e9ecef' : 'white'
                      }}
                    />
                    {formData.guardianType !== 'Other' && (
                      <small className="text-muted">
                        <i className="bi bi-lock me-1"></i>
                        Auto-filled from {formData.guardianType.toLowerCase()}'s name
                      </small>
                    )}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">
                      Guardian Contact <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      name="guardianContact"
                      className="form-control"
                      value={formData.guardianContact}
                      onChange={handleChange}
                      placeholder="Guardian contact"
                      required
                      readOnly={formData.guardianType !== 'Other'}
                      style={{
                        backgroundColor: formData.guardianType !== 'Other' ? '#e9ecef' : 'white'
                      }}
                    />
                    {formData.guardianType !== 'Other' && (
                      <small className="text-muted">
                        <i className="bi bi-lock me-1"></i>
                        Auto-filled from {formData.guardianType.toLowerCase()}'s contact
                      </small>
                    )}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">
                      Guardian Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      name="guardianEmail"
                      className="form-control"
                      value={formData.guardianEmail}
                      onChange={handleChange}
                      placeholder="guardian@example.com"
                      required
                    />
                    <small className="text-muted">
                      <i className="bi bi-envelope me-1"></i>
                      Login credentials will be sent here
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="form-section">
              <h6 className="section-title">
                <i className="bi bi-heart-pulse"></i>Medical Information
              </h6>
              <div className="row g-3">
                <div className="col-md-12">
                  <label className="form-label">
                    Medical Conditions (if any)
                  </label>
                  <textarea
                    name="medicalConditions"
                    className="form-control"
                    rows="3"
                    placeholder="List any allergies, chronic conditions, or special medical needs..."
                    value={formData.medicalConditions}
                    onChange={handleChange}
                  ></textarea>
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    This information helps us provide better care for the student
                  </small>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={resetForm}
                disabled={loading}
              >
                <i className="bi bi-x-circle me-2"></i>Clear Form
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Registering Student...
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