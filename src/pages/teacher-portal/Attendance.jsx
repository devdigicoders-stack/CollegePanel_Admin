import React, { useState, useEffect } from 'react';
import { CalendarCheck, Save } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import ClassSelector from './components/ClassSelector';

const Attendance = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedClass) {
      fetchClassData();
    }
  }, [selectedClass, attendanceDate]);

  const fetchClassData = async () => {
    setLoading(true);
    try {
      // Fetch students and attendance in parallel
      const [studentsRes, attendanceRes] = await Promise.all([
        axiosInstance.get(`/teacher-portal/class/${selectedClass}/students`),
        axiosInstance.get(`/teacher-portal/class/${selectedClass}/attendance?date=${attendanceDate}`)
      ]);
      
      const studentsList = studentsRes.data || [];
      setStudents(studentsList);
      
      const recordsMap = {};
      const attData = attendanceRes.data;
      if (attData && attData.records && attData.records.length > 0) {
        attData.records.forEach(r => {
          recordsMap[r.studentId._id || r.studentId] = r.status;
        });
      } else {
        studentsList.forEach(s => { recordsMap[s._id] = 'Present'; });
      }
      setAttendanceRecords(recordsMap);

    } catch (error) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass) return;
    setSaving(true);
    try {
      const records = Object.keys(attendanceRecords).map(studentId => ({
        studentId,
        status: attendanceRecords[studentId],
        remarks: ''
      }));

      await axiosInstance.post(`/teacher-portal/class/${selectedClass}/attendance`, {
        date: attendanceDate,
        records
      });
      toast.success('Attendance saved successfully');
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="font-['Inter'] space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight font-['Outfit'] flex items-center gap-2">
            <CalendarCheck size={24} className="text-primary" />
            Class Attendance
          </h1>
          <p className="text-[13px] text-gray-500 font-medium mt-1">Mark daily attendance for your selected class.</p>
        </div>
        <ClassSelector selectedClass={selectedClass} setSelectedClass={setSelectedClass} />
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden min-h-[400px]">
        {/* Controls */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Select Date:</label>
            <input 
              type="date" 
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            />
          </div>
          <button 
            onClick={handleSaveAttendance}
            disabled={saving || !selectedClass || students.length === 0}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-6"><SkeletonLoader type="table" rows={6} cols={3} /></div>
        ) : !selectedClass ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
            <CalendarCheck size={48} className="mb-4 opacity-20" />
            <p>Please select a class to mark attendance.</p>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
            <p>No students found in this class.</p>
          </div>
        ) : (
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-16">Roll No</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student Name</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status (P/A/L)</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                    <td className="py-3 px-4 text-sm font-bold text-primary">{s.studentId}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-semibold text-gray-800">{s.studentName}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        {['Present', 'Absent', 'Late'].map(status => (
                          <button
                            key={status}
                            onClick={() => setAttendanceRecords(prev => ({ ...prev, [s._id]: status }))}
                            className={`w-9 h-9 rounded-xl text-xs font-black tracking-wide transition-all ${
                              attendanceRecords[s._id] === status
                                ? status === 'Present' ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500 shadow-sm'
                                : status === 'Absent' ? 'bg-red-100 text-red-700 border-2 border-red-500 shadow-sm'
                                : 'bg-orange-100 text-orange-700 border-2 border-orange-500 shadow-sm'
                                : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {status.charAt(0)}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
