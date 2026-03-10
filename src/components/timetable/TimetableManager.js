import React, { useState } from 'react';
import TimetableViewer from './TimetableViewer';

const TimetableManager = ({ userRole }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];

  return (
    <div className="timetable-manager">
      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label">Select Class</label>
          <select 
            className="form-select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Choose a class...</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Select Section</label>
          <select 
            className="form-select"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="">Choose a section...</option>
            {sections.map(section => (
              <option key={section} value={section}>Section {section}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedClass && selectedSection && (
        <TimetableViewer 
          className={selectedClass}
          section={selectedSection}
          readOnly={true}
        />
      )}

      {(!selectedClass || !selectedSection) && (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          Please select a class and section to view the timetable.
        </div>
      )}
    </div>
  );
};

export default TimetableManager;