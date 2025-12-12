import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const StudentRegistration = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("list");
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

  // Dummy student data
  const students = [
    {
      id: 1,
      name: "John Doe",
      rollNo: "001",
      class: "10-A",
      email: "john@example.com",
      phone: "+1234567890",
      admissionDate: "2024-01-15",
      status: "active"
    },
    {
      id: 2,
      name: "Jane Smith",
      rollNo: "002",
      class: "10-A",
      email: "jane@example.com",
      phone: "+1234567891",
      admissionDate: "2024-01-16",
      status: "active"
    },
    {
      id: 3,
      name: "Mike Johnson",
      rollNo: "003",
      class: "10-B",
      email: "mike@example.com",
      phone: "+1234567892",
      admissionDate: "2024-01-17",
      status: "active"
    },
    {
      id: 4,
      name: "Sarah Williams",
      rollNo: "004",
      class: "9-A",
      email: "sarah@example.com",
      phone: "+1234567893",
      admissionDate: "2024-01-18",
      status: "inactive"
    }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Student registration submitted! (Dummy action)");
    console.log("Form Data:", formData);
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
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-primary">
            <div className="card-body text-center">
              <i className="bi bi-people-fill text-primary" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{students.length}</h3>
              <small className="text-muted">Total Students</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-success">
            <div className="card-body text-center">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{students.filter(s => s.status === "active").length}</h3>
              <small className="text-muted">Active Students</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-warning">
            <div className="card-body text-center">
              <i className="bi bi-person-plus-fill text-warning" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">12</h3>
              <small className="text-muted">New This Month</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-info">
            <div className="card-body text-center">
              <i className="bi bi-door-open text-info" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">8</h3>
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
            onClick={() => setActiveTab("register")}
          >
            <i className="bi bi-person-plus me-2"></i>Register New Student
          </button>
        </li>
      </ul>

      {/* Student List Tab */}
      {activeTab === "list" && (
        <div className="card shadow-sm">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Registered Students</h5>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search students..."
                style={{ width: "250px" }}
              />
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
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="align-middle">
                        <strong>{student.rollNo}</strong>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                               style={{ width: "35px", height: "35px", fontSize: "14px" }}>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          {student.name}
                        </div>
                      </td>
                      <td className="align-middle">
                        <span className="badge bg-info">{student.class}</span>
                      </td>
                      <td className="align-middle">{student.email}</td>
                      <td className="align-middle">{student.phone}</td>
                      <td className="align-middle">{student.admissionDate}</td>
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
                          <button className="btn btn-outline-success" title="Edit">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-outline-danger" title="Delete">
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card-footer bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted">Showing {students.length} students</span>
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
      )}

      {/* Registration Form Tab */}
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
                <button type="button" className="btn btn-outline-secondary">
                  <i className="bi bi-x-circle me-2"></i>Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-check-circle me-2"></i>Register Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRegistration;
