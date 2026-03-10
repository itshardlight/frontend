import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/Dashboard.css';

const TimetableManagement = () => {
  const [timetables, setTimetables] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const [formData, setFormData] = useState({
    class: '',
    section: '',
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
    notes: '',
    schedule: days.map(day => ({
      day,
      periods: []
    }))
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if 