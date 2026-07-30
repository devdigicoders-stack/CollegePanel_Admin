import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, CheckSquare, ShieldAlert, Award, FileText, Bookmark, Home, CreditCard } from 'lucide-react';
import axios from 'axios';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const profileRes = await axios.get(`${import.meta.env.VITE_API_URL}/student-portal/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const assignmentsRes = await axios.get(`${import.meta.env.VITE_API_URL}/student-portal/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfile(profileRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const stats = [
    { label: 'Attendance Average', value: '82%', icon: CheckSquare, color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Today\'s Classes', value: '4 Lectures', icon: BookOpen, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Pending Assignments', value: `${assignments.length} Tasks`, icon: FileText, color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { label: 'Upcoming Exam', value: 'Mid-Sem (18-Feb)', icon: Calendar, color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    { label: 'Pending Fee Dues', value: '₹12,500', icon: CreditCard, color: 'bg-red-50', iconColor: 'text-red-500' },
    { label: 'Scholarship Status', value: 'Approved', icon: Award, color: 'bg-teal-50', iconColor: 'text-teal-500' },
    { label: 'Library Issued Books', value: '0 Books', icon: Bookmark, color: 'bg-orange-50', iconColor: 'text-orange-500' },
    { label: 'Hostel Room', value: 'Pending Allotment', icon: Home, color: 'bg-purple-50', iconColor: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6 font-['Inter']">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-[18px] font-bold text-gray-800 mt-2">{stat.value}</h3>
                </div>
                <div className={`${stat.color} p-2.5 rounded-lg flex-shrink-0`}>
                  <Icon className={stat.iconColor} size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-[14px] font-bold text-gray-800 font-semibold uppercase tracking-wider">Today's Class Timetable</h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100 text-gray-500">
              No classes scheduled for today.
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-[14px] font-bold text-gray-800 font-semibold uppercase tracking-wider">Important Notices & Deadlines</h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100 text-gray-500">
              No new notices or deadlines.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
