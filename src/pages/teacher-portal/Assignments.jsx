import React, { useState, useEffect } from 'react';
import { FileText, Plus, X } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import ClassSelector from './components/ClassSelector';

const Assignments = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [classesList, setClassesList] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '', totalMarks: 100 });

  const selectedClassDetails = classesList.find(c => c._id === selectedClass);

  useEffect(() => {
    if (selectedClass) {
      fetchAssignments(selectedClass);
    }
  }, [selectedClass]);

  const fetchAssignments = async (classId) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/teacher-portal/class/${classId}/assignments`);
      setAssignments(res.data || []);
    } catch (error) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(`/teacher-portal/class/${selectedClass}/assignments`, assignmentForm);
      toast.success('Assignment created successfully');
      setShowModal(false);
      setAssignmentForm({ title: '', description: '', dueDate: '', totalMarks: 100 });
      fetchAssignments(selectedClass);
    } catch (error) {
      toast.error('Failed to create assignment');
    }
  };

  return (
    <div className="font-['Inter'] space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight font-['Outfit'] flex items-center gap-2">
            <FileText size={24} className="text-primary" />
            Class Assignments
          </h1>
          <p className="text-[13px] text-gray-500 font-medium mt-1">Create and track assignments for your students.</p>
        </div>
        <ClassSelector selectedClass={selectedClass} setSelectedClass={setSelectedClass} setClassesList={setClassesList} />
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 min-h-[400px]">
        <div className="flex justify-end mb-6">
          <button 
            onClick={() => setShowModal(true)}
            disabled={!selectedClass}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Plus size={16} /> Create Assignment
          </button>
        </div>

        {loading ? (
          <SkeletonLoader type="card" count={3} />
        ) : !selectedClass ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
            <FileText size={48} className="mb-4 opacity-20" />
            <p>Please select a class to view assignments.</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No assignments created yet.</div>
        ) : (
          <div className="space-y-4">
            {assignments.map(a => {
              const isOverdue = new Date(a.dueDate) < new Date();
              return (
                <div key={a._id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-3">
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg mb-1">{a.title}</h4>
                      <div className="flex gap-4 text-xs font-semibold text-gray-500">
                        <span className="flex items-center gap-1">Total Marks: <span className="text-gray-800">{a.totalMarks}</span></span>
                        <span className="flex items-center gap-1">Submissions: <span className="text-primary">{a.submittedCount} / {a.totalStudents}</span></span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-md whitespace-nowrap ${isOverdue ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      Due: {new Date(a.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{a.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-lg">Create Assignment</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateAssignment} className="p-5 space-y-4">
              {selectedClassDetails && (
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-sm text-gray-700">
                  <p className="font-semibold text-blue-900 mb-1">{selectedClassDetails.subjectName} ({selectedClassDetails.subjectCode})</p>
                  <p className="text-xs">Class: {selectedClassDetails.courseName} - {selectedClassDetails.department}</p>
                  <p className="text-xs">Semester: {selectedClassDetails.semester}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Assignment Title</label>
                <input type="text" required value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary" placeholder="E.g., Mid-term Project" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Description / Instructions</label>
                <textarea required rows={3} value={assignmentForm.description} onChange={e => setAssignmentForm({...assignmentForm, description: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary" placeholder="Details about what to submit..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Due Date</label>
                  <input type="date" required value={assignmentForm.dueDate} onChange={e => setAssignmentForm({...assignmentForm, dueDate: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Total Marks</label>
                  <input type="number" required value={assignmentForm.totalMarks} onChange={e => setAssignmentForm({...assignmentForm, totalMarks: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold">Create Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
