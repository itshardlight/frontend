import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TimetableViewer from '../../components/timetable/TimetableViewer';
import axios from 'axios';
import '../../styles/Timetable.css';

const StudentTimetable = () => {
  const [user, setUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.role !== 'student') {
      navigate("/dashboard");
      return;
    }

    fetchStudentProfile();
  }, [navigate]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get('http://localhost:5000/api/profiles/me/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.profile) {
        setStudentProfile(response.data.profile);
      } else {
        setError('Student profile not found. Please contact administration.');
      }
    } catch (err) {
      console.error('Error fetching student profile:', err);
      setError('Failed to load student profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your timetable...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
            <div className="text-center">
              <button 
                className="btn btn-primary"
                onClick={handleBackToDashboard}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!studentProfile || !studentProfile.class || !studentProfile.section) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-warning">
              <i className="fas fa-info-circle me-2"></i>
              Your class and section information is not available. Please contact administration to update your profile.
            </div>
            <div className="text-center">
              <button 
                className="btn btn-primary"
                onClick={handleBackToDashboard}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <i className="fas fa-calendar-alt me-2 text-primary"></i>
                My Timetable
              </h2>
              <p className="text-muted mb-0">
                View your class schedule and subjects
              </p>
            </div>
            <button 
              className="btn btn-outline-primary"
              onClick={handleBackToDashboard}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Student Info */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <strong>Student Name:</strong>
                  <p className="mb-0">{studentProfile.firstName} {studentProfile.lastName}</p>
                </div>
                <div className="col-md-3">
                  <strong>Class:</strong>
                  <p className="mb-0">Class {studentProfile.class}</p>
                </div>
                <div className="col-md-3">
                  <strong>Section:</strong>
                  <p className="mb-0">Section {studentProfile.section}</p>
                </div>
                <div className="col-md-3">
                  <strong>Roll Number:</strong>
                  <p className="mb-0">{studentProfile.rollNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timetable */}
      <div className="row">
        <div className="col-12">
          <TimetableViewer
            className={studentProfile.class}
            section={studentProfile.section}
            readOnly={true}
          />
        </div>
      </div>

      {/* Info Note */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Note:</strong> This is your class timetable. If you notice any discrepancies, 
            please contact your class teacher or the administration office.
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;