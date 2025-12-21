import React, { useState, useEffect } from 'react';
import profileService from '../services/profileService';

const AchievementDebugger = () => {
  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);

  const addDebugInfo = (message) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      addDebugInfo(`Current user: ${user.fullName} (${user.role})`);
      
      // Fetch profile
      profileService.getMyProfile()
        .then(response => {
          setProfile(response.profile);
          addDebugInfo(`Profile loaded: ${response.profile.fullName}`);
          addDebugInfo(`Achievements count: ${response.profile.achievements?.length || 0}`);
        })
        .catch(error => {
          addDebugInfo(`Profile load error: ${error.message}`);
        });
    } else {
      addDebugInfo('No user logged in');
    }
  }, []);

  const testAddAchievement = async () => {
    if (!profile) {
      addDebugInfo('No profile available');
      return;
    }

    try {
      addDebugInfo('Adding test achievement...');
      const result = await profileService.addAchievement(profile._id, {
        title: 'Debug Test Achievement',
        description: 'This is a test achievement for debugging',
        date: new Date().toISOString(),
        category: 'other'
      });
      
      addDebugInfo('Achievement added successfully');
      
      // Refresh profile
      const updatedProfile = await profileService.getMyProfile();
      setProfile(updatedProfile.profile);
      addDebugInfo(`Updated achievements count: ${updatedProfile.profile.achievements?.length || 0}`);
      
    } catch (error) {
      addDebugInfo(`Add error: ${error.message}`);
    }
  };

  const testDeleteAchievement = async (achievementId) => {
    if (!profile) {
      addDebugInfo('No profile available');
      return;
    }

    try {
      addDebugInfo(`Attempting to delete achievement: ${achievementId}`);
      addDebugInfo(`Profile ID: ${profile._id}`);
      addDebugInfo(`Current user ID: ${currentUser?.id}`);
      
      const result = await profileService.deleteAchievement(profile._id, achievementId);
      addDebugInfo('Achievement deleted successfully');
      
      // Refresh profile
      const updatedProfile = await profileService.getMyProfile();
      setProfile(updatedProfile.profile);
      addDebugInfo(`Updated achievements count: ${updatedProfile.profile.achievements?.length || 0}`);
      
    } catch (error) {
      addDebugInfo(`Delete error: ${error.message}`);
      if (error.response) {
        addDebugInfo(`Status: ${error.response.status}`);
        addDebugInfo(`Response: ${JSON.stringify(error.response.data)}`);
      }
    }
  };

  const canEditAchievement = (achievement) => {
    const canAdd = currentUser?.role === 'student' && (
      profile?.userId?._id === currentUser?.id || 
      profile?._id === currentUser?.id ||
      profile?.userId === currentUser?.id
    );
    
    const result = canAdd && achievement.addedBy && (
      achievement.addedBy._id === currentUser?.id ||
      achievement.addedBy === currentUser?.id
    );
    
    addDebugInfo(`Permission check for ${achievement.title}:`);
    addDebugInfo(`  canAdd: ${canAdd}`);
    addDebugInfo(`  achievement.addedBy: ${JSON.stringify(achievement.addedBy)}`);
    addDebugInfo(`  currentUser.id: ${currentUser?.id}`);
    addDebugInfo(`  result: ${result}`);
    
    return result;
  };

  if (!currentUser) {
    return (
      <div className="card">
        <div className="card-body">
          <h5>Achievement Debugger</h5>
          <p>Please log in to use the debugger.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Achievement Debugger</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Current User:</strong> {currentUser.fullName} ({currentUser.role})
              </div>
              <div className="mb-3">
                <strong>Profile:</strong> {profile ? profile.fullName : 'Loading...'}
              </div>
              <div className="mb-3">
                <button className="btn btn-primary me-2" onClick={testAddAchievement}>
                  Add Test Achievement
                </button>
              </div>
              
              {profile?.achievements && profile.achievements.length > 0 && (
                <div>
                  <h6>Achievements:</h6>
                  {profile.achievements.map((achievement, index) => (
                    <div key={achievement._id || index} className="border p-2 mb-2">
                      <div><strong>{achievement.title}</strong></div>
                      <div>ID: {achievement._id}</div>
                      <div>Added by: {JSON.stringify(achievement.addedBy)}</div>
                      <div>Can edit: {canEditAchievement(achievement) ? 'Yes' : 'No'}</div>
                      <button 
                        className="btn btn-danger btn-sm mt-1"
                        onClick={() => testDeleteAchievement(achievement._id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Debug Log</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '400px', overflowY: 'scroll', fontSize: '12px' }}>
                {debugInfo.map((info, index) => (
                  <div key={index} className="mb-1">{info}</div>
                ))}
              </div>
              <button 
                className="btn btn-secondary btn-sm mt-2"
                onClick={() => setDebugInfo([])}
              >
                Clear Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementDebugger;