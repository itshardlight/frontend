import React, { useState } from 'react';
import profileService from '../services/profileService';

const AchievementSection = ({ profile, currentUser, onUpdate }) => {
  const [addingAchievement, setAddingAchievement] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
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

  const handleEditAchievement = async (achievementId, updatedAchievement) => {
    try {
      const profileId = profile._id;
      
      await profileService.updateAchievement(profileId, achievementId, updatedAchievement);
      
      setEditingAchievement(null);
      onUpdate(); // Refresh profile data
    } catch (error) {
      console.error('Failed to update achievement:', error);
      alert('Failed to update achievement: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeleteAchievement = async (achievementId) => {
    console.log('🗑️ Delete attempt:', {
      achievementId,
      profileId: profile._id,
      currentUser,
      profile: profile
    });

    if (!window.confirm('Are you sure you want to delete this achievement?')) {
      return;
    }

    try {
      const profileId = profile._id;
      
      console.log('🔄 Calling delete API with:', { profileId, achievementId });
      const result = await profileService.deleteAchievement(profileId, achievementId);
      console.log('✅ Delete successful:', result);
      
      onUpdate(); // Refresh profile data
    } catch (error) {
      console.error('❌ Failed to delete achievement:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Failed to delete achievement: ' + (error.message || 'Unknown error'));
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

  const canEditAchievement = (achievement) => {
    const result = canAdd && achievement.addedBy && (
      achievement.addedBy._id === currentUser.id ||
      achievement.addedBy === currentUser.id
    );
    
    console.log('🔐 Permission check for achievement:', {
      achievementTitle: achievement.title,
      achievementId: achievement._id,
      canAdd,
      achievement: {
        addedBy: achievement.addedBy,
        addedByType: typeof achievement.addedBy
      },
      currentUser: {
        id: currentUser.id,
        role: currentUser.role
      },
      result
    });
    
    return result;
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
          <div key={achievement._id || index} className="col-md-6">
            {editingAchievement === achievement._id ? (
              <EditAchievementCard
                achievement={achievement}
                onSave={(updatedAchievement) => handleEditAchievement(achievement._id, updatedAchievement)}
                onCancel={() => setEditingAchievement(null)}
                getCategoryColor={getCategoryColor}
              />
            ) : (
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
                    <div className="d-flex flex-column align-items-end">
                      <small className="text-muted mb-2">
                        {new Date(achievement.date).toLocaleDateString()}
                      </small>
                      {canEditAchievement(achievement) && (
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setEditingAchievement(achievement._id)}
                            title="Edit achievement"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteAchievement(achievement._id)}
                            title="Delete achievement"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      )}
                    </div>
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
            )}
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
          <h6 className="mb-0">
            {canAdd ? 'Your Achievements' : `${profile.firstName}'s Achievements`}
          </h6>
          <small className="text-muted">
            {canAdd ? 'Showcase your accomplishments and certificates' : 'Student accomplishments and certificates'}
          </small>
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

// Edit Achievement Card Component
const EditAchievementCard = ({ achievement, onSave, onCancel, getCategoryColor }) => {
  const [editData, setEditData] = useState({
    title: achievement.title,
    description: achievement.description || '',
    date: achievement.date ? new Date(achievement.date).toISOString().split('T')[0] : '',
    category: achievement.category
  });

  const handleSave = () => {
    if (!editData.title.trim()) {
      alert('Title is required');
      return;
    }
    onSave(editData);
  };

  return (
    <div className="card border-warning h-100">
      <div className="card-header bg-warning text-dark">
        <h6 className="mb-0">
          <i className="bi bi-pencil me-2"></i>
          Edit Achievement
        </h6>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <label className="form-label">Title *</label>
          <input
            type="text"
            className="form-control"
            value={editData.title}
            onChange={(e) => setEditData({...editData, title: e.target.value})}
            required
          />
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={editData.category}
              onChange={(e) => setEditData({...editData, category: e.target.value})}
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
              value={editData.date}
              onChange={(e) => setEditData({...editData, date: e.target.value})}
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            value={editData.description}
            onChange={(e) => setEditData({...editData, description: e.target.value})}
            rows="3"
          />
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-success btn-sm"
            onClick={handleSave}
            disabled={!editData.title.trim()}
          >
            <i className="bi bi-check-lg me-2"></i>
            Save
          </button>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onCancel}
          >
            <i className="bi bi-x-lg me-2"></i>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementSection;