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

  if (!studentProfile) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-warning">
              <i className="fas fa-info-circle me-2"></i>
              Your profile information is not available. Please contact administration to set up your profile.
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

  // Extract class and section from different possible data structures
  const getClassInfo = () => {
    // Check if data is from Profile model (academic.currentGrade)
    if (studentProfile.academic?.currentGrade && studentProfile.academic?.section) {
      return {
        class: studentProfile.academic.currentGrade,
        section: studentProfile.academic.section,
        rollNumber: studentProfile.academic.rollNumber
      };
    }
    // Check if data is from Student model (direct class/section)
    if (studentProfile.class && studentProfile.section) {
      return {
        class: studentProfile.class,
        section: studentProfile.section,
        rollNumber: studentProfile.rollNumber
      };
    }
    return null;
  };

  const classInfo = getClassInfo();

  if (!classInfo) {
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
                <div className="col-md-2">
                  <strong>Class:</strong>
                  <p className="mb-0">Class {classInfo.class}</p>
                </div>
                <div className="col-md-2">
                  <strong>Section:</strong>
                  <p className="mb-0">Section {classInfo.section}</p>
                </div>
                <div className="col-md-2">
                  <strong>Roll Number:</strong>
                  <p className="mb-0">{classInfo.rollNumber}</p>
                </div>
                <div className="col-md-3">
                  <strong>Academic Year:</strong>
                  <p className="mb-0">{new Date().getFullYear()}-{new Date().getFullYear() + 1}</p>
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
            className={classInfo.class}
            section={classInfo.section}
            readOnly={true}
          />
        </div>
      </div>

      {/* Info Note */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Note:</strong> This is your class timetable. If you notice any discrepancies or if the timetable appears empty, 
            please contact your class teacher or the administration office.
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;