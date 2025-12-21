import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminStudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    fetchStudentDetails();
  }, [id, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }
      
      const response = await axios.get(`http://localhost:5000/api/students/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setStudent(response.data.data);
        setEditData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load student details');
      }
    } catch (err) {
      console.error('Error fetching student:', err);
      setError(err.response?.data?.message || 'Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/students/${id}`,
        editData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        alert('Student updated successfully!');
        await fetchStudentDetails();
        setEditing(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update student');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData({ ...student });
  };

  const handleInputChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName) return "S";
    const initials = `${firstName[0]}${lastName ? lastName[0] : ''}`;
    return initials.toUpperCase();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button 
            className="btn btn-outline-danger btn-sm ms-3" 
            onClick={fetchStudentDetails}
          >
            Retry
          </button>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/admin')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Admin Panel
        </button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container py-5">
        <div className="alert alert-info" role="alert">
          <i className="bi bi-info-circle me-2"></i>
          Student not found
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/admin')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Admin Panel
        </button>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Top Navigation */}
      <nav className="navbar navbar-dark bg-dark shadow-sm">
        <div className="container-fluid px-4">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-person-badge me-2"></i>
            Student Profile
          </span>
          <button 
            className="btn btn-outline-light btn-sm" 
            onClick={() => navigate('/admin')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Admin Panel
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-5">
        {/* Header with Actions */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">Student Details</h2>
            <p className="text-muted mb-0">View and manage student information</p>
          </div>
          <div className="d-flex gap-2">
            {!editing ? (
              <button className="btn btn-primary" onClick={handleEdit}>
                <i className="bi bi-pencil me-2"></i>
                Edit Profile
              </button>
            ) : (
              <>
                <button className="btn btn-success" onClick={handleSave}>
                  <i className="bi bi-check-lg me-2"></i>
                  Save Changes
                </button>
                <button className="btn btn-secondary" onClick={handleCancel}>
                  <i className="bi bi-x-lg me-2"></i>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div className="row">
          {/* Left Column - Profile Card */}
          <div className="col-lg-4">
            <div className="card shadow-sm mb-4">
              <div className="card-body text-center py-4">
                <div 
                  className="rounded-circle mb-3 mx-auto d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '120px',
                    height: '120px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    fontSize: '2.5rem',
                    fontWeight: 'bold'
                  }}
                >
                  {getInitials(student.firstName, student.lastName)}
                </div>
                <h4 className="mb-1">{student.firstName} {student.lastName}</h4>
                <p className="text-muted mb-2">{student.email}</p>
                <span className={`badge ${student.status === 'active' ? 'bg-success' : 'bg-warning'} fs-6`}>
                  {student.status}
                </span>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="card shadow-sm">
              <div className="card-header bg-secondary text-white">
                <h6 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Quick Information
                </h6>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Roll Number:</span>
                  <span className="badge bg-primary fs-6">{student.rollNumber}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Class:</span>
                  <span className="badge bg-info fs-6">{student.class}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Section:</span>
                  <span className="badge bg-warning text-dark fs-6">{student.section}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Admission Date:</span>
                  <span className="fw-bold">
                    {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="col-lg-8">
            {/* Basic Information */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-person-circle me-2"></i>
                  Basic Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">First Name:</label>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editData.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                    ) : (
                      <p className="mb-0">{student.firstName}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Last Name:</label>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editData.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                    ) : (
                      <p className="mb-0">{student.lastName}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Date of Birth:</label>
                    {editing ? (
                      <input
                        type="date"
                        className="form-control"
                        value={editData.dateOfBirth ? new Date(editData.dateOfBirth).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      />
                    ) : (
                      <p className="mb-0">
                        {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not specified'}
                      </p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Gender:</label>
                    {editing ? (
                      <select
                        className="form-select"
                        value={editData.gender || ''}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="mb-0 text-capitalize">{student.gender || 'Not specified'}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Blood Group:</label>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editData.bloodGroup || ''}
                        onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                      />
                    ) : (
                      <p className="mb-0">{student.bloodGroup || 'Not specified'}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Religion:</label>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editData.religion || ''}
                        onChange={(e) => handleInputChange('religion', e.target.value)}
                      />
                    ) : (
                      <p className="mb-0">{student.religion || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="bi bi-telephone me-2"></i>
                  Contact Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Email:</label>
                    {editing ? (
                      <input
                        type="email"
                        className="form-control"
                        value={editData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    ) : (
                      <p className="mb-0">{student.email}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Phone:</label>
                    {editing ? (
                      <input
                        type="tel"
                        className="form-control"
                        value={editData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    ) : (
                      <p className="mb-0">{student.phone || 'Not provided'}</p>
                    )}
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">Address:</label>
                    {editing ? (
                      <textarea
                        className="form-control"
                        rows="2"
                        value={editData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    ) : (
                      <p className="mb-0">{student.address || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  <i className="bi bi-mortarboard me-2"></i>
                  Academic Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Roll Number:</label>
                    <p className="mb-0">
                      <span className="badge bg-primary fs-6">{student.rollNumber}</span>
                    </p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Class:</label>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editData.class || ''}
                        onChange={(e) => handleInputChange('class', e.target.value)}
                      />
                    ) : (
                      <p className="mb-0">
                        <span className="badge bg-info fs-6">{student.class}</span>
                      </p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Section:</label>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editData.section || ''}
                        onChange={(e) => handleInputChange('section', e.target.value)}
                      />
                    ) : (
                      <p className="mb-0">
                        <span className="badge bg-warning text-dark fs-6">{student.section}</span>
                      </p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Admission Date:</label>
                    {editing ? (
                      <input
                        type="date"
                        className="form-control"
                        value={editData.admissionDate ? new Date(editData.admissionDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleInputChange('admissionDate', e.target.value)}
                      />
                    ) : (
                      <p className="mb-0">
                        {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'Not specified'}
                      </p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Status:</label>
                    {editing ? (
                      <select
                        className="form-select"
                        value={editData.status || 'active'}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    ) : (
                      <p className="mb-0">
                        <span className={`badge ${student.status === 'active' ? 'bg-success' : 'bg-warning'}`}>
                          {student.status}
                        </span>
                      </p>
                    )}
                  </div>
                  {student.previousSchool && (
                    <div className="col-12">
                      <label className="form-label fw-bold">Previous School:</label>
                      {editing ? (
                        <input
                          type="text"
                          className="form-control"
                          value={editData.previousSchool || ''}
                          onChange={(e) => handleInputChange('previousSchool', e.target.value)}
                        />
                      ) : (
                        <p className="mb-0">{student.previousSchool}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Parent/Guardian Information */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">
                  <i className="bi bi-people me-2"></i>
                  Parent/Guardian Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Father's Name:</label>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editData.fatherName || ''}
                        onChange={(e) => handleInputChange('fatherName', e.target.value)}
                      />
                    ) : (
                      <p className="mb-0">{student.fatherName || 'Not provided'}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Mother's Name:</label>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editData.motherName || ''}
                        onChange={(e) => handleInputChange('motherName', e.target.value)}
                      />
                    ) : (
                      <p className="mb-0">{student.motherName || 'Not provided'}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Guardian's Name:</label>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editData.guardianName || ''}
                        onChange={(e) => handleInputChange('guardianName', e.target.value)}
                      />
                    ) : (
                      <p className="mb-0">{student.guardianName || 'Not provided'}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Parent Email:</label>
                    {editing ? (
                      <input
                        type="email"
                        className="form-control"
                        value={editData.parentEmail || ''}
                        onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                      />
                    ) : (
                      <p className="mb-0">{student.parentEmail || 'Not provided'}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Parent Phone:</label>
                    {editing ? (
                      <input
                        type="tel"
                        className="form-control"
                        value={editData.parentPhone || ''}
                        onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                      />
                    ) : (
                      <p className="mb-0">{student.parentPhone || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(student.emergencyContact || student.medicalInfo || student.notes) && (
              <div className="card shadow-sm">
                <div className="card-header bg-danger text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Additional Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {student.emergencyContact && (
                      <div className="col-12">
                        <label className="form-label fw-bold">Emergency Contact:</label>
                        {editing ? (
                          <input
                            type="text"
                            className="form-control"
                            value={editData.emergencyContact || ''}
                            onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                          />
                        ) : (
                          <p className="mb-0">{student.emergencyContact}</p>
                        )}
                      </div>
                    )}
                    {student.medicalInfo && (
                      <div className="col-12">
                        <label className="form-label fw-bold">Medical Information:</label>
                        {editing ? (
                          <textarea
                            className="form-control"
                            rows="2"
                            value={editData.medicalInfo || ''}
                            onChange={(e) => handleInputChange('medicalInfo', e.target.value)}
                          />
                        ) : (
                          <p className="mb-0">{student.medicalInfo}</p>
                        )}
                      </div>
                    )}
                    {student.notes && (
                      <div className="col-12">
                        <label className="form-label fw-bold">Notes:</label>
                        {editing ? (
                          <textarea
                            className="form-control"
                            rows="3"
                            value={editData.notes || ''}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                          />
                        ) : (
                          <p className="mb-0">{student.notes}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStudentProfile;
