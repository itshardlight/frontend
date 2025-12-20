import React from 'react';

const AcademicSection = ({ profile, currentUser, editing, editData, setEditData }) => {
  const canView = ['admin', 'teacher', 'student', 'parent'].includes(currentUser.role);
  const canEdit = ['admin', 'teacher'].includes(currentUser.role);

  if (!canView || !profile.academic) return null;

  const handleAcademicChange = (field, value) => {
    setEditData({
      ...editData,
      academic: {
        ...editData.academic,
        [field]: value
      }
    });
  };

  const handleHistoryChange = (index, field, value) => {
    const newHistory = [...(editData.academic?.academicHistory || [])];
    newHistory[index] = {
      ...newHistory[index],
      [field]: value
    };
    setEditData({
      ...editData,
      academic: {
        ...editData.academic,
        academicHistory: newHistory
      }
    });
  };

  const addAcademicRecord = () => {
    const newHistory = [...(editData.academic?.academicHistory || [])];
    newHistory.push({
      grade: '',
      year: '',
      percentage: 0,
      subjects: []
    });
    setEditData({
      ...editData,
      academic: {
        ...editData.academic,
        academicHistory: newHistory
      }
    });
  };

  return (
    <div className="profile-section academic-section">
      <h3>Academic Information</h3>
      
      <div className="profile-grid">
        <div className="profile-field">
          <label>Current Grade:</label>
          {editing && canEdit ? (
            <select
              value={editData.academic?.currentGrade || ''}
              onChange={(e) => handleAcademicChange('currentGrade', e.target.value)}
            >
              <option value="">Select Grade</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
          ) : (
            <span>{profile.academic.currentGrade || 'Not assigned'}</span>
          )}
        </div>
        
        <div className="profile-field">
          <label>Section:</label>
          {editing && canEdit ? (
            <select
              value={editData.academic?.section || ''}
              onChange={(e) => handleAcademicChange('section', e.target.value)}
            >
              <option value="">Select Section</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          ) : (
            <span>{profile.academic.section || 'Not assigned'}</span>
          )}
        </div>
        
        <div className="profile-field">
          <label>Roll Number:</label>
          <span>{profile.academic.rollNumber}</span>
        </div>
        
        <div className="profile-field">
          <label>Admission Date:</label>
          <span>
            {profile.academic.admissionDate 
              ? new Date(profile.academic.admissionDate).toLocaleDateString()
              : 'Not specified'}
          </span>
        </div>
        
        <div className="profile-field full-width">
          <label>Previous School:</label>
          {editing && canEdit ? (
            <input
              type="text"
              value={editData.academic?.previousSchool || ''}
              onChange={(e) => handleAcademicChange('previousSchool', e.target.value)}
            />
          ) : (
            <span>{profile.academic.previousSchool || 'Not specified'}</span>
          )}
        </div>
      </div>

      {profile.academic.academicHistory && profile.academic.academicHistory.length > 0 && (
        <div className="academic-history">
          <h4>Academic History</h4>
          {profile.academic.academicHistory.map((record, index) => (
            <div key={index} className="history-record">
              <div className="profile-grid">
                <div className="profile-field">
                  <label>Grade:</label>
                  {editing && canEdit ? (
                    <input
                      type="text"
                      value={editData.academic?.academicHistory?.[index]?.grade || ''}
                      onChange={(e) => handleHistoryChange(index, 'grade', e.target.value)}
                    />
                  ) : (
                    <span>{record.grade}</span>
                  )}
                </div>
                <div className="profile-field">
                  <label>Year:</label>
                  {editing && canEdit ? (
                    <input
                      type="text"
                      value={editData.academic?.academicHistory?.[index]?.year || ''}
                      onChange={(e) => handleHistoryChange(index, 'year', e.target.value)}
                    />
                  ) : (
                    <span>{record.year}</span>
                  )}
                </div>
                <div className="profile-field">
                  <label>Percentage:</label>
                  {editing && canEdit ? (
                    <input
                      type="number"
                      value={editData.academic?.academicHistory?.[index]?.percentage || ''}
                      onChange={(e) => handleHistoryChange(index, 'percentage', parseFloat(e.target.value))}
                    />
                  ) : (
                    <span>{record.percentage}%</span>
                  )}
                </div>
              </div>
              {record.subjects && record.subjects.length > 0 && (
                <div className="subjects-list">
                  <label>Subjects:</label>
                  <ul>
                    {record.subjects.map((subject, subIndex) => (
                      <li key={subIndex}>
                        {subject.name}: {subject.marks} ({subject.grade})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          {editing && canEdit && (
            <button onClick={addAcademicRecord} className="btn-add">
              Add Academic Record
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AcademicSection;