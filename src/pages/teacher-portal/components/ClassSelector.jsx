import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import toast from 'react-hot-toast';

const ClassSelector = ({ selectedClass, setSelectedClass, setClassesList }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/teacher-portal/my-classes');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setClasses(data);
      if (setClassesList) setClassesList(data);
      
      if (data.length > 0 && !selectedClass) {
        setSelectedClass(data[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load your assigned classes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-10 bg-gray-100 animate-pulse rounded-lg w-64"></div>;
  }

  if (classes.length === 0) {
    return <div className="text-sm text-red-500 font-semibold">No classes assigned to you.</div>;
  }

  return (
    <select 
      value={selectedClass || ''} 
      onChange={(e) => setSelectedClass(e.target.value)}
      className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full max-w-xs cursor-pointer"
    >
      {classes.map(cls => (
        <option key={cls._id} value={cls._id}>
          {cls.subjectName} ({cls.subjectCode}) - Sem {cls.semester} {cls.teacherName ? `(By: ${cls.teacherName})` : ''}
        </option>
      ))}
    </select>
  );
};

export default ClassSelector;
