const StudentDashboard = () => {
  return (
    <>
      {/* Quick Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-primary">
            <div className="card-body text-center">
              <i className="bi bi-book" style={{ fontSize: "2rem", color: "#0d6efd" }}></i>
              <h3 className="mt-2 mb-0">0</h3>
              <small className="text-muted">Enrolled Subjects</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-success">
            <div className="card-body text-center">
              <i className="bi bi-calendar-check" style={{ fontSize: "2rem", color: "#198754" }}></i>
              <h3 className="mt-2 mb-0">0%</h3>
              <small className="text-muted">Attendance Rate</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-warning">
            <div className="card-body text-center">
              <i className="bi bi-file-earmark-text" style={{ fontSize: "2rem", color: "#ffc107" }}></i>
              <h3 className="mt-2 mb-0">0</h3>
              <small className="text-muted">Pending Assignments</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-info">
            <div className="card-body text-center">
              <i className="bi bi-trophy" style={{ fontSize: "2rem", color: "#0dcaf0" }}></i>
              <h3 className="mt-2 mb-0">0</h3>
              <small className="text-muted">Average Grade</small>
            </div>
          </div>
        </div>
      </div>

      {/* Main Features */}
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-clock me-2 text-primary"></i>
                Today's Classes
              </h5>
              <p className="text-muted small">View today's schedule</p>
              <div className="small">
                <p className="mb-1"><strong>No classes scheduled</strong></p>
                <p className="text-muted mb-0">Check your timetable for upcoming classes</p>
              </div>
              <button className="btn btn-primary btn-sm w-100 mt-3">View Full Timetable</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-book-half me-2 text-success"></i>
                Subjects Enrolled
              </h5>
              <p className="text-muted small">Your current subjects</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Subject list</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Teacher details</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Course materials</li>
              </ul>
              <button className="btn btn-success btn-sm w-100 mt-2">View Subjects</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-file-earmark-text me-2 text-warning"></i>
                Assignments & Homework
              </h5>
              <p className="text-muted small">Pending and submitted work</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>View assignments</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Submit work</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Check deadlines</li>
              </ul>
              <button className="btn btn-warning btn-sm w-100 mt-2">View Assignments</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-graph-up me-2 text-info"></i>
                My Results & Grades
              </h5>
              <p className="text-muted small">View your academic performance</p>
              <div className="small mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Current Average:</span>
                  <span className="badge bg-success">83.4%</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Class Rank:</span>
                  <span className="badge bg-info">12/45</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Latest Grade:</span>
                  <span className="badge bg-primary">A</span>
                </div>
              </div>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Subject grades</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Test scores</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Download report card</li>
              </ul>
              <button className="btn btn-info btn-sm w-100 mt-2">View Full Results</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-calendar-check me-2 text-danger"></i>
                Attendance Record
              </h5>
              <p className="text-muted small">Track your attendance</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Daily attendance</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Monthly summary</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Subject-wise record</li>
              </ul>
              <button className="btn btn-danger btn-sm w-100 mt-2">View Attendance</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-megaphone me-2 text-secondary"></i>
                Notice Board
              </h5>
              <p className="text-muted small">School announcements and events</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Important notices</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Exam schedules</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Fee reminders</li>
              </ul>
              <button className="btn btn-secondary btn-sm w-100 mt-2">View Notices</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-upload me-2" style={{ color: "#6f42c1" }}></i>
                Upload Documents
              </h5>
              <p className="text-muted small">Submit required documents</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Upload files</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>View submissions</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Document status</li>
              </ul>
              <button className="btn btn-sm w-100 mt-2" style={{ backgroundColor: "#6f42c1", color: "white" }}>Upload Documents</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-chat-dots me-2 text-primary"></i>
                Contact Teachers
              </h5>
              <p className="text-muted small">Message your teachers</p>
              <ul className="list-unstyled small">
                <li><i className="bi bi-check-circle text-success me-2"></i>Send messages</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Ask questions</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>View responses</li>
              </ul>
              <button className="btn btn-primary btn-sm w-100 mt-2">Open Messages</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
