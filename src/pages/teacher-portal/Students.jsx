import React, { useState, useEffect } from 'react';
import { Users, Eye, X, Phone, Mail, MapPin, Calendar, User, Heart } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import ClassSelector from './components/ClassSelector';

const Students = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  const fetchStudents = async (classId) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/teacher-portal/class/${classId}/students`);
      setStudents(res.data || []);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-['Inter'] space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight font-['Outfit'] flex items-center gap-2">
            <Users size={24} className="text-primary" />
            Class Students
          </h1>
          <p className="text-[13px] text-gray-500 font-medium mt-1">View all students enrolled in your selected class.</p>
        </div>
        <ClassSelector selectedClass={selectedClass} setSelectedClass={setSelectedClass} />
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-6"><SkeletonLoader type="table" rows={6} cols={4} /></div>
        ) : !selectedClass ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
            <Users size={48} className="mb-4 opacity-20" />
            <p>Please select a class to view students.</p>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
            <p>No students found in this class.</p>
          </div>
        ) : (
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-3 px-4 text-xs font-bold text-gray-700">Roll No / ID</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-700">Name</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-700">Email</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-700">Phone</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-700 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-bold text-primary">{s.studentId}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 font-semibold">{s.studentName}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 font-medium">{s.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 font-medium">{s.phone}</td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => setSelectedStudent(s)}
                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <User size={20} className="text-primary" /> 
                Student Details
              </h2>
              <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex items-center gap-5 mb-8 bg-primary/5 p-5 rounded-xl border border-primary/10">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold uppercase shadow-sm">
                  {selectedStudent.studentName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedStudent.studentName}</h3>
                  <p className="text-sm font-semibold text-primary">{selectedStudent.studentId} • {selectedStudent.year}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Mail size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Email</p>
                        <p className="text-sm font-medium text-gray-800">{selectedStudent.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Phone</p>
                        <p className="text-sm font-medium text-gray-800">{selectedStudent.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Address</p>
                        <p className="text-sm font-medium text-gray-800">{selectedStudent.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Personal Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Date of Birth</p>
                        <p className="text-sm font-medium text-gray-800">
                          {selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Heart size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Blood Group</p>
                        <p className="text-sm font-medium text-gray-800">{selectedStudent.bloodGroup || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Gender</p>
                        <p className="text-sm font-medium text-gray-800">{selectedStudent.gender || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Guardian Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Father's Name</p>
                      <p className="text-sm font-medium text-gray-800 mb-2">{selectedStudent.fatherName || 'N/A'}</p>
                      <p className="text-xs text-gray-500 font-semibold">Father's Mobile</p>
                      <p className="text-sm font-medium text-gray-800">{selectedStudent.fatherMobile || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Mother's Name</p>
                      <p className="text-sm font-medium text-gray-800 mb-2">{selectedStudent.motherName || 'N/A'}</p>
                      <p className="text-xs text-gray-500 font-semibold">Mother's Mobile</p>
                      <p className="text-sm font-medium text-gray-800">{selectedStudent.motherMobile || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
