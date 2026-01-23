import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const StudentAchievements = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    category: ""
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
      fetchProfile(token);
    }
  }, [navigate]);

  const fetchProfile = async (token) => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/profiles/me/profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setProfile(response.data.profile);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to fetch achievements");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAchievement = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !formData.description || !formData.category) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/profiles/${profile._id}/achievements`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess("Achievement added successfully!");
        setFormData({ title: "", description: "", date: "", category: "" });
        setShowAddForm(false);
        fetchProfile(token); // Refresh the profile data
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add achievement");
    }
  };

  const handleEditAchievement = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/profiles/${profile._id}/achievements/${editingAchievement._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess("Achievement updated successfully!");
        setEditingAchievement(null);
        setFormData({ title: "", description: "", date: "", category: "" });
        fetchProfile(token); // Refresh the profile data
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update achievement");
    }
  };

  const handleDeleteAchievement = async (achievementId) => {
    if (!window.confirm("Are you sure you want to delete this achievement?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5000/api/profiles/${profile._id}/achievements/${achievementId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess("Achievement deleted successfully!");
        fetchProfile(token); // Refresh the profile data
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete achievement");
    }
  };

  const startEdit = (achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      title: achievement.title,
      description: achievement.description,
      date: achievement.date ? new Date(achievement.date).toISOString().split('T')[0] : "",
      category: achievement.category
    });
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingAchievement(null);
    setFormData({ title: "", description: "", date: "", category: "" });
    setShowAddForm(false);
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'academic': return 'bg-primary';
      case 'sports': return 'bg-success';
      case 'arts': return 'bg-warning';
      case 'leadership': return 'bg-info';
      case 'community': return 'bg-secondary';
      default: return 'bg-dark';
    }
  };

  if (!user) return null;

  return (
    <div className="min-vh-100 bg-light">
      {/* Top Navigation */}
      <nav className="navbar navbar-dark shadow-sm">
        <div className="container-fluid px-4">
          <span className="navbar-brand mb-0 h1">My Achievements</span>
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
        {success && <div className="alert alert-success">{success}</div>}

        {/* Add Achievement Button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>My Achievements</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add Achievement
          </button>
        </div>

        {/* Add/Edit Achievement Form */}
        {showAddForm && (
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                {editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={editingAchievement ? handleEditAchievement : handleAddAchievement}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Achievement title"
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Academic">Academic</option>
                      <option value="Sports">Sports</option>
                      <option value="Arts">Arts</option>
                      <option value="Leadership">Leadership</option>
                      <option value="Community">Community Service</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your achievement..."
                      required
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary me-2">
                      {editingAchievement ? 'Update Achievement' : 'Add Achievement'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Achievements List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading achievements...</p>
          </div>
        ) : profile?.achievements && profile.achievements.length > 0 ? (
          <div className="row g-4">
            {profile.achievements.map((achievement, index) => (
              <div key={index} className="col-md-6 col-lg-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className={`badge ${getCategoryColor(achievement.category)}`}>
                        {achievement.category}
                      </span>
                      <div className="dropdown">
                        <button 
                          className="btn btn-sm btn-outline-secondary dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                        >
                          <i className="bi bi-three-dots"></i>
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <button 
                              className="dropdown-item"
                              onClick={() => startEdit(achievement)}
                            >
                              <i className="bi bi-pencil me-2"></i>Edit
                            </button>
                          </li>
                          <li>
                            <button 
                              className="dropdown-item text-danger"
                              onClick={() => handleDeleteAchievement(achievement._id)}
                            >
                              <i className="bi bi-trash me-2"></i>Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <h5 className="card-title">{achievement.title}</h5>
                    <p className="card-text text-muted">{achievement.description}</p>
                    {achievement.date && (
                      <small className="text-muted">
                        <i className="bi bi-calendar me-1"></i>
                        {new Date(achievement.date).toLocaleDateString()}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted py-5">
            <i className="bi bi-trophy" style={{ fontSize: '4rem' }}></i>
            <h4 className="mt-3">No Achievements Yet</h4>
            <p>Start adding your achievements to showcase your accomplishments!</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Add Your First Achievement
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAchievements;