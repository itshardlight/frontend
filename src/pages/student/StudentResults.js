import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const StudentResults = () => {
  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    academicYear: "",
    examType: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!userData || !token) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchResults(token);
    }
  }, [navigate]);

  const fetchResults = async (token, filterParams = {}) => {
    try {
      setLoading(true);
      setError(""); // Clear previous errors
      
      console.log("Fetching results with token:", token ? "Token exists" : "No token");
      console.log("Filter params:", filterParams);
      
      const params = new URLSearchParams(filterParams);
      const response = await axios.get(
        `http://localhost:5000/api/results/my-results?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("API Response:", response.data);
      
      if (response.data.success) {
        setResults(response.data.results || []);
        console.log("Results set:", response.data.results?.length || 0, "items");
      } else {
        setError(response.data.message || "Failed to fetch results");
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
        // Redirect to login
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
      } else if (err.response?.status === 403) {
        setError("Access denied. Student role required.");
      } else if (err.response?.status === 404) {
        setError("Student record not found. Please contact administration.");
      } else {
        setError(err.response?.data?.message || "Failed to fetch results");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    const token = localStorage.getItem("token");
    const filterParams = Object.fromEntries(
      Object.entries(newFilters).filter(([_, v]) => v !== "")
    );
    fetchResults(token, filterParams);
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+': case 'A': return 'bg-success';
      case 'B+': case 'B': return 'bg-primary';
      case 'C+': case 'C': return 'bg-warning';
      default: return 'bg-danger';
    }
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return 'bg-success';
    if (percentage >= 75) return 'bg-primary';
    if (percentage >= 60) return 'bg-warning';
    return 'bg-danger';
  };

  if (!user) return null;

  return (
    <div className="min-vh-100 bg-light">
      {/* Top Navigation */}
      <nav className="navbar navbar-dark shadow-sm">
        <div className="container-fluid px-4">
          <span className="navbar-brand mb-0 h1">My Results</span>
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-outline-light btn-sm me-2"
              onClick={() => navigate("/dashboard")}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </button>
            <button 
              className="btn btn-outline-info btn-sm" 
              onClick={() => navigate("/profile")}
            >
              <i className="bi bi-person-circle me-1"></i>
              Profile
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Results Summary */}
        {results.length > 0 && (
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card bg-primary bg-opacity-10 border-primary">
                <div className="card-body text-center">
                  <i className="bi bi-journal-text text-primary" style={{ fontSize: '2rem' }}></i>
                  <h4 className="mt-2 mb-0 text-primary">{results.length}</h4>
                  <small className="text-muted">Total Exams</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success bg-opacity-10 border-success">
                <div className="card-body text-center">
                  <i className="bi bi-graph-up text-success" style={{ fontSize: '2rem' }}></i>
                  <h4 className="mt-2 mb-0 text-success">
                    {Math.round(results.reduce((sum, result) => sum + result.percentage, 0) / results.length)}%
                  </h4>
                  <small className="text-muted">Average Score</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info bg-opacity-10 border-info">
                <div className="card-body text-center">
                  <i className="bi bi-trophy text-info" style={{ fontSize: '2rem' }}></i>
                  <h4 className="mt-2 mb-0 text-info">
                    {Math.max(...results.map(r => r.percentage))}%
                  </h4>
                  <small className="text-muted">Best Score</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning bg-opacity-10 border-warning">
                <div className="card-body text-center">
                  <i className="bi bi-award text-warning" style={{ fontSize: '2rem' }}></i>
                  <h4 className="mt-2 mb-0 text-warning">
                    {results.filter(r => r.grade === 'A+' || r.grade === 'A').length}
                  </h4>
                  <small className="text-muted">A Grades</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Academic Year</label>
                <select 
                  className="form-select"
                  name="academicYear"
                  value={filters.academicYear}
                  onChange={handleFilterChange}
                >
                  <option value="">All Years</option>
                  <option value="2024-25">2024-25</option>
                  <option value="2023-24">2023-24</option>
                  <option value="2022-23">2022-23</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Exam Type</label>
                <select 
                  className="form-select"
                  name="examType"
                  value={filters.examType}
                  onChange={handleFilterChange}
                >
                  <option value="">All Exams</option>
                  <option value="Unit Test">Unit Test</option>
                  <option value="Mid Term">Mid Term</option>
                  <option value="Final Exam">Final Exam</option>
                  <option value="Assignment">Assignment</option>
                </select>
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setFilters({ academicYear: "", examType: "" });
                    const token = localStorage.getItem("token");
                    fetchResults(token);
                  }}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h5 className="mb-0">
              <i className="bi bi-graph-up me-2"></i>
              Exam Results
            </h5>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading results...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Exam Type</th>
                      <th>Subject</th>
                      <th>Marks Obtained</th>
                      <th>Total Marks</th>
                      <th>Percentage</th>
                      <th>Grade</th>
                      <th>Academic Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index}>
                        <td>{new Date(result.examDate).toLocaleDateString()}</td>
                        <td>
                          <span className="badge bg-secondary">{result.examType}</span>
                        </td>
                        <td className="fw-bold">{result.subject}</td>
                        <td className="text-center">{result.marksObtained}</td>
                        <td className="text-center">{result.totalMarks}</td>
                        <td>
                          <span className={`badge ${getPercentageColor(result.percentage)}`}>
                            {result.percentage}%
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getGradeColor(result.grade)}`}>
                            {result.grade}
                          </span>
                        </td>
                        <td>{result.academicYear}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-muted py-5">
                <i className="bi bi-graph-up" style={{ fontSize: '4rem' }}></i>
                <h4 className="mt-3">No Results Found</h4>
                <p>No exam results are available yet. Check back later!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;