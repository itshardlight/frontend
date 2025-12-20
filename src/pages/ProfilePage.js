import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';
import ProfileCreationForm from '../components/ProfileCreationForm';
import profileService from '../services/profileService';
import './ProfilePage.css';

const ProfilePage = () => {
  const { profileId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    grade: '',
    section: '',
    search: ''
  });

  useEffect(() => {
    // Get current user from localStorage or context
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      if (profileId) {
        // Load specific profile
        loadProfile(profileId);
      } else {
        // Load appropriate data based on user role
        loadUserData();
      }
    }
  }, [currentUser, profileId]);

  const loadProfile = async (id) => {
    try {
      setLoading(true);
      const response = await profileService.getProfile(id);
      setSelectedProfile(response.profile);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      if (['admin', 'teacher'].includes(currentUser.role)) {
        // Load all profiles for admin and teachers
        const response = await profileService.getAllProfiles(filters);
        setProfiles(response.profiles);
      } else {
        // Load own profile for students, parents, fee_department
        const response = await profileService.getMyProfile();
        setSelectedProfile(response.profile);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };

  const handleSearch = () => {
    loadUserData();
  };

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
  };

  const handleCreateSuccess = (newProfile) => {
    setShowCreateForm(false);
    setSelectedProfile(newProfile);
    loadUserData(); // Refresh the list
  };

  const renderProfileList = () => {
    if (!['admin', 'teacher'].includes(currentUser.role)) {
      return null;
    }

    return (
      <div className="profile-list-section">
        <div className="list-header">
          <h2>Student Profiles</h2>
          {currentUser.role === 'admin' && (
            <button 
              onClick={() => setShowCreateForm(true)}
              className="btn-create-profile"
            >
              Create New Profile
            </button>
          )}
        </div>

        <div className="filters">
          <div className="filter-group">
            <select
              value={filters.grade}
              onChange={(e) => handleFilterChange('grade', e.target.value)}
            >
              <option value="">All Grades</option>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
            
            <select
              value={filters.section}
              onChange={(e) => handleFilterChange('section', e.target.value)}
            >
              <option value="">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
            
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            
            <button onClick={handleSearch} className="btn-search">
              Search
            </button>
          </div>
        </div>

        <div className="profiles-grid">
          {profiles.map((profile) => (
            <div 
              key={profile._id} 
              className={`profile-card-mini ${selectedProfile?._id === profile._id ? 'selected' : ''}`}
              onClick={() => handleProfileSelect(profile)}
            >
              <div className="profile-avatar-mini">
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder-mini">
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </div>
                )}
              </div>
              <div className="profile-info-mini">
                <h4>{profile.fullName}</h4>
                <p>Roll: {profile.academic?.rollNumber}</p>
                <p>Class: {profile.currentClass}</p>
              </div>
            </div>
          ))}
        </div>

        {profiles.length === 0 && !loading && (
          <div className="no-profiles">
            <p>No profiles found matching your criteria.</p>
          </div>
        )}
      </div>
    );
  };

  const renderMainContent = () => {
    if (showCreateForm) {
      return (
        <ProfileCreationForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      );
    }

    if (selectedProfile) {
      return (
        <ProfileCard
          profileId={selectedProfile._id}
          currentUser={currentUser}
        />
      );
    }

    if (['admin', 'teacher'].includes(currentUser.role)) {
      return (
        <div className="select-profile-message">
          <h3>Select a profile to view details</h3>
          <p>Choose a student from the list on the left to view their complete profile.</p>
        </div>
      );
    }

    return (
      <div className="no-profile-message">
        <h3>No profile found</h3>
        <p>Your profile hasn't been created yet. Please contact the administrator.</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="profile-page">
        <div className="error-message">Please log in to view profiles.</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-layout">
        {['admin', 'teacher'].includes(currentUser.role) && (
          <div className="profile-sidebar">
            {renderProfileList()}
          </div>
        )}
        
        <div className={`profile-main ${['admin', 'teacher'].includes(currentUser.role) ? 'with-sidebar' : 'full-width'}`}>
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;