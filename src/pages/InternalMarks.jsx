import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronDown, Save, Edit2, Check, X as XIcon,
  ChevronLeft, ChevronRight, BookOpen, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const InternalMarks = () => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [marks, setMarks] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    department: 'Computer Science',
    semester: '3rd',
    section: 'A',
    subject: 'Data Structures',
    examType: 'Internal 1'
  });

  const tabs = [
    { name: 'Pending', count: 28 },
    { name: 'Submitted', count: 85 },
    { name: 'Approved', count: 72 }
  ];

  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });

  // Static student data
  const staticStudents = [
    {
      _id: '1',
      rollNo: '2024CS001',
      studentName: 'Rahul Sharma',
      department: 'Computer Science',
      semester: '3rd',
      section: 'A',
      marks: null,
      maxMarks: 30,
      status: 'Pending'
    },
    {
      _id: '2',
      rollNo: '2024CS002',
      studentName: 'Priya Patel',
      department: 'Computer Science',
      semester: '3rd',
      section: 'A',
      marks: null,
      maxMarks: 30,
      status: 'Pending'
    },
    {
      _id: '3',
      rollNo: '2024CS003',
      studentName: 'Amit Kumar',
      department: 'Computer Science',
      semester: '3rd',
      section: 'A',
      marks: null,
      maxMarks: 30,
      status: 'Pending'
    },
    {
      _id: '4',
      rollNo: '2024CS004',
      studentName: 'Sneha Verma',
      department: 'Computer Science',
      semester: '3rd',
      section: 'A',
      marks: 28,
      maxMarks: 30,
      status: 'Submitted'
    },
    {
      _id: '5',
      rollNo: '2024CS005',
      studentName: 'Rohan Joshi',
      department: 'Computer Science',
      semester: '3rd',
      section: 'A',
      marks: 25,
      maxMarks: 30,
      status: 'Approved'
    }
  ];

  useEffect(() => {
    fetchStudents();
  }, [activeTab, filters]);

  const fetchStudents = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    let filtered = staticStudents;
    if (activeTab !== 'All') {
      filtered = staticStudents.filter(s => s.status === activeTab);
    }
    setStudents(filtered);
    setPagination(prev => ({ ...prev, total: filtered.length, pages: Math.ceil(filtered.length / prev.limit) }));
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (student) => {
    setEditingRow(student._id);
    setMarks({ ...marks, [student._id]: student.marks || '' });
  };

  const handleSave = (student) => {
    const enteredMarks = Number(marks[student._id]);
    if (isNaN(enteredMarks) || enteredMarks < 0 || enteredMarks > student.maxMarks) {
      toast.error(`Marks should be between 0 and ${student.maxMarks}`);
      return;
    }
    // TODO: API call to save marks
    toast.success(`Marks saved for ${student.studentName}`);
    setEditingRow(null);
    fetchStudents();
  };

  const handleCancel = () => {
    setEditingRow(null);
    setMarks({});
  };

  const handleMarksChange = (studentId, value) => {
    setMarks({ ...marks, [studentId]: value });
  };

  const handleBulkSubmit = () => {
    const pendingWithMarks = students.filter(s => s.status === 'Pending' && marks[s._id]);
    if (pendingWithMarks.length === 0) {
      toast.error('No marks entered to submit');
      return;
    }
    setShowSubmitModal(true);
  };

  const handleSubmitConfirm = async () => {
    try {
      // TODO: API call to submit all marks
      toast.success('Marks submitted successfully');
      setShowSubmitModal(false);
      fetchStudents();
    } catch (error) {
      toast.error('Failed to submit marks');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 pt-4 pb-2 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Internal Marks Entry</h2>
          <p className="text-[13px] text-gray-500 mt-1">Enter and manage internal examination marks</p>
        </div>
        {activeTab === 'Pending' && (
          <button 
            onClick={handleBulkSubmit}
            className="flex items-center gap-2 bg-[#0A6C54] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#085a46] transition-colors"
          >
            <Save size={16} />
            Submit All Marks
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex px-6 pt-2 border-b border-gray-100 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`whitespace-nowrap px-4 py-4 text-[14px] font-semibold transition-all relative flex items-center gap-2 ${
              activeTab === tab.name ? 'text-[#0A6C54]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.name}
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === tab.name ? 'bg-[#0A6C54] text-white' : 'bg-gray-100 text-gray-600'
            }`}>{tab.count}</span>
            {activeTab === tab.name && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="p-5 flex flex-wrap gap-3 bg-white border-b border-gray-100">
        <div className="relative">
          <select 
            value={filters.department}
            onChange={(e) => setFilters({...filters, department: e.target.value})}
            className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer"
          >
            <option>Computer Science</option>
            <option>Electronics</option>
            <option>Mechanical</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative">
          <select 
            value={filters.semester}
            onChange={(e) => setFilters({...filters, semester: e.target.value})}
            className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer"
          >
            <option>1st</option>
            <option>2nd</option>
            <option>3rd</option>
            <option>4th</option>
            <option>5th</option>
            <option>6th</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative">
          <select 
            value={filters.section}
            onChange={(e) => setFilters({...filters, section: e.target.value})}
            className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer"
          >
            <option>A</option>
            <option>B</option>
            <option>C</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative">
          <select 
            value={filters.subject}
            onChange={(e) => setFilters({...filters, subject: e.target.value})}
            className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer"
          >
            <option>Data Structures</option>
            <option>Algorithms</option>
            <option>Database Management</option>
            <option>Operating Systems</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative">
          <select 
            value={filters.examType}
            onChange={(e) => setFilters({...filters, examType: e.target.value})}
            className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer"
          >
            <option>Internal 1</option>
            <option>Internal 2</option>
            <option>Internal 3</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Info Banner */}
      <div className="mx-6 mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
        <BookOpen size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] text-blue-800 font-semibold">
            {filters.subject} - {filters.examType} | {filters.department} | Semester {filters.semester} - Section {filters.section}
          </p>
          <p className="text-[12px] text-blue-600 mt-0.5">Maximum Marks: 30 | Total Students: {students.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto mt-4">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-[#F9FAFB] border-y border-gray-100">
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%]">Roll No</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[25%]">Student Name</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Semester</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Marks Obtained</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[12%]">Status</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[13%] text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="py-8 text-center text-gray-500">Loading...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan="6" className="py-8 text-center text-gray-500">No students found</td></tr>
            ) : (
              students.map((student) => (
                <tr key={student._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{student.rollNo}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-medium">{student.studentName}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{student.semester} - Sec {student.section}</td>
                  <td className="py-4 px-6">
                    {editingRow === student._id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={student.maxMarks}
                          value={marks[student._id] || ''}
                          onChange={(e) => handleMarksChange(student._id, e.target.value)}
                          className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                          placeholder="0-30"
                        />
                        <span className="text-[13px] text-gray-500">/ {student.maxMarks}</span>
                      </div>
                    ) : (
                      <span className="text-[13px] text-gray-800 font-bold">
                        {student.marks !== null ? `${student.marks} / ${student.maxMarks}` : '-'}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${getStatusColor(student.status)}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      {student.status === 'Pending' && (
                        editingRow === student._id ? (
                          <>
                            <button 
                              onClick={() => handleSave(student)}
                              className="w-8 h-8 rounded-full border border-green-100 flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors"
                              title="Save"
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              onClick={handleCancel}
                              className="w-8 h-8 rounded-full border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                              title="Cancel"
                            >
                              <XIcon size={14} />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleEdit(student)}
                            className="w-8 h-8 rounded-full border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Marks"
                          >
                            <Edit2 size={14} />
                          </button>
                        )
                      )}
                      {student.status !== 'Pending' && (
                        <span className="text-[12px] text-gray-400">View Only</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-gray-100 gap-4">
        <div className="text-[13px] text-gray-500 font-medium">
          Showing {students.length} of {pagination.total} entries | Page {pagination.page} of {pagination.pages}
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0A6C54] text-white text-[13px] font-medium">
            {pagination.page}
          </button>
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
            disabled={pagination.page === pagination.pages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* SUBMIT CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertTriangle size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Submit Marks</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit all entered marks? This action cannot be undone and marks will be locked for approval.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={handleSubmitConfirm}
                className="flex-1 bg-[#0A6C54] text-white py-2 rounded-lg hover:bg-[#085a46] transition-colors font-medium text-sm"
              >
                Submit Marks
              </button>
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternalMarks;
