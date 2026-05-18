import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/Dashboard.css";

const StudentResults = () => {
  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    academicYear: "",
    examType: ""
  });
  const navigate = useNavigate();

  // Add print styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        /* Hide everything except the modal content */
        body * {
          visibility: hidden;
        }
        
        .modal-content, .modal-content * {
          visibility: visible;
        }
        
        .modal {
          position: absolute;
          left: 0;
          top: 0;
          margin: 0;
          padding: 0;
          min-height: 100vh;
          width: 100%;
          display: block !important;
        }
        
        .modal-dialog {
          max-width: 100%;
          margin: 0;
          padding: 15px;
          width: 100%;
        }
        
        .modal-content {
          border: none;
          box-shadow: none;
          border-radius: 0;
          width: 100%;
          max-width: 100%;
        }
        
        /* Hide modal backdrop, close button, and footer */
        .modal-backdrop,
        .no-print {
          display: none !important;
          visibility: hidden !important;
        }
        
        /* Adjust header for print */
        .modal-header {
          background: #1E3A8A !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color: white !important;
          padding: 15px 20px !important;
          border-radius: 0 !important;
        }
        
        .modal-body {
          padding: 20px !important;
        }
        
        /* Ensure colors print correctly */
        .badge,
        .card-header,
        .bg-primary,
        .bg-success,
        .bg-danger,
        .bg-warning,
        .bg-info,
        .bg-secondary,
        .text-success,
        .text-danger,
        .text-primary,
        .text-white {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color-adjust: exact;
        }
        
        /* Ensure gradient backgrounds print */
        [style*="background: linear-gradient"],
        [style*="background:linear-gradient"] {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color-adjust: exact;
        }
        
        /* Card styling for print */
        .card {
          page-break-inside: avoid;
          border: 1px solid #ddd !important;
          margin-bottom: 15px;
        }
        
        .card-header {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          padding: 10px 15px !important;
        }
        
        .card-body {
          padding: 15px !important;
        }
        
        /* Table styling for print */
        table {
          page-break-inside: auto;
          width: 100%;
          border-collapse: collapse;
        }
        
        thead {
          display: table-header-group;
        }
        
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        
        th, td {
          padding: 8px !important;
          border: 1px solid #ddd !important;
        }
        
        th {
          background-color: #f3f4f6 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        /* Row styling */
        .row {
          display: flex;
          flex-wrap: wrap;
          margin: 0 -7.5px;
        }
        
        .col-md-6, .col-md-3, .col-md-4 {
          padding: 0 7.5px;
          margin-bottom: 15px;
        }
        
        .col-md-6 {
          width: 50%;
          flex: 0 0 50%;
        }
        
        .col-md-3 {
          width: 25%;
          flex: 0 0 25%;
        }
        
        .col-md-4 {
          width: 33.333%;
          flex: 0 0 33.333%;
        }
        
        /* Ensure full content is visible */
        .modal-dialog-scrollable .modal-body {
          overflow: visible !important;
          max-height: none !important;
        }
        
        /* Page settings */
        @page {
          size: A4;
          margin: 1cm;
        }
        
        /* Prevent orphans and widows */
        p, h1, h2, h3, h4, h5, h6 {
          orphans: 3;
          widows: 3;
        }
        
        /* Headings should not be separated from content */
        h1, h2, h3, h4, h5, h6 {
          page-break-after: avoid;
        }
        
        /* Ensure text is readable */
        body {
          font-size: 12pt;
          line-height: 1.5;
        }
        
        /* Small text adjustments */
        .small, small {
          font-size: 10pt !important;
        }
        
        /* Badge adjustments for print */
        .badge {
          border: 1px solid #ddd;
          padding: 4px 8px !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
        const resultsData = response.data.results || [];
        const studentInfo = response.data.student; // Get student info from API response
        
        // Enrich results with student name from API response
        const enrichedResults = resultsData.map(result => ({
          ...result,
          studentName: studentInfo?.name || 
                      (result.studentId?.firstName && result.studentId?.lastName
                        ? `${result.studentId.firstName} ${result.studentId.lastName}`
                        : result.studentName || user?.fullName || user?.username || 'N/A'),
          studentRollNumber: studentInfo?.rollNumber || result.rollNumber,
          studentClass: studentInfo?.class || result.studentClass || result.class,
          studentSection: studentInfo?.section || result.studentSection || result.section
        }));
        
        setResults(enrichedResults);
        console.log("Results set:", enrichedResults.length, "items");
        console.log("Student info:", studentInfo);
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

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedResult(null);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleDownloadAllResults = () => {
    if (results.length === 0) {
      alert('No results available to download');
      return;
    }

    // Group results by academic year
    const resultsByYear = results.reduce((acc, result) => {
      const year = result.academicYear || 'Unknown Year';
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(result);
      return acc;
    }, {});

    // Show year selection modal
    showYearSelectionModal(resultsByYear);
  };

  const showYearSelectionModal = (resultsByYear) => {
    const years = Object.keys(resultsByYear).sort().reverse();
    
    // Create modal HTML
    const modalHTML = `
      <div class="modal fade show d-block" tabindex="-1" style="z-index: 1060; background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content" style="border-radius: 15px; border: none;">
            <div class="modal-header" style="background: linear-gradient(135deg, #1E3A8A 0%, #60A5FA 100%); border-radius: 15px 15px 0 0;">
              <h5 class="modal-title text-white">
                <i class="bi bi-file-earmark-pdf me-2"></i>
                Download Academic Year Report
              </h5>
              <button type="button" class="btn-close btn-close-white" onclick="closeYearModal()"></button>
            </div>
            <div class="modal-body" style="padding: 25px;">
              <p class="text-muted mb-3">Select an academic year to download the PDF report:</p>
              <div class="year-selection-grid">
                ${years.map(year => `
                  <button class="year-option-btn" onclick="downloadYearReport('${year}', ${JSON.stringify(resultsByYear[year]).replace(/"/g, '&quot;')})">
                    <div class="year-info">
                      <div class="year-title">${year}</div>
                      <div class="year-count">${resultsByYear[year].length} exam${resultsByYear[year].length !== 1 ? 's' : ''}</div>
                    </div>
                    <i class="bi bi-download"></i>
                  </button>
                `).join('')}
              </div>
              <div class="mt-3 text-center">
                <button class="btn btn-outline-primary" onclick="downloadAllYears(${JSON.stringify(resultsByYear).replace(/"/g, '&quot;')})">
                  <i class="bi bi-collection me-2"></i>
                  Download All Years
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add styles for the modal
    const styles = `
      <style>
        .year-selection-grid {
          display: grid;
          gap: 12px;
          margin-bottom: 15px;
        }
        .year-option-btn {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          width: 100%;
        }
        .year-option-btn:hover {
          border-color: #60A5FA;
          background: #f8fafc;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(96, 165, 250, 0.2);
        }
        .year-title {
          font-weight: 600;
          color: #1E3A8A;
          font-size: 1.1rem;
        }
        .year-count {
          color: #6B7280;
          font-size: 0.9rem;
        }
        .year-option-btn i {
          color: #60A5FA;
          font-size: 1.2rem;
        }
      </style>
    `;

    // Insert modal into DOM
    document.head.insertAdjacentHTML('beforeend', styles);
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add global functions for modal actions
    window.closeYearModal = () => {
      const modal = document.querySelector('.modal.show');
      if (modal) modal.remove();
      const style = document.querySelector('style:last-child');
      if (style) style.remove();
    };

    window.downloadYearReport = (year, yearResults) => {
      generateYearPDF(year, yearResults);
      window.closeYearModal();
    };

    window.downloadAllYears = (allResults) => {
      Object.keys(allResults).forEach(year => {
        setTimeout(() => generateYearPDF(year, allResults[year]), 500);
      });
      window.closeYearModal();
    };
  };

  const generateYearPDF = (academicYear, yearResults) => {
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    
    const studentName = yearResults[0]?.studentName || user?.fullName || user?.username || 'Student';
    const studentClass = yearResults[0]?.studentClass || yearResults[0]?.class || 'N/A';
    const studentSection = yearResults[0]?.studentSection || yearResults[0]?.section || 'N/A';
    const studentRoll = yearResults[0]?.studentRollNumber || yearResults[0]?.rollNumber || 'N/A';

    // Calculate year statistics
    const totalExams = yearResults.length;
    const averagePercentage = Math.round(yearResults.reduce((sum, result) => sum + result.percentage, 0) / totalExams);
    const bestScore = Math.max(...yearResults.map(r => r.percentage));
    const aGrades = yearResults.filter(r => r.grade === 'A+' || r.grade === 'A' || r.overallGrade === 'A+' || r.overallGrade === 'A').length;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Academic Report - ${academicYear}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333;
            background: white;
          }
          .report-container { 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 3px solid #1E3A8A;
            padding-bottom: 20px;
          }
          .school-name { 
            font-size: 24px; 
            font-weight: bold; 
            color: #1E3A8A; 
            margin-bottom: 5px;
          }
          .report-title { 
            font-size: 20px; 
            color: #374151; 
            margin-bottom: 10px;
          }
          .academic-year { 
            font-size: 16px; 
            color: #6B7280; 
          }
          .student-info { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-bottom: 30px;
          }
          .info-card { 
            background: #f8fafc; 
            padding: 15px; 
            border-radius: 8px; 
            border-left: 4px solid #1E3A8A;
          }
          .info-label { 
            font-weight: 600; 
            color: #374151; 
            margin-bottom: 5px;
          }
          .info-value { 
            color: #6B7280;
          }
          .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 15px; 
            margin-bottom: 30px;
          }
          .stat-card { 
            text-align: center; 
            padding: 15px; 
            background: #f3f4f6; 
            border-radius: 8px;
          }
          .stat-number { 
            font-size: 24px; 
            font-weight: bold; 
            color: #1E3A8A;
          }
          .stat-label { 
            font-size: 12px; 
            color: #6B7280; 
            margin-top: 5px;
          }
          .results-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px;
          }
          .results-table th, .results-table td { 
            border: 1px solid #e5e7eb; 
            padding: 10px; 
            text-align: left;
          }
          .results-table th { 
            background: #1E3A8A; 
            color: white; 
            font-weight: 600;
          }
          .results-table tr:nth-child(even) { 
            background: #f9fafb;
          }
          .grade-badge { 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 12px; 
            font-weight: 600;
          }
          .grade-a { background: #dcfce7; color: #166534; }
          .grade-b { background: #dbeafe; color: #1e40af; }
          .grade-c { background: #fef3c7; color: #92400e; }
          .grade-d { background: #fee2e2; color: #991b1b; }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            color: #6B7280; 
            font-size: 12px;
          }
          @media print {
            body { margin: 0; }
            .report-container { padding: 15px; }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <div class="school-name">Student Management System</div>
            <div class="report-title">Academic Performance Report</div>
            <div class="academic-year">Academic Year: ${academicYear}</div>
          </div>

          <div class="student-info">
            <div class="info-card">
              <div class="info-label">Student Name</div>
              <div class="info-value">${studentName}</div>
            </div>
            <div class="info-card">
              <div class="info-label">Class & Section</div>
              <div class="info-value">${studentClass}-${studentSection}</div>
            </div>
            <div class="info-card">
              <div class="info-label">Roll Number</div>
              <div class="info-value">${studentRoll}</div>
            </div>
            <div class="info-card">
              <div class="info-label">Report Generated</div>
              <div class="info-value">${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${totalExams}</div>
              <div class="stat-label">Total Exams</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${averagePercentage}%</div>
              <div class="stat-label">Average Score</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${bestScore}%</div>
              <div class="stat-label">Best Score</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${aGrades}</div>
              <div class="stat-label">A Grades</div>
            </div>
          </div>

          <table class="results-table">
            <thead>
              <tr>
                <th>Exam Name</th>
                <th>Exam Type</th>
                <th>Date</th>
                <th>Total Marks</th>
                <th>Obtained</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              ${yearResults.map(result => `
                <tr>
                  <td>${result.examName || result.examType}</td>
                  <td>${result.examType}</td>
                  <td>${new Date(result.examDate).toLocaleDateString()}</td>
                  <td>${result.totalMaxMarks}</td>
                  <td>${result.totalObtainedMarks}</td>
                  <td>${result.percentage}%</td>
                  <td>
                    <span class="grade-badge grade-${(result.overallGrade || result.grade || '').toLowerCase().charAt(0)}">
                      ${result.overallGrade || result.grade}
                    </span>
                  </td>
                  <td>${result.result || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${yearResults.some(r => r.subjects && r.subjects.length > 0) ? `
            <h3 style="color: #1E3A8A; margin-bottom: 15px;">Subject-wise Performance</h3>
            ${yearResults.filter(r => r.subjects && r.subjects.length > 0).map(result => `
              <div style="margin-bottom: 25px;">
                <h4 style="color: #374151; margin-bottom: 10px;">${result.examName || result.examType}</h4>
                <table class="results-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Code</th>
                      <th>Max Marks</th>
                      <th>Obtained</th>
                      <th>Percentage</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${result.subjects.map(subject => {
                      const subjectPercentage = Math.round((subject.obtainedMarks / subject.maxMarks) * 100);
                      const subjectGrade = getSubjectGrade(subjectPercentage);
                      return `
                        <tr>
                          <td>${subject.subjectName}</td>
                          <td>${subject.subjectCode}</td>
                          <td>${subject.maxMarks}</td>
                          <td>${subject.obtainedMarks}</td>
                          <td>${subjectPercentage}%</td>
                          <td>
                            <span class="grade-badge grade-${subjectGrade.toLowerCase().charAt(0)}">
                              ${subjectGrade}
                            </span>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            `).join('')}
          ` : ''}

          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  const getSubjectGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 33) return 'D';
    return 'F';
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const navigateTo = (path) => {
    navigate(path);
    closeSidebar();
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getSidebarMenuItems = () => {
    return [
      { icon: 'bi-speedometer2', label: 'Dashboard', path: '/dashboard' },
      { icon: 'bi-person-badge', label: 'My Profile', path: '/student/profile' },
      { icon: 'bi-calendar-check', label: 'Attendance', path: '/student/attendance' },
      { icon: 'bi-graph-up', label: 'Results', path: '/student/results' },
      { icon: 'bi-cash-stack', label: 'Fees', path: '/student/fees' }
    ];
  };

  if (!user) return null;

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h4>Menu</h4>
          <button className="close-sidebar" onClick={closeSidebar}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <nav className="sidebar-nav">
          {getSidebarMenuItems().map((item, index) => (
            <button
              key={index}
              className="sidebar-item"
              onClick={() => navigateTo(item.path)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
          <button className="sidebar-item sidebar-logout" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <button className="hamburger-btn" onClick={toggleSidebar}>
              <i className="bi bi-list"></i>
            </button>
            <h1 className="header-title">My Results</h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{user.username}</span>
                <span className="user-role badge badge-student">
                  STUDENT
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="dashboard-body">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}

          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-text">
              <h2>Academic Performance</h2>
              <p>Track your exam results and academic progress</p>
            </div>
            <div className="welcome-actions">
              <button 
                className="refresh-btn"
                onClick={() => {
                  const token = localStorage.getItem("token");
                  fetchResults(token);
                }}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <i className="bi bi-arrow-clockwise me-2"></i>
                )}
                Refresh
              </button>
              {results.length > 0 && (
                <button 
                  className="download-btn"
                  onClick={handleDownloadAllResults}
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    color: 'white',
                    fontWeight: '600',
                    marginLeft: '12px',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className="bi bi-file-earmark-pdf me-2"></i>
                  Download PDF Reports
                </button>
              )}
            </div>
          </div>

          {/* Results Summary - Dashboard Style */}
          {results.length > 0 && (
            <div className="stats-grid mb-4">
              <div className="stat-card stat-card-primary">
                <div className="stat-icon">
                  <i className="bi bi-journal-text"></i>
                </div>
                <div className="stat-info">
                  <h3>{results.length}</h3>
                  <p>Total Exams</p>
                </div>
              </div>
              <div className="stat-card stat-card-success">
                <div className="stat-icon">
                  <i className="bi bi-graph-up"></i>
                </div>
                <div className="stat-info">
                  <h3>{Math.round(results.reduce((sum, result) => sum + result.percentage, 0) / results.length)}%</h3>
                  <p>Average Score</p>
                </div>
              </div>
              <div className="stat-card stat-card-info">
                <div className="stat-icon">
                  <i className="bi bi-trophy"></i>
                </div>
                <div className="stat-info">
                  <h3>{Math.max(...results.map(r => r.percentage))}%</h3>
                  <p>Best Score</p>
                </div>
              </div>
              <div className="stat-card stat-card-warning">
                <div className="stat-icon">
                  <i className="bi bi-award"></i>
                </div>
                <div className="stat-info">
                  <h3>{results.filter(r => r.grade === 'A+' || r.grade === 'A').length}</h3>
                  <p>A Grades</p>
                </div>
              </div>
            </div>
          )}

          {/* Filters - Dashboard Style */}
          <div className="card shadow-sm mb-4" style={{ borderRadius: '20px', border: 'none' }}>
            <div className="card-body" style={{ padding: '25px' }}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label" style={{ fontWeight: '600', color: '#374151' }}>Academic Year</label>
                  <select 
                    className="form-select"
                    name="academicYear"
                    value={filters.academicYear}
                    onChange={handleFilterChange}
                    style={{ borderRadius: '12px', padding: '10px 15px' }}
                  >
                    <option value="">All Years</option>
                    <option value="2024-25">2024-25</option>
                    <option value="2023-24">2023-24</option>
                    <option value="2022-23">2022-23</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label" style={{ fontWeight: '600', color: '#374151' }}>Exam Type</label>
                  <select 
                    className="form-select"
                    name="examType"
                    value={filters.examType}
                    onChange={handleFilterChange}
                    style={{ borderRadius: '12px', padding: '10px 15px' }}
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
                    style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: '600' }}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Table - Dashboard Style */}
          <div className="card shadow-sm" style={{ borderRadius: '20px', border: 'none' }}>
            <div className="card-header" style={{ background: 'white', borderRadius: '20px 20px 0 0', borderBottom: '1px solid #e5e7eb' }}>
              <h5 className="mb-0" style={{ color: '#1E3A8A', fontWeight: '600' }}>
                <i className="bi bi-graph-up me-2"></i>
                Exam Results
              </h5>
            </div>
            <div className="card-body" style={{ padding: '25px' }}>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading results...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Exam Details</th>
                        <th>Subject</th>
                        <th>Subject Code</th>
                        <th className="text-center">Marks Obtained</th>
                        <th className="text-center">Total Marks</th>
                        <th className="text-center">Percentage</th>
                        <th className="text-center">Grade</th>
                        <th className="text-center">Overall</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => {
                        // Check if result has subjects array
                        if (result.subjects && result.subjects.length > 0) {
                          // Display each subject as a separate row
                          return result.subjects.map((subject, subIdx) => {
                            const subjectPercentage = Math.round((subject.obtainedMarks / subject.maxMarks) * 100);
                            const subjectGrade = getSubjectGrade(subjectPercentage);
                            const isFirstRow = subIdx === 0;
                            
                            return (
                              <tr key={`${index}-${subIdx}`}>
                                {isFirstRow && (
                                  <td rowSpan={result.subjects.length} style={{ verticalAlign: 'middle', borderRight: '2px solid #e5e7eb' }}>
                                    <div>
                                      <div className="fw-bold mb-1">{result.examName}</div>
                                      <span className="badge bg-secondary mb-1" style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px' }}>
                                        {result.examType}
                                      </span>
                                      <div className="small text-muted mt-1">
                                        {new Date(result.examDate).toLocaleDateString()}
                                      </div>
                                      <div className="small text-muted">
                                        {result.academicYear}
                                      </div>
                                    </div>
                                  </td>
                                )}
                                <td>
                                  <strong>{subject.subjectName}</strong>
                                </td>
                                <td>
                                  <span className="badge bg-info" style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px' }}>
                                    {subject.subjectCode}
                                  </span>
                                </td>
                                <td className="text-center">
                                  <strong className={subject.obtainedMarks >= subject.maxMarks * 0.33 ? 'text-success' : 'text-danger'}>
                                    {subject.obtainedMarks}
                                  </strong>
                                </td>
                                <td className="text-center">{subject.maxMarks}</td>
                                <td className="text-center">
                                  <span className={`badge ${getPercentageColor(subjectPercentage)}`} style={{ fontSize: '0.85rem', padding: '6px 12px', borderRadius: '8px' }}>
                                    {subjectPercentage}%
                                  </span>
                                </td>
                                <td className="text-center">
                                  <span className={`badge ${getGradeColor(subjectGrade)}`} style={{ fontSize: '0.85rem', padding: '6px 12px', borderRadius: '8px' }}>
                                    {subjectGrade}
                                  </span>
                                </td>
                                {isFirstRow && (
                                  <td rowSpan={result.subjects.length} className="text-center" style={{ verticalAlign: 'middle', borderLeft: '2px solid #e5e7eb' }}>
                                    <div className="mb-2">
                                      <div className="small text-muted">Total</div>
                                      <strong>{result.totalObtainedMarks}/{result.totalMaxMarks}</strong>
                                    </div>
                                    <div className="mb-2">
                                      <span className={`badge ${getPercentageColor(result.percentage)}`} style={{ fontSize: '0.9rem', padding: '6px 14px', borderRadius: '8px' }}>
                                        {result.percentage}%
                                      </span>
                                    </div>
                                    <div>
                                      <span className={`badge ${getGradeColor(result.overallGrade || result.grade)}`} style={{ fontSize: '0.9rem', padding: '6px 14px', borderRadius: '8px' }}>
                                        {result.overallGrade || result.grade}
                                      </span>
                                    </div>
                                  </td>
                                )}
                                {isFirstRow && (
                                  <td rowSpan={result.subjects.length} style={{ verticalAlign: 'middle' }}>
                                    <button
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() => handleViewDetails(result)}
                                      style={{ borderRadius: '8px' }}
                                    >
                                      <i className="bi bi-eye me-1"></i>
                                      Full Report
                                    </button>
                                  </td>
                                )}
                              </tr>
                            );
                          });
                        } else {
                          // Fallback for old format without subjects array
                          return (
                            <tr key={index}>
                              <td>
                                <div>
                                  <div className="fw-bold mb-1">{result.examName || result.examType}</div>
                                  <span className="badge bg-secondary mb-1" style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px' }}>
                                    {result.examType}
                                  </span>
                                  <div className="small text-muted mt-1">
                                    {new Date(result.examDate).toLocaleDateString()}
                                  </div>
                                  <div className="small text-muted">
                                    {result.academicYear}
                                  </div>
                                </div>
                              </td>
                              <td className="fw-bold">{result.subject || 'N/A'}</td>
                              <td>-</td>
                              <td className="text-center">{result.marksObtained || result.totalObtainedMarks}</td>
                              <td className="text-center">{result.totalMarks || result.totalMaxMarks}</td>
                              <td className="text-center">
                                <span className={`badge ${getPercentageColor(result.percentage)}`} style={{ fontSize: '0.85rem', padding: '6px 12px', borderRadius: '8px' }}>
                                  {result.percentage}%
                                </span>
                              </td>
                              <td className="text-center">
                                <span className={`badge ${getGradeColor(result.grade || result.overallGrade)}`} style={{ fontSize: '0.85rem', padding: '6px 12px', borderRadius: '8px' }}>
                                  {result.grade || result.overallGrade}
                                </span>
                              </td>
                              <td className="text-center">-</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleViewDetails(result)}
                                  style={{ borderRadius: '8px' }}
                                >
                                  <i className="bi bi-eye me-1"></i>
                                  View
                                </button>
                              </td>
                            </tr>
                          );
                        }
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-graph-up" style={{ fontSize: '4rem', color: '#9CA3AF' }}></i>
                  <h4 className="mt-3" style={{ color: '#6B7280' }}>No Results Found</h4>
                  <p style={{ color: '#9CA3AF' }}>No exam results are available yet. Check back later!</p>
                </div>
              )}
            </div>
          </div>

          {/* Detail Modal */}
          {showDetailModal && selectedResult && (
            <>
              <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
              <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
                <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                  <div className="modal-content" style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                    {/* Modal Header */}
                    <div className="modal-header print-header" style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #60A5FA 100%)', borderRadius: '20px 20px 0 0', padding: '20px 30px' }}>
                      <div className="text-white">
                        <h4 className="modal-title mb-1">
                          <i className="bi bi-file-earmark-text me-2"></i>
                          Detailed Result Report
                        </h4>
                        <p className="mb-0 small opacity-75">{selectedResult.examName || selectedResult.examType}</p>
                      </div>
                      <button type="button" className="btn-close btn-close-white no-print" onClick={closeDetailModal}></button>
                    </div>

                    {/* Modal Body */}
                    <div className="modal-body" style={{ padding: '30px' }}>
                      {/* Student & Exam Info */}
                      <div className="row mb-4">
                        <div className="col-md-6">
                          <div className="card" style={{ borderRadius: '15px', border: '1px solid #e5e7eb' }}>
                            <div className="card-body">
                              <h6 className="text-muted mb-3">
                                <i className="bi bi-person-badge me-2"></i>
                                Student Information
                              </h6>
                              <div className="mb-2">
                                <strong>Name:</strong> {
                                  selectedResult.studentName || 
                                  (selectedResult.studentId?.firstName && selectedResult.studentId?.lastName
                                    ? `${selectedResult.studentId.firstName} ${selectedResult.studentId.lastName}`
                                    : user?.fullName || user?.username || 'N/A')
                                }
                              </div>
                              <div className="mb-2">
                                <strong>Roll Number:</strong> {selectedResult.studentRollNumber || selectedResult.rollNumber || 'N/A'}
                              </div>
                              <div className="mb-2">
                                <strong>Class:</strong> {selectedResult.studentClass || selectedResult.class}-{selectedResult.studentSection || selectedResult.section}
                              </div>
                              {selectedResult.attendance && (
                                <div>
                                  <strong>Attendance:</strong> {selectedResult.attendance}%
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card" style={{ borderRadius: '15px', border: '1px solid #e5e7eb' }}>
                            <div className="card-body">
                              <h6 className="text-muted mb-3">
                                <i className="bi bi-calendar-event me-2"></i>
                                Exam Information
                              </h6>
                              <div className="mb-2">
                                <strong>Exam Name:</strong> {selectedResult.examName}
                              </div>
                              <div className="mb-2">
                                <strong>Exam Type:</strong> 
                                <span className="badge bg-secondary ms-2" style={{ fontSize: '0.85rem', padding: '4px 10px', borderRadius: '6px' }}>
                                  {selectedResult.examType}
                                </span>
                              </div>
                              <div className="mb-2">
                                <strong>Academic Year:</strong> {selectedResult.academicYear}
                              </div>
                              <div>
                                <strong>Exam Date:</strong> {new Date(selectedResult.examDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Overall Performance */}
                      <div className="card mb-4" style={{ borderRadius: '15px', border: '2px solid #1E3A8A' }}>
                        <div className="card-header text-white" style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #60A5FA 100%)', borderRadius: '13px 13px 0 0' }}>
                          <h6 className="mb-0">
                            <i className="bi bi-graph-up me-2"></i>
                            Overall Performance
                          </h6>
                        </div>
                        <div className="card-body" style={{ padding: '25px' }}>
                          <div className="row text-center">
                            <div className="col-md-3">
                              <div className="p-3" style={{ background: '#f3f4f6', borderRadius: '12px' }}>
                                <div className="text-muted small mb-1">Total Marks</div>
                                <div className="h4 mb-0 text-primary">{selectedResult.totalObtainedMarks}/{selectedResult.totalMaxMarks}</div>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="p-3" style={{ background: '#f3f4f6', borderRadius: '12px' }}>
                                <div className="text-muted small mb-1">Percentage</div>
                                <div className="h4 mb-0 text-info">{selectedResult.percentage}%</div>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="p-3" style={{ background: '#f3f4f6', borderRadius: '12px' }}>
                                <div className="text-muted small mb-1">Grade</div>
                                <div className="h4 mb-0">
                                  <span className={`badge ${getGradeColor(selectedResult.overallGrade || selectedResult.grade)}`} style={{ fontSize: '1.2rem', padding: '8px 16px' }}>
                                    {selectedResult.overallGrade || selectedResult.grade}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="p-3" style={{ background: '#f3f4f6', borderRadius: '12px' }}>
                                <div className="text-muted small mb-1">Result</div>
                                <div className="h4 mb-0">
                                  <span className={`badge ${selectedResult.result === 'pass' ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '1.2rem', padding: '8px 16px' }}>
                                    {selectedResult.result?.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Subject-wise Breakdown */}
                      {selectedResult.subjects && selectedResult.subjects.length > 0 && (
                        <div className="card mb-4" style={{ borderRadius: '15px', border: '1px solid #e5e7eb' }}>
                          <div className="card-header" style={{ background: 'white', borderBottom: '1px solid #e5e7eb' }}>
                            <h6 className="mb-0" style={{ color: '#1E3A8A', fontWeight: '600' }}>
                              <i className="bi bi-book me-2"></i>
                              Subject-wise Performance
                            </h6>
                          </div>
                          <div className="card-body p-0">
                            <div className="table-responsive">
                              <table className="table table-hover mb-0">
                                <thead className="table-light">
                                  <tr>
                                    <th style={{ padding: '15px' }}>Subject</th>
                                    <th className="text-center">Subject Code</th>
                                    <th className="text-center">Max Marks</th>
                                    <th className="text-center">Obtained Marks</th>
                                    <th className="text-center">Percentage</th>
                                    <th className="text-center">Grade</th>
                                    <th>Remarks</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedResult.subjects.map((subject, idx) => {
                                    const subjectPercentage = Math.round((subject.obtainedMarks / subject.maxMarks) * 100);
                                    const subjectGrade = getSubjectGrade(subjectPercentage);
                                    return (
                                      <tr key={idx}>
                                        <td style={{ padding: '15px' }}>
                                          <strong>{subject.subjectName}</strong>
                                        </td>
                                        <td className="text-center">
                                          <span className="badge bg-secondary" style={{ fontSize: '0.8rem' }}>
                                            {subject.subjectCode}
                                          </span>
                                        </td>
                                        <td className="text-center">{subject.maxMarks}</td>
                                        <td className="text-center">
                                          <strong className={subject.obtainedMarks >= subject.maxMarks * 0.33 ? 'text-success' : 'text-danger'}>
                                            {subject.obtainedMarks}
                                          </strong>
                                        </td>
                                        <td className="text-center">
                                          <span className={`badge ${getPercentageColor(subjectPercentage)}`} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                                            {subjectPercentage}%
                                          </span>
                                        </td>
                                        <td className="text-center">
                                          <span className={`badge ${getGradeColor(subjectGrade)}`} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                                            {subjectGrade}
                                          </span>
                                        </td>
                                        <td>
                                          <small className="text-muted">{subject.remarks || '-'}</small>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Remarks */}
                      {selectedResult.remarks && (
                        <div className="card" style={{ borderRadius: '15px', border: '1px solid #e5e7eb' }}>
                          <div className="card-header" style={{ background: 'white', borderBottom: '1px solid #e5e7eb' }}>
                            <h6 className="mb-0" style={{ color: '#1E3A8A', fontWeight: '600' }}>
                              <i className="bi bi-chat-left-text me-2"></i>
                              Teacher's Remarks
                            </h6>
                          </div>
                          <div className="card-body">
                            <p className="mb-0">{selectedResult.remarks}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Modal Footer */}
                    <div className="modal-footer no-print" style={{ borderTop: '1px solid #e5e7eb', padding: '20px 30px' }}>
                      <button type="button" className="btn btn-secondary" onClick={closeDetailModal} style={{ borderRadius: '10px', padding: '10px 24px' }}>
                        <i className="bi bi-x-circle me-2"></i>
                        Close
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={handlePrintReport}
                        style={{ 
                          background: 'linear-gradient(135deg, #1E3A8A 0%, #60A5FA 100%)',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px 24px'
                        }}
                      >
                        <i className="bi bi-printer me-2"></i>
                        Print Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <p>&copy; Student Management System. All rights reserved.</p>
            <div className="footer-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#support">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default StudentResults;