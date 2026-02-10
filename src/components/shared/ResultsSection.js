import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ResultsSection = ({ studentId }) => {
  const [allResults, setAllResults] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const [activeYear, setActiveYear] = useState('');
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [availableClasses, setAvailableClasses] = useState([]);

  // fetch results
  useEffect(() => {
    if (!studentId) return;
    const fetchAllResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }
        const res = await axios.get(
          `http://localhost:5000/api/results/student/${studentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.data.success) {
          setError(res.data.message || 'Failed to load results');
          setLoading(false);
          return;
        }

        const data = res.data.data || [];
        setAllResults(data);

        const years = [...new Set(data.map(r => r.academicYear))]
          .filter(Boolean)
          .sort()
          .reverse();
        setAvailableYears(years);
        if (years[0]) setActiveYear(years[0]);

        const classes = [...new Set(data.map(r => r.class))]
          .filter(Boolean)
          .sort((a, b) => {
            const na = parseInt(a, 10);
            const nb = parseInt(b, 10);
            if (!isNaN(na) && !isNaN(nb)) return na - nb;
            return String(a).localeCompare(String(b));
          });
        setAvailableClasses(classes);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchAllResults();
  }, [studentId]);

  // filter when year / class / allResults change
  useEffect(() => {
    if (!activeYear) {
      setResults([]);
      return;
    }
    let filtered = allResults.filter(r => r.academicYear === activeYear);
    if (selectedClass !== 'all') {
      filtered = filtered.filter(r => r.class === selectedClass);
    }
    setResults(filtered);
  }, [allResults, activeYear, selectedClass]);

  const calculateGrade = (p) => {
    if (p >= 90) return 'A+';
    if (p >= 80) return 'A';
    if (p >= 70) return 'B+';
    if (p >= 60) return 'B';
    if (p >= 50) return 'C+';
    if (p >= 40) return 'C';
    if (p >= 33) return 'D';
    return 'F';
  };

  const getBadge = (g) => {
    switch (g) {
      case 'A+':
      case 'A': return 'bg-success';
      case 'B+':
      case 'B': return 'bg-info';
      case 'C+':
      case 'C': return 'bg-warning text-dark';
      case 'D':   return 'bg-secondary';
      case 'F':   return 'bg-danger';
      default:    return 'bg-secondary';
    }
  };

  const formatExamType = (t = '') =>
    t.toString().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const calcStats = (list) => {
    if (!list.length) return null;
    const totalP = list.reduce((s, r) => s + (r.percentage || 0), 0);
    const avgP   = totalP / list.length;
    const totalA = list.reduce((s, r) => s + (r.attendance ?? 100), 0);
    const avgA   = totalA / list.length;
    return {
      avgPercentage: Math.round(avgP * 100) / 100,
      overallGrade:  calculateGrade(avgP),
      avgAttendance: Math.round(avgA * 100) / 100,
      totalExams:    list.length,
    };
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-warning" role="alert">
        {error}
      </div>
    );
  }

  if (!allResults.length) {
    return (
      <div className="alert alert-info" role="alert">
        No results found for this student.
      </div>
    );
  }

  const stats = calcStats(results);

  return (
    <div className="row g-3">
    

      {/* class filter: Class 1,2,3,... */}
      <div className="col-12">
        <div className="card border-secondary mb-3">
          <div className="card-body py-2">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="fw-bold text-secondary">
                <i className="bi bi-funnel me-2" />
                Filter by Class:
              </span>
              <button
                className={`btn btn-sm ${selectedClass === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSelectedClass('all')}
              >
                All
              </button>
              {availableClasses.map(cls => (
                <button
                  key={cls}
                  className={`btn btn-sm ${selectedClass === cls ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setSelectedClass(cls)}
                >
                  Class {cls}
                </button>
              ))}
            </div>
            <small className="text-muted d-block mt-2">
              {selectedClass === 'all'
                ? `Showing all classes for ${activeYear}.`
                : `Showing only Class ${selectedClass} for ${activeYear}.`}
            </small>
          </div>
        </div>
      </div>

      {/* results list */}
      <div className="col-12">
        {results.length === 0 ? (
          <div className="alert alert-info" role="alert">
            No results for this selection.
          </div>
        ) : (
          <div className="row g-3">
            {results.map((res, i) => (
              <div key={res._id || i} className="col-md-6">
                <div className={`card h-100 border-${i % 2 === 0 ? 'info' : 'warning'}`}>
                  <div className={`card-header ${i % 2 === 0 ? 'bg-info text-white' : 'bg-warning text-dark'}`}>
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">
                        {formatExamType(res.examType)} - {res.examName}
                      </h6>
                      <span className="badge bg-light text-dark">
                        Class {res.class}
                      </span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-sm mb-0">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Marks</th>
                            <th>Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {res.subjects?.map((sub, j) => (
                            <tr key={j}>
                              <td>{sub.subjectName}</td>
                              <td>{sub.obtainedMarks}/{sub.maxMarks}</td>
                              <td>
                                <span className={`badge ${getBadge(sub.grade)}`}>
                                  {sub.grade}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-3 p-2 bg-light rounded">
                      <strong>
                        Overall: {res.totalObtainedMarks}/{res.totalMaxMarks} ({res.percentage}%)
                        {' '}Grade{' '}
                        <span className={`badge ${getBadge(res.overallGrade)} ms-1`}>
                          {res.overallGrade}
                        </span>
                      </strong>
                    </div>
                    {res.remarks && (
                      <div className="mt-2">
                        <small className="text-muted">
                          <strong>Remarks:</strong> {res.remarks}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

         

          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsSection;
