import React, { useState } from 'react';
import profileService from '../../services/profileService';
import './ProfileCreationForm.css';

const ProfileCreationForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    academic: {
      currentGrade: '',
      section: '',
      admissionDate: '',
      previousSchool: ''
    },
    parentInfo: {
      fatherName: '',
      motherName: '',
      guardianName: '',
      parentPhone: '',
      parentEmail: '',
      emergencyContact: '',
      occupation: ''
    },
    medicalInfo: {
      conditions: '',
      allergies: '',
      medications: '',
      emergencyMedicalContact: ''
    },
    feeInfo: {
      totalFee: 0
    },
    userRole: 'student'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [credentials, setCredentials] = useState(null);

  const handleChange = (section, field, value) => {
    if (section) {
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await profileService.createProfile(formData);
      setCredentials(response.credentials);
      onSuccess && onSuccess(response.profile);
    } catch (err) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  if (credentials) {
    return (
      <div className="credentials-display">
        <h3>Profile Created Successfully!</h3>
        <div className="credentials-info">
          <h4>Login Credentials:</h4>
          <div className="credential-item">
            <label>Student Email:</label>
            <span>{credentials.email}</span>
          </div>
          <div className="credential-item">
            <label>Student Password:</label>
            <span>{credentials.password}</span>
          </div>
          {credentials.parentEmail && (
            <>
              <div className="credential-item">
                <label>Parent Email:</label>
                <span>{credentials.parentEmail}</span>
              </div>
              <div className="credential-item">
                <label>Parent Password:</label>
                <span>{credentials.parentPassword}</span>
              </div>
            </>
          )}
        </div>
        <div className="credentials-note">
          <p><strong>Important:</strong> Please save these credentials and share them with the student and parent. They should change their passwords on first login.</p>
        </div>
        <button onClick={() => window.location.reload()} className="btn-continue">
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="profile-creation-form">
      <div className="form-header">
        <h2>Create New Profile</h2>
        <button onClick={onCancel} className="btn-close">×</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-field">
              <label>First Name *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange(null, 'firstName', e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>Last Name *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange(null, 'lastName', e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>Date of Birth *</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange(null, 'dateOfBirth', e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange(null, 'gender', e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-field">
              <label>Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => handleChange(null, 'bloodGroup', e.target.value)}
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
            <div className="form-field">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange(null, 'phone', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>User Role</label>
              <select
                value={formData.userRole}
                onChange={(e) => handleChange(null, 'userRole', e.target.value)}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="fee_department">Fee Department</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="form-section">
          <h3>Address Information</h3>
          <div className="form-grid">
            <div className="form-field full-width">
              <label>Street Address</label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => handleChange('address', 'street', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>City</label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => handleChange('address', 'city', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>State</label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => handleChange('address', 'state', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>ZIP Code</label>
              <input
                type="text"
                value={formData.address.zipCode}
                onChange={(e) => handleChange('address', 'zipCode', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Academic Information (for students) */}
        {formData.userRole === 'student' && (
          <div className="form-section">
            <h3>Academic Information</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Current Grade *</label>
                <select
                  value={formData.academic.currentGrade}
                  onChange={(e) => handleChange('academic', 'currentGrade', e.target.value)}
                  required
                >
                  <option value="">Select Grade</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
              </div>
              <div className="form-field">
                <label>Section *</label>
                <select
                  value={formData.academic.section}
                  onChange={(e) => handleChange('academic', 'section', e.target.value)}
                  required
                >
                  <option value="">Select Section</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
              <div className="form-field">
                <label>Admission Date</label>
                <input
                  type="date"
                  value={formData.academic.admissionDate}
                  onChange={(e) => handleChange('academic', 'admissionDate', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Previous School</label>
                <input
                  type="text"
                  value={formData.academic.previousSchool}
                  onChange={(e) => handleChange('academic', 'previousSchool', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Parent Information (for students) */}
        {formData.userRole === 'student' && (
          <div className="form-section">
            <h3>Parent/Guardian Information</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Father's Name</label>
                <input
                  type="text"
                  value={formData.parentInfo.fatherName}
                  onChange={(e) => handleChange('parentInfo', 'fatherName', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Mother's Name</label>
                <input
                  type="text"
                  value={formData.parentInfo.motherName}
                  onChange={(e) => handleChange('parentInfo', 'motherName', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Guardian's Name</label>
                <input
                  type="text"
                  value={formData.parentInfo.guardianName}
                  onChange={(e) => handleChange('parentInfo', 'guardianName', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Parent Phone</label>
                <input
                  type="tel"
                  value={formData.parentInfo.parentPhone}
                  onChange={(e) => handleChange('parentInfo', 'parentPhone', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Parent Email</label>
                <input
                  type="email"
                  value={formData.parentInfo.parentEmail}
                  onChange={(e) => handleChange('parentInfo', 'parentEmail', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Emergency Contact</label>
                <input
                  type="tel"
                  value={formData.parentInfo.emergencyContact}
                  onChange={(e) => handleChange('parentInfo', 'emergencyContact', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Occupation</label>
                <input
                  type="text"
                  value={formData.parentInfo.occupation}
                  onChange={(e) => handleChange('parentInfo', 'occupation', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Medical Information */}
        <div className="form-section">
          <h3>Medical Information</h3>
          <div className="form-grid">
            <div className="form-field full-width">
              <label>Medical Conditions</label>
              <textarea
                value={formData.medicalInfo.conditions}
                onChange={(e) => handleChange('medicalInfo', 'conditions', e.target.value)}
                rows="3"
              />
            </div>
            <div className="form-field full-width">
              <label>Allergies</label>
              <textarea
                value={formData.medicalInfo.allergies}
                onChange={(e) => handleChange('medicalInfo', 'allergies', e.target.value)}
                rows="2"
              />
            </div>
            <div className="form-field full-width">
              <label>Current Medications</label>
              <textarea
                value={formData.medicalInfo.medications}
                onChange={(e) => handleChange('medicalInfo', 'medications', e.target.value)}
                rows="2"
              />
            </div>
            <div className="form-field">
              <label>Emergency Medical Contact</label>
              <input
                type="tel"
                value={formData.medicalInfo.emergencyMedicalContact}
                onChange={(e) => handleChange('medicalInfo', 'emergencyMedicalContact', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Fee Information (for students) */}
        {formData.userRole === 'student' && (
          <div className="form-section">
            <h3>Fee Information</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Total Annual Fee</label>
                <input
                  type="number"
                  value={formData.feeInfo.totalFee}
                  onChange={(e) => handleChange('feeInfo', 'totalFee', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Creating...' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileCreationForm;