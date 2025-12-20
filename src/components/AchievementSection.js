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
  const canAdd = currentUser.role === 'student' && profile.userId?._id === currentUser.id;

  if (!canView) return null;

  const handleAddAchievement = async () => {
    try {
      await profileService.addAchievement(profile._id, {
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
        <div className="no-achievements">
          <p>No achievements added yet.</p>
          {canAdd && (
            <p className="hint">You can add your achievements like scout training, competitions, etc.</p>
          )}
        </div>
      );
    }

    return (
      <div className="achievements-list">
        {profile.achievements.map((achievement, index) => (
          <div 
            key={index} 
            className="achievement-card"
            style={{ borderLeftColor: getCategoryColor(achievement.category) }}
          >
            <div className="achievement-header">
              <div className="achievement-icon">
                {getCategoryIcon(achievement.category)}
              </div>
              <div className="achievement-title">
                <h4>{achievement.title}</h4>
                <span className="achievement-category">
                  {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                </span>
              </div>
              <div className="achievement-date">
                {new Date(achievement.date).toLocaleDateString()}
              </div>
            </div>
            {achievement.description && (
              <div className="achievement-description">
                <p>{achievement.description}</p>
              </div>
            )}
            <div className="achievement-footer">
              <small>
                Added by: {achievement.addedBy?.fullName || achievement.addedBy?.username || 'Unknown'}
              </small>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAddAchievementForm = () => (
    <div className="add-achievement-form">
      <h4>Add New Achievement</h4>
      <div className="form-grid">
        <div className="form-field full-width">
          <label>Title:</label>
          <input
            type="text"
            value={newAchievement.title}
            onChange={(e) => setNewAchievement({...newAchievement, title: e.target.value})}
            placeholder="e.g., Scout Training Certificate, Science Fair Winner"
          />
        </div>
        <div className="form-field">
          <label>Category:</label>
          <select
            value={newAchievement.category}
            onChange={(e) => setNewAchievement({...newAchievement, category: e.target.value})}
          >
            <option value="academic">Academic</option>
            <option value="sports">Sports</option>
            <option value="cultural">Cultural</option>
            <option value="social">Social</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-field">
          <label>Date:</label>
          <input
            type="date"
            value={newAchievement.date}
            onChange={(e) => setNewAchievement({...newAchievement, date: e.target.value})}
          />
        </div>
        <div className="form-field full-width">
          <label>Description:</label>
          <textarea
            value={newAchievement.description}
            onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
            placeholder="Describe your achievement..."
            rows="3"
          />
        </div>
      </div>
      <div className="form-actions">
        <button onClick={handleAddAchievement} className="btn-save">
          Add Achievement
        </button>
        <button onClick={() => setAddingAchievement(false)} className="btn-cancel">
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="profile-section achievements-section">
      <div className="section-header">
        <h3>Achievements</h3>
        {canAdd && !addingAchievement && (
          <button 
            onClick={() => setAddingAchievement(true)}
            className="btn-add-achievement"
          >
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