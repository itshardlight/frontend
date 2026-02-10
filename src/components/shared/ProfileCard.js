import React, { useState, useEffect } from 'react';
import profileService from '../../services/profileService';
import { AchievementSection } from '../student';
import FeeSection from './FeeSection';
import AcademicSection from './AcademicSection';
import './ProfileCard.css';

const ProfileCard = ({ profileId, currentUser }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = profileId 
        ? await profileService.getProfile(profileId)
        : await profileService.getMyProfile();
      setProfile(response.profile);
      setEditData(response.profile);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditData({ ...profile });
  };

  const handleSave = async () => {
    try {
      const updates = getUpdatesForRole();
      await profileService.updateProfile(profile._id, updates);
      await fetchProfile();
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData({ ...profile });
  };

  const getUpdatesForRole = () => {
    const { role } = currentUser;
    let updates = {};

    switch (role) {
      case 'admin':
        updates = editData;
        break;
      case 'teacher':
        updates = {
          academic: editData.academic,
          medicalInfo: editData.medicalInfo
        };
        break;
      case 'fee_department':
        updates = {
          feeInfo: editData.feeInfo
        };
        break;
      case 'student':
        updates = {
          phone: editData.phone,
          address: editData.address,
          profilePicture: editData.profilePicture
        };
        break;
      default:
        updates = {};
    }

    return updates;
  };

  const canEdit = () => {
    const { role } = currentUser;
    if (role === 'parent') return false;
    if (role === 'student' && profile?.userId?._id !== currentUser.id) return false;
    return ['admin', 'teacher', 'fee_department', 'student'].includes(role);
  };

  const renderBasicInfo = () => (
    <div className="profile-section">
      <h3>Basic Information</h3>
      <div className="profile-grid">
        <div className="profile-field">
          <label>Full Name:</label>
          <span>{profile.fullName}</span>
        </div>
        <div className="profile-field">
          <label>Date of Birth:</label>
          <span>{new Date(profile.dateOfBirth).toLocaleDateString()}</span>
        </div>
        <div className="profile-field">
          <label>Gender:</label>
          <span className="capitalize">{profile.gender}</span>
        </div>
        <div className="profile-field">
          <label>Blood Group:</label>
          <span>{profile.bloodGroup || 'Not specified'}</span>
        </div>
        <div className="profile-field">
          <label>Phone:</label>
          {editing && currentUser.role === 'student' ? (
            <input
              type="tel"
              value={editData.phone || ''}
              onChange={(e) => setEditData({...editData, phone: e.target.value})}
            />
          ) : (
            <span>{profile.phone || 'Not provided'}</span>
          )}
        </div>
        <div className="profile-field">
          <label>Email:</label>
          <span>{profile.userId?.email}</span>
        </div>
      </div>
    </div>
  );

  const renderAddressInfo = () => (
    <div className="profile-section">
      <h3>Address Information</h3>
      <div className="profile-grid">
        <div className="profile-field full-width">
          <label>Street Address:</label>
          {editing && currentUser.role === 'student' ? (
            <input
              type="text"
              value={editData.address?.street || ''}
              onChange={(e) => setEditData({
                ...editData, 
                address: {...editData.address, street: e.target.value}
              })}
            />
          ) : (
            <span>{profile.address?.street || 'Not provided'}</span>
          )}
        </div>
        <div className="profile-field">
          <label>City:</label>
          {editing && currentUser.role === 'student' ? (
            <input
              type="text"
              value={editData.address?.city || ''}
              onChange={(e) => setEditData({
                ...editData, 
                address: {...editData.address, city: e.target.value}
              })}
            />
          ) : (
            <span>{profile.address?.city || 'Not provided'}</span>
          )}
        </div>
        <div className="profile-field">
          <label>State:</label>
          <span>{profile.address?.state || 'Not provided'}</span>
        </div>
      </div>
    </div>
  );

  const renderParentInfo = () => {
    if (currentUser.role === 'student' && profile.parentInfo) {
      // Students see limited parent info
      return (
        <div className="profile-section">
          <h3>Parent/Guardian Information</h3>
          <div className="profile-grid">
            <div className="profile-field">
              <label>Father's Name:</label>
              <span>{profile.parentInfo.fatherName || 'Not provided'}</span>
            </div>
            <div className="profile-field">
              <label>Mother's Name:</label>
              <span>{profile.parentInfo.motherName || 'Not provided'}</span>
            </div>
            <div className="profile-field">
              <label>Guardian's Name:</label>
              <span>{profile.parentInfo.guardianName || 'Not provided'}</span>
            </div>
          </div>
        </div>
      );
    }

    if (['admin', 'teacher', 'parent'].includes(currentUser.role) && profile.parentInfo) {
      return (
        <div className="profile-section">
          <h3>Parent/Guardian Information</h3>
          <div className="profile-grid">
            <div className="profile-field">
              <label>Father's Name:</label>
              <span>{profile.parentInfo.fatherName || 'Not provided'}</span>
            </div>
            <div className="profile-field">
              <label>Mother's Name:</label>
              <span>{profile.parentInfo.motherName || 'Not provided'}</span>
            </div>
            <div className="profile-field">
              <label>Guardian's Name:</label>
              <span>{profile.parentInfo.guardianName || 'Not provided'}</span>
            </div>
            <div className="profile-field">
              <label>Parent Phone:</label>
              <span>{profile.parentInfo.parentPhone || 'Not provided'}</span>
            </div>
            <div className="profile-field">
              <label>Parent Email:</label>
              <span>{profile.parentInfo.parentEmail || 'Not provided'}</span>
            </div>
            <div className="profile-field">
              <label>Emergency Contact:</label>
              <span>{profile.parentInfo.emergencyContact || 'Not provided'}</span>
            </div>
            <div className="profile-field">
              <label>Occupation:</label>
              <span>{profile.parentInfo.occupation || 'Not provided'}</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderMedicalInfo = () => {
    if (['admin', 'teacher'].includes(currentUser.role) && profile.medicalInfo) {
      return (
        <div className="profile-section">
          <h3>Medical Information</h3>
          <div className="profile-grid">
            <div className="profile-field full-width">
              <label>Medical Conditions:</label>
              {editing && currentUser.role === 'teacher' ? (
                <textarea
                  value={editData.medicalInfo?.conditions || ''}
                  onChange={(e) => setEditData({
                    ...editData,
                    medicalInfo: {...editData.medicalInfo, conditions: e.target.value}
                  })}
                />
              ) : (
                <span>{profile.medicalInfo.conditions || 'None reported'}</span>
              )}
            </div>
            <div className="profile-field full-width">
              <label>Allergies:</label>
              <span>{profile.medicalInfo.allergies || 'None reported'}</span>
            </div>
            <div className="profile-field full-width">
              <label>Medications:</label>
              <span>{profile.medicalInfo.medications || 'None reported'}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (error) return <div className="profile-error">Error: {error}</div>;
  if (!profile) return <div className="profile-error">Profile not found</div>;

  return (
    <div className="profile-card">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt="Profile" />
          ) : (
            <div className="avatar-placeholder">
              {profile.firstName?.[0]}{profile.lastName?.[0]}
            </div>
          )}
        </div>
        <div className="profile-title">
          <h2>{profile.fullName}</h2>
          {profile.academic?.rollNumber && (
            <p className="roll-number">Roll No: {profile.academic.rollNumber}</p>
          )}
          {profile.academic?.currentGrade && profile.academic?.section && (
            <p className="class-info">
              Class: {profile.academic.currentGrade}-{profile.academic.section}
            </p>
          )}
          <p className="user-role">Role: {currentUser.role}</p>
        </div>
        <div className="profile-actions">
          {canEdit() && !editing && (
            <button onClick={handleEdit} className="btn-edit">
              Edit Profile
            </button>
          )}
          {editing && (
            <div className="edit-actions">
              <button onClick={handleSave} className="btn-save">
                Save
              </button>
              <button onClick={handleCancel} className="btn-cancel">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-content">
        {renderBasicInfo()}
        {renderAddressInfo()}
        {renderParentInfo()}
        {renderMedicalInfo()}
        
        <AcademicSection 
          profile={profile}
          currentUser={currentUser}
          editing={editing}
          editData={editData}
          setEditData={setEditData}
          onResultsUpdate={(results) => {
            // Update profile header with latest performance data
            if (results && results.length > 0) {
              const totalPercentage = results.reduce((sum, result) => sum + result.percentage, 0);
              const averagePercentage = (totalPercentage / results.length).toFixed(1);
              // You can use this data to update the header display
            }
          }}
        />
        
        <FeeSection 
          profile={profile}
          currentUser={currentUser}
          editing={editing}
          editData={editData}
          setEditData={setEditData}
        />
        
        <AchievementSection 
          profile={profile}
          currentUser={currentUser}
          onUpdate={fetchProfile}
        />
      </div>
    </div>
  );
};

export default ProfileCard;