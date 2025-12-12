import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Attendance = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Dummy data
  const students = [
    { id: 1, name: "John Doe", rollNo: "001", class: "10-A", status: "present" },
    { id: 2, name: "Jane Smith", rollNo: "002", class: "10-A", status: "present" },
    { id: 3, name: "Mike Johnson", rollNo: "003", class: "10-A", status: "absent" },
    { id: 4, name: "Sarah Williams", rollNo: "004", class: "10-B", status: "present" },
    { id: 5, name: "Tom Brown", rollNo: "005", class: "10-B", status: "late" },
    { id: 6, name: "Emily Davis", rollNo: "006", class: "10-B", status: "present" },
    { id: 7, name: "David Wilson", rollNo: "007", class: "9-A", status: "present" },
    { id: 8, name: "Lisa Anderson", rollNo: "008", class: "9-A", status: "absent" },
  ];

  const [attendance, setAttendance] = useState(
    students.reduce((acc, student) => {
      acc[student.id] = student.status;
      return acc;
    }, {})
  );

  const handleStatusChange = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "present":
        return "badge bg-success";
      case "absent":
        return "badge bg-danger";
      case "late":
        return "badge bg-warning text-dark";
      default:
        return "badge bg-secondary";
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesClass = selectedClass === "all" || student.class === selectedClass;
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNo.includes(searchTerm);
    return matchesClass && matchesSearch;
  });

  const stats = {
    total: filteredStudents.length,
    present: filteredStudents.filter(s => attendance[s.id] === "present").length,
    absent: filteredStudents.filter(s => attendance[s.id] === "absent").length,
    late: filteredStudents.filter(s => attendance[s.id] === "late").length,
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-calendar-check me-2 text-primary"></i>
            Attendance Management
          </h2>
          <p className="text-muted mb-0">Mark and track student attendance</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-primary">
            <div className="card-body text-center">
              <i className="bi bi-people-fill text-primary" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{stats.total}</h3>
              <small className="text-muted">Total Students</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-success">
            <div className="card-body text-center">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{stats.present}</h3>
              <small className="text-muted">Present</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-danger">
            <div className="card-body text-center">
              <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{stats.absent}</h3>
              <small className="text-muted">Absent</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-warning">
            <div className="card-body text-center">
              <i className="bi bi-clock-fill text-warning" style={{ fontSize: "2rem" }}></i>
              <h3 className="mt-2 mb-0">{stats.late}</h3>
              <small className="text-muted">Late</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Class</label>
              <select
                className="form-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="all">All Classes</option>
                <option value="10-A">Class 10-A</option>
                <option value="10-B">Class 10-B</option>
                <option value="9-A">Class 9-A</option>
                <option value="9-B">Class 9-B</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Search Student</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-primary w-100">
                <i className="bi bi-download me-2"></i>Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">Student Attendance</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="align-middle">
                        <strong>{student.rollNo}</strong>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                               style={{ width: "35px", height: "35px", fontSize: "14px" }}>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          {student.name}
                        </div>
                      </td>
                      <td className="align-middle">
                        <span className="badge bg-info">{student.class}</span>
                      </td>
                      <td className="align-middle">
                        <span className={getStatusBadge(attendance[student.id])}>
                          {attendance[student.id].toUpperCase()}
                        </span>
                      </td>
                      <td className="align-middle">
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            className={`btn ${attendance[student.id] === "present" ? "btn-success" : "btn-outline-success"}`}
                            onClick={() => handleStatusChange(student.id, "present")}
                          >
                            <i className="bi bi-check-circle"></i>
                          </button>
                          <button
                            className={`btn ${attendance[student.id] === "absent" ? "btn-danger" : "btn-outline-danger"}`}
                            onClick={() => handleStatusChange(student.id, "absent")}
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                          <button
                            className={`btn ${attendance[student.id] === "late" ? "btn-warning" : "btn-outline-warning"}`}
                            onClick={() => handleStatusChange(student.id, "late")}
                          >
                            <i className="bi bi-clock"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      <i className="bi bi-inbox" style={{ fontSize: "2rem" }}></i>
                      <p className="mb-0 mt-2">No students found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">Showing {filteredStudents.length} students</span>
            <button className="btn btn-primary">
              <i className="bi bi-save me-2"></i>Save Attendance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
