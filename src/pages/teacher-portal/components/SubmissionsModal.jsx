import React, { useState, useEffect } from 'react';
import { X, ExternalLink, CheckCircle } from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';
import toast from 'react-hot-toast';

const SubmissionsModal = ({ assignment, onClose }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingIds, setGradingIds] = useState({}); // { submissionId: true }
  const [grades, setGrades] = useState({}); // { submissionId: { marks: '', remarks: '' } }

  useEffect(() => {
    fetchSubmissions();
  }, [assignment._id]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/teacher-portal/assignments/${assignment._id}/submissions`);
      setSubmissions(res.data);
      
      // Initialize grades state
      const initialGrades = {};
      res.data.forEach(sub => {
        initialGrades[sub._id] = {
          marks: sub.grade || '',
          remarks: sub.remarks || ''
        };
      });
      setGrades(initialGrades);
    } catch (error) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (id, field, value) => {
    setGrades(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const submitGrade = async (submissionId) => {
    try {
      setGradingIds(prev => ({ ...prev, [submissionId]: true }));
      const payload = {
        grade: grades[submissionId].marks,
        remarks: grades[submissionId].remarks
      };
      await axiosInstance.post(`/teacher-portal/assignments/${assignment._id}/submissions/${submissionId}/grade`, payload);
      toast.success('Grade saved successfully');
      
      // Update local state to show 'Graded'
      setSubmissions(prev => prev.map(s => s._id === submissionId ? { ...s, status: 'Graded', grade: payload.grade, remarks: payload.remarks } : s));
    } catch (error) {
      toast.error('Failed to save grade');
    } finally {
      setGradingIds(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 font-['Inter']">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="font-bold text-lg text-gray-800">Submissions for: {assignment.title}</h2>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">Total Marks: {assignment.totalMarks}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 bg-gray-50/20">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 mt-3 font-medium">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <p className="font-medium">No students have submitted this assignment yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-bold uppercase tracking-wider">
                    <th className="p-4">Student</th>
                    <th className="p-4">Submission Date</th>
                    <th className="p-4">Attachment</th>
                    <th className="p-4 w-1/3">Evaluation (Marks & Feedback)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.map((sub) => {
                    const student = sub.studentId || {};
                    const isGrading = gradingIds[sub._id];
                    return (
                      <tr key={sub._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-gray-800 text-sm">{student.studentName || 'Unknown'}</div>
                          <div className="text-[11px] text-gray-500 font-semibold">{student.rollNo || student.studentId}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-700 font-medium">
                            {new Date(sub.submissionDate).toLocaleDateString()}
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold mt-1 inline-block ${
                            sub.status === 'Graded' ? 'bg-emerald-100 text-emerald-700' :
                            sub.status === 'Late' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {sub.fileUrl ? (
                            <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover font-semibold">
                              <ExternalLink size={14} /> View File
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium italic">No attachment</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <input 
                                type="number" 
                                placeholder="Marks" 
                                className="w-20 border border-gray-200 rounded text-sm p-1.5 outline-none focus:border-primary"
                                value={grades[sub._id]?.marks || ''}
                                onChange={(e) => handleGradeChange(sub._id, 'marks', e.target.value)}
                              />
                              <input 
                                type="text" 
                                placeholder="Remarks / Feedback..." 
                                className="flex-1 border border-gray-200 rounded text-sm p-1.5 outline-none focus:border-primary"
                                value={grades[sub._id]?.remarks || ''}
                                onChange={(e) => handleGradeChange(sub._id, 'remarks', e.target.value)}
                              />
                            </div>
                            <div className="flex justify-end">
                              <button 
                                onClick={() => submitGrade(sub._id)}
                                disabled={isGrading}
                                className="bg-gray-800 hover:bg-black text-white text-[11px] font-bold px-3 py-1.5 rounded-md flex items-center gap-1 disabled:opacity-50 transition-colors"
                              >
                                {isGrading ? 'Saving...' : <><CheckCircle size={12} /> Save Grade</>}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionsModal;
