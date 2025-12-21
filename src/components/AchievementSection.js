import React, { useState } from 'react';
import profileService from '../services/profileService';

const AchievementSection = ({ profile, currentUser, onUpdate }) => {
  const [addingAchievement, setAddingAchievement] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    date: '',
    category: 'other'
  });

  const canView = true; // Everyone can view achievements
  const canAdd = currentUser.role === 'student' && (
    profile.userId?._id === currentUser.id || 
    profile._id === currentUser.id ||
    profile.userId === currentUser.id
  );

  if (!canView) return null;

  const handleAddAchievement = async () => {
    try {
      // Use profile._id for the API call
      const profileId = profile._id;
      
      await profileService.addAchievement(profileId, {
        ...newAchievement,
        date: newAchievement.date || new Date()
      });
      
      setAddingAchievement(false);
      setNewAchievement({
        title: '',
        description: '',
        date: '',
        category: 'other'
      });
      
      onUpdate(); // Refresh profile data
    } catch (error) {
      console.error('Failed to add achievement:', error);
      alert('Failed to add achievement: ' + (error.message || 'Unknown error'));
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      academic: '🎓',
      sports: '🏆',
      cultural: '🎭',
      social: '🤝',
      other: '⭐'
    };
    return icons[category] || icons.other;
  };

  const getCategoryColor = (category) => {
    const colors = {
      academic: '#4CAF50',
      sports: '#FF9800',
      cultural: '#9C27B0',
      social: '#2196F3',
      other: '#607D8B'
    };
    return colors[category] || colors.other;
  };

  const renderAchievements = () => {
    if (!profile.achievements || profile.achievements.length === 0) {
      return (
        <div className="text-center py-4">
          <i className="bi bi-trophy text-muted" style={{ fontSize: '3rem' }}></i>
          <p className="text-muted mt-2 mb-0">No achievements added yet.</p>
          {canAdd && (
            <p className="text-muted small">You can add your achievements like scout training, competitions, certificates, etc.</p>
          )}
        </div>
      );
    }

    return (
      <div className="row g-3">
        {profile.achievements.map((achievement, index) => (
          <div key={index} className="col-md-6">
            <div 
              className="card h-100"
              style={{ borderLeft: `4px solid ${getCategoryColor(achievement.category)}` }}
            >
              <div className="card-body">
                <div className="d-flex align-items-start mb-2">
                  <div className="me-3" style={{ fontSize: '1.5rem' }}>
                    {getCategoryIcon(achievement.category)}
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="card-title mb-1">{achievement.title}</h6>
                    <span className="badge" style={{ backgroundColor: getCategoryColor(achievement.category), color: 'white' }}>
                      {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                    </span>
                  </div>
                  <small className="text-muted">
                    {new Date(achievement.date).toLocaleDateString()}
                  </small>
                </div>
                {achievement.description && (
                  <p className="card-text small text-muted mb-2">{achievement.description}</p>
                )}
                <div className="text-end">
                  <small className="text-muted">
                    Added by: {achievement.addedBy?.fullName || achievement.addedBy?.username || 'You'}
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAddAchievementForm = () => (
    <div className="card border-primary mb-3">
      <div className="card-header bg-primary text-white">
        <h6 className="mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          Add New Achievement
        </h6>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-control"
              value={newAchievement.title}
              onChange={(e) => setNewAchievement({...newAchievement, title: e.target.value})}
              placeholder="e.g., Scout Training Certificate, Science Fair Winner"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={newAchievement.category}
              onChange={(e) => setNewAchievement({...newAchievement, category: e.target.value})}
            >
              <option value="academic">🎓 Academic</option>
              <option value="sports">🏆 Sports</option>
              <option value="cultural">🎭 Cultural</option>
              <option value="social">🤝 Social</option>
              <option value="other">⭐ Other</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              value={newAchievement.date}
              onChange={(e) => setNewAchievement({...newAchievement, date: e.target.value})}
            />
          </div>
          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={newAchievement.description}
              onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
              placeholder="Describe your achievement..."
              rows="3"
            />
          </div>
        </div>
        <div className="d-flex gap-2 mt-3">
          <button 
            className="btn btn-primary"
            onClick={handleAddAchievement}
            disabled={!newAchievement.title.trim()}
          >
            <i className="bi bi-check-lg me-2"></i>
            Add Achievement
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setAddingAchievement(false)}
          >
            <i className="bi bi-x-lg me-2"></i>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="achievements-section">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="mb-0">Your Achievements</h6>
          <small className="text-muted">Showcase your accomplishments and certificates</small>
        </div>
        {canAdd && !addingAchievement && (
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={() => setAddingAchievement(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add Achievement
          </button>
        )}
      </div>
      
      {addingAchievement && renderAddAchievementForm()}
      
      {renderAchievements()}
    </div>
  );
};

export default AchievementSection;