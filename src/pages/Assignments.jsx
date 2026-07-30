import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronDown, Eye, Plus, Edit2, Trash2, X as XIcon,
  ChevronLeft, ChevronRight, Calendar, BookOpen, Users
} from 'lucide-react';
import toast from 'react-hot-toast';

const Assignments = () => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  
  // Filters
  const [filters, setFilters] = useState({
    department: 'All Departments',
    semester: 'All Semesters',
    subject: 'All Subjects',
    search: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    department: '',
    semester: '',
    section: '',
    description: '',
    dueDate: '',
    totalMarks: '',
    attachments: []
  });

  const tabs = [
    { name: 'Pending', count: 12 },
    { name: 'Submitted', count: 45 },
    { name: 'Graded', count: 38 },
    { name: 'Overdue', count: 5 },
    { name: 'All', count: 100 }
  ];

  // Static data
  const staticAssignments = [
    {
      _id: '1',
      assignmentId: 'ASN2024001',
      title: 'Data Structures - Binary Trees Implementation',
      subject: 'Data Structures',
      teacher: 'Dr. Rajesh Kumar',
      department: 'Computer Science',
      semester: '3rd',
      section: 'A',
      assignedDate: '2024-02-10',
      dueDate: '2024-02-20',
      totalMarks: 25,
      submittedCount: 35,
      totalStudents: 45,
      status: 'Pending',
      description: 'Implement binary search tree with insert, delete, and search operations'
    },
    {
      _id: '2',
      assignmentId: 'ASN2024002',
      title: 'Digital Logic - Half Adder Circuit Design',
      subject: 'Digital Electronics',
      teacher: 'Prof. Meena Sharma',
      department: 'Electronics',
      semester: '2nd',
      section: 'B',
      assignedDate: '2024-02-08',
      dueDate: '2024-02-18',
      totalMarks: 20,
      submittedCount: 40,
      totalStudents: 42,
      status: 'Submitted',
      description: 'Design and simulate half adder circuit using logic gates'
    },
    {
      _id: '3',
      assignmentId: 'ASN2024003',
      title: 'Thermodynamics - Energy Balance Problems',
      subject: 'Thermodynamics',
      teacher: 'Mr. Anil Verma',
      department: 'Mechanical',
      semester: '4th',
      section: 'A',
      assignedDate: '2024-02-05',
      dueDate: '2024-02-15',
      totalMarks: 30,
      submittedCount: 38,
      totalStudents: 40,
      status: 'Graded',
      description: 'Solve 5 problems on first and second law of thermodynamics'
    }
  ];

  useEffect(() => {
    fetchAssignments();
  }, [activeTab, filters]);

  const fetchAssignments = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    let filtered = staticAssignments;
    if (activeTab !== 'All') {
      filtered = staticAssignments.filter(a => a.status === activeTab);
    }
    setAssignments(filtered);
    setPagination(prev => ({ ...prev, total: filtered.length, pages: Math.ceil(filtered.length / prev.limit) }));
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Graded': return 'bg-green-100 text-green-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddAssignment = () => {
    setFormData({
      title: '',
      subject: '',
      department: '',
      semester: '',
      section: '',
      description: '',
      dueDate: '',
      totalMarks: '',
      attachments: []
    });
    setShowAddModal(true);
  };

  const handleSaveAssignment = async () => {
    if (!formData.title || !formData.subject || !formData.dueDate) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      // TODO: API call
      toast.success('Assignment created successfully');
      setShowAddModal(false);
      fetchAssignments();
    } catch (error) {
      toast.error('Failed to create assignment');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getSubmissionProgress = (submitted, total) => {
    return Math.round((submitted / total) * 100);
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 pt-4 pb-2 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Assignments</h2>
          <p className="text-[13px] text-gray-500 mt-1">Manage and track student assignments</p>
        </div>
        <button 
          onClick={handleAddAssignment}
          className="flex items-center gap-2 bg-[#0A6C54] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#085a46] transition-colors"
        >
          <Plus size={16} />
          Create Assignment
        </button>
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
            <option>All Departments</option>
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
            <option>All Semesters</option>
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            placeholder="Search by title or subject" 
            className="w-[260px] bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-[#F9FAFB] border-y border-gray-100">
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%]">Assignment ID</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[20%]">Title</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[12%]">Subject</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%]">Class</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%]">Due Date</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[12%]">Submissions</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%]">Status</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[16%] text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="py-8 text-center text-gray-500">Loading...</td></tr>
            ) : assignments.length === 0 ? (
              <tr><td colSpan="8" className="py-8 text-center text-gray-500">No assignments found</td></tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{assignment.assignmentId}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-[13px] text-gray-800 font-medium">{assignment.title}</span>
                      <span className="text-[11px] text-gray-500">{assignment.teacher}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{assignment.subject}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{assignment.semester} - Sec {assignment.section}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{formatDate(assignment.dueDate)}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] text-gray-600 font-medium">
                        {assignment.submittedCount}/{assignment.totalStudents}
                      </span>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-[#0A6C54] h-1.5 rounded-full" 
                          style={{ width: `${getSubmissionProgress(assignment.submittedCount, assignment.totalStudents)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => { setSelectedAssignment(assignment); setShowViewModal(true); }}
                        className="w-8 h-8 rounded-full border border-green-100 flex items-center justify-center text-[#0A6C54] hover:bg-green-50 transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        className="w-8 h-8 rounded-full border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        className="w-8 h-8 rounded-full border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
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
          Showing {assignments.length} of {pagination.total} entries | Page {pagination.page} of {pagination.pages}
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

      {/* ADD ASSIGNMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Create New Assignment</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Assignment Title *</label>
                <input 
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Binary Trees Implementation"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Subject *</label>
                  <input 
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="e.g., Data Structures"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Total Marks *</label>
                  <input 
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({...formData, totalMarks: e.target.value})}
                    placeholder="25"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Semester *</label>
                  <select 
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="">Select</option>
                    <option>1st</option>
                    <option>2nd</option>
                    <option>3rd</option>
                    <option>4th</option>
                    <option>5th</option>
                    <option>6th</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Section *</label>
                  <select 
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="">Select</option>
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Due Date *</label>
                  <input 
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter assignment description and instructions..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={handleSaveAssignment}
                className="flex-1 bg-[#0A6C54] text-white py-2.5 rounded-lg hover:bg-[#085a46] transition-colors font-medium text-sm"
              >
                Create Assignment
              </button>
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Assignment Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Assignment ID" value={selectedAssignment.assignmentId} />
                <DetailRow label="Status" value={<span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(selectedAssignment.status)}`}>{selectedAssignment.status}</span>} />
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Assignment Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Title" value={selectedAssignment.title} />
                  <DetailRow label="Subject" value={selectedAssignment.subject} />
                  <DetailRow label="Teacher" value={selectedAssignment.teacher} />
                  <DetailRow label="Class" value={`${selectedAssignment.semester} - Section ${selectedAssignment.section}`} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Timeline</h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Assigned Date" value={formatDate(selectedAssignment.assignedDate)} />
                  <DetailRow label="Due Date" value={formatDate(selectedAssignment.dueDate)} />
                  <DetailRow label="Total Marks" value={`${selectedAssignment.totalMarks} marks`} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Description</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedAssignment.description}</p>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Submission Progress</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Submitted: <strong>{selectedAssignment.submittedCount}</strong> / {selectedAssignment.totalStudents}</span>
                    <span className="text-sm font-bold text-[#0A6C54]">{getSubmissionProgress(selectedAssignment.submittedCount, selectedAssignment.totalStudents)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#0A6C54] h-2 rounded-full transition-all" 
                      style={{ width: `${getSubmissionProgress(selectedAssignment.submittedCount, selectedAssignment.totalStudents)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowViewModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
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

// Helper Component
const DetailRow = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs font-semibold text-gray-500 mb-1">{label}</span>
    <span className="text-sm text-gray-800 font-medium">{value}</span>
  </div>
);

export default Assignments;
