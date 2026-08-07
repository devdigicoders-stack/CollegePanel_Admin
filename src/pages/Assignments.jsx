import { useState, useEffect, useRef } from 'react';
import { 
  Search, ChevronDown, Eye, Plus, Edit2, Trash2, X as XIcon,
  ChevronLeft, ChevronRight, CheckCircle, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';
import axiosInstance from '../utils/axiosInstance';
import { checkPermission } from '../utils/checkPermission';
import AccessDenied from '../components/AccessDenied';

const Assignments = () => {
  if (!checkPermission('View Courses') && !checkPermission('Submit Course Assignments')) {
    return <AccessDenied />;
  }
  const [activeTab, setActiveTab] = useState('Pending');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [tabCounts, setTabCounts] = useState({ Pending: 0, Submitted: 0, Graded: 0, Overdue: 0, All: 0 });

  const [filters, setFilters] = useState({
    department: 'All Departments',
    subject: 'All Subjects',
    search: ''
  });

  const [formData, setFormData] = useState({
    assignmentId: '',
    title: '',
    subject: '',
    department: '',
    semester: '',
    section: '',
    description: '',
    dueDate: '',
    totalMarks: '',
    teacherId: '',
    teacherName: ''
  });

  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const searchTimeout = useRef(null);

  const tabs = [
    { name: 'Pending' },
    { name: 'Submitted' },
    { name: 'Graded' },
    { name: 'Overdue' },
    { name: 'All' }
  ];

  useEffect(() => {
    fetchDepartments();
    fetchSubjects();
    fetchTeachers();
    fetchTabCounts();
    fetchSemesters();
    fetchSections();
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [activeTab, filters, pagination.page]);

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get('/academics/departments');
      setDepartments(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch departments', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axiosInstance.get('/academics/subjects');
      setSubjects(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch subjects', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axiosInstance.get('/assignments/teachers');
      setTeachers(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch teachers', error);
    }
  };

  const fetchTabCounts = async () => {
    try {
      const res = await axiosInstance.get('/assignments/stats');
      const data = res.data.data;
      setTabCounts({
        Pending: data.pending || 0,
        Submitted: data.submitted || 0,
        Graded: data.graded || 0,
        Overdue: data.overdue || 0,
        All: data.total || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  const fetchSemesters = async () => {
    try {
      const res = await axiosInstance.get('/academics/semesters');
      setSemesters(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch semesters', error);
    }
  };

  const fetchSections = async () => {
    try {
      const res = await axiosInstance.get('/academics/sections');
      setSections(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch sections', error);
    }
  };

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: activeTab === 'All' ? '' : activeTab,
        department: filters.department,
        subject: filters.subject,
        search: filters.search
      };
      const res = await axiosInstance.get('/assignments', { params });
      setAssignments(res.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.total || 0,
        pages: res.data.pages || 1
      }));
    } catch (error) {
      toast.error('Failed to load assignments');
      console.error('Failed to fetch assignments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value }));
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 400);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Graded': return 'bg-green-100 text-green-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resetForm = () => {
    setFormData({
      assignmentId: '',
      title: '',
      subject: '',
      department: '',
      semester: '',
      section: '',
      description: '',
      dueDate: '',
      totalMarks: '',
      teacherId: '',
      teacherName: ''
    });
    setEditId(null);
  };

  const handleAddAssignment = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditAssignment = (assignment) => {
    setFormData({
      assignmentId: assignment.assignmentId || '',
      title: assignment.title || '',
      subject: assignment.subject || '',
      department: assignment.course || '',
      semester: assignment.semester || '',
      section: assignment.section || '',
      description: assignment.description || '',
      dueDate: assignment.dueDate ? assignment.dueDate.split('T')[0] : '',
      totalMarks: assignment.totalMarks || '',
      teacherId: assignment.teacherId || '',
      teacherName: assignment.teacherName || ''
    });
    setEditId(assignment._id);
    setShowEditModal(true);
  };

  const handleSaveAssignment = async () => {
    if (!formData.title || !formData.subject || !formData.dueDate || !formData.department) {
      toast.error('Please fill all required fields');
      return;
    }
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        course: formData.department,
        assignedDate: new Date().toISOString().split('T')[0],
        totalStudents: 0,
        submittedCount: 0,
        status: 'Pending'
      };
      if (editId) {
        await axiosInstance.put(`/assignments/${editId}`, payload);
        toast.success('Assignment updated successfully');
        setShowEditModal(false);
      } else {
        await axiosInstance.post('/assignments', payload);
        toast.success('Assignment created successfully');
        setShowAddModal(false);
      }
      resetForm();
      fetchAssignments();
      fetchTabCounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save assignment');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignment) => {
    if (!window.confirm(`Delete assignment "${assignment.title}"? This will also remove all submissions.`)) return;
    try {
      await axiosInstance.delete(`/assignments/${assignment._id}`);
      toast.success('Assignment deleted successfully');
      fetchAssignments();
      fetchTabCounts();
    } catch (error) {
      toast.error('Failed to delete assignment');
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      setSubmissionsLoading(true);
      const res = await axiosInstance.get(`/assignments/${assignmentId}/submissions`);
      setSubmissions(res.data.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleEvaluate = (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionsModal(true);
    fetchSubmissions(assignment._id);
  };

  const handleSaveGrade = async (submissionId, grade, remarks) => {
    try {
      await axiosInstance.put(`/assignments/submissions/${submissionId}`, { 
        status: 'Graded', 
        grade, 
        remarks 
      });
      toast.success('Grade saved successfully');
      fetchSubmissions(selectedAssignment._id);
    } catch (error) {
      toast.error('Failed to save grade');
    }
  };

  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setShowViewModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getSubmissionProgress = (submitted, total) => {
    if (!total || total === 0) return 0;
    return Math.round((submitted / total) * 100);
  };

  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const userRole = adminInfo.role || 'college_admin';
  const canEdit = userRole === 'college_admin' || userRole === 'Teacher' || userRole === 'Principal' || userRole === 'HOD';

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 pt-4 pb-2 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Assignments</h2>
          <p className="text-[13px] text-gray-500 mt-1">Manage and track student assignments</p>
        </div>
        {canEdit && (
          <button
            onClick={handleAddAssignment}
            className="flex items-center gap-2 bg-[#0A6C54] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#085a46] transition-colors"
          >
            <Plus size={16} />
            Create Assignment
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex px-6 pt-2 border-b border-gray-100 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => { setActiveTab(tab.name); setPagination(prev => ({ ...prev, page: 1 })); }}
            className={`whitespace-nowrap px-4 py-4 text-[14px] font-semibold transition-all relative flex items-center gap-2 ${
              activeTab === tab.name ? 'text-[#0A6C54]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.name}
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === tab.name ? 'bg-[#0A6C54] text-white' : 'bg-gray-100 text-gray-600'
            }`}>{tabCounts[tab.name] || 0}</span>
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
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer"
          >
            <option>All Departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept.name}>{dept.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative">
          <select
            value={filters.subject}
            onChange={(e) => handleFilterChange('subject', e.target.value)}
            className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer"
          >
            <option>All Subjects</option>
            {subjects.map((subj) => (
              <option key={subj._id} value={subj.name}>{subj.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by title, subject or teacher"
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
              <tr><td colSpan="8" className="py-8"><SkeletonLoader type="table" rows={5} cols={8} /></td></tr>
            ) : assignments.length === 0 ? (
              <tr><td colSpan="8" className="py-8 text-center text-gray-500">No assignments found</td></tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{assignment.assignmentId}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-[13px] text-gray-800 font-medium">{assignment.title}</span>
                      <span className="text-[11px] text-gray-500">{assignment.teacherName}</span>
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
                        onClick={() => handleViewAssignment(assignment)}
                        className="w-8 h-8 rounded-full border border-green-100 flex items-center justify-center text-[#0A6C54] hover:bg-green-50 transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleEvaluate(assignment)}
                        className="w-8 h-8 rounded-full border border-orange-100 flex items-center justify-center text-orange-500 hover:bg-orange-50 transition-colors"
                        title="Evaluate Submissions"
                      >
                        <CheckCircle size={14} />
                      </button>
                      {canEdit && (
                        <>
                          <button
                            onClick={() => handleEditAssignment(assignment)}
                            className="w-8 h-8 rounded-full border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(assignment)}
                            className="w-8 h-8 rounded-full border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
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
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Assignment ID *</label>
                  <input
                    type="text"
                    value={formData.assignmentId}
                    onChange={(e) => setFormData({ ...formData, assignmentId: e.target.value })}
                    placeholder="e.g., ASN2024001"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Binary Trees Implementation"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Subject *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subj) => (
                      <option key={subj._id} value={subj.name}>{subj.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Semester *</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] bg-white"
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(s => (
                      <option key={s._id} value={`Sem ${s.semesterNumber}`}>Sem {s.semesterNumber}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Section *</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] bg-white"
                  >
                    <option value="">Select Section</option>
                    {sections.map(s => (
                      <option key={s._id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Total Marks *</label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                    placeholder="25"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Teacher *</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => {
                      const teacher = teachers.find(t => t._id === e.target.value);
                      setFormData({
                        ...formData,
                        teacherId: e.target.value,
                        teacherName: teacher ? teacher.name : ''
                      });
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter assignment description and instructions..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveAssignment}
                disabled={formLoading}
                className="flex-1 bg-[#0A6C54] text-white py-2.5 rounded-lg hover:bg-[#085a46] transition-colors font-medium text-sm disabled:opacity-50"
              >
                {formLoading ? 'Saving...' : 'Create Assignment'}
              </button>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ASSIGNMENT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Edit Assignment</h3>
              <button onClick={() => { setShowEditModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Assignment ID *</label>
                  <input
                    type="text"
                    value={formData.assignmentId}
                    onChange={(e) => setFormData({ ...formData, assignmentId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Subject *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subj) => (
                      <option key={subj._id} value={subj.name}>{subj.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Semester *</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] bg-white"
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(s => (
                      <option key={s._id} value={`Sem ${s.semesterNumber}`}>Sem {s.semesterNumber}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Section *</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] bg-white"
                  >
                    <option value="">Select Section</option>
                    {sections.map(s => (
                      <option key={s._id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Total Marks *</label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Teacher *</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => {
                      const teacher = teachers.find(t => t._id === e.target.value);
                      setFormData({
                        ...formData,
                        teacherId: e.target.value,
                        teacherName: teacher ? teacher.name : ''
                      });
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveAssignment}
                disabled={formLoading}
                className="flex-1 bg-[#0A6C54] text-white py-2.5 rounded-lg hover:bg-[#085a46] transition-colors font-medium text-sm disabled:opacity-50"
              >
                {formLoading ? 'Updating...' : 'Update Assignment'}
              </button>
              <button
                onClick={() => { setShowEditModal(false); resetForm(); }}
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
                  <DetailRow label="Teacher" value={selectedAssignment.teacherName} />
                  <DetailRow label="Class" value={`${selectedAssignment.semester} - Section ${selectedAssignment.section}`} />
                  <DetailRow label="Department" value={selectedAssignment.course} />
                  <DetailRow label="Total Marks" value={`${selectedAssignment.totalMarks} marks`} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Timeline</h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Assigned Date" value={formatDate(selectedAssignment.assignedDate)} />
                  <DetailRow label="Due Date" value={formatDate(selectedAssignment.dueDate)} />
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
      {/* Submissions Modal */}
      {showSubmissionsModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm font-['Inter']">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Evaluate Submissions</h2>
                <p className="text-[13px] text-gray-500 mt-1 font-medium">{selectedAssignment.title} ({selectedAssignment.subject})</p>
              </div>
              <button 
                onClick={() => setShowSubmissionsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
              >
                <XIcon size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/20">
              {submissionsLoading ? (
                <div className="py-8"><SkeletonLoader type="table" rows={4} cols={5} /></div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No submissions yet for this assignment.</div>
              ) : (
                <div className="space-y-4">
                  {submissions.map(sub => (
                    <div key={sub._id} className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{sub.studentId?.studentName || 'Unknown Student'}</h4>
                          <div className="flex gap-4 mt-1 text-[12px] text-gray-500 font-medium">
                            <span>Roll No: {sub.studentId?.studentId || 'N/A'}</span>
                            <span>Submitted: {new Date(sub.submissionDate).toLocaleString()}</span>
                            <span className={`px-2 py-0.5 rounded-full ${sub.status === 'Graded' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                              {sub.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              if(sub.fileUrl) {
                                window.open(sub.fileUrl, '_blank');
                              } else {
                                toast.error('No file uploaded by student');
                              }
                            }}
                            className="px-3 py-2 bg-[#0A6C54]/10 text-[#0A6C54] hover:bg-[#0A6C54] hover:text-white rounded-lg flex items-center gap-2 text-[13px] font-bold transition-colors"
                          >
                            <FileText size={14} /> View File
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                          <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Marks (out of {selectedAssignment.totalMarks})</label>
                          <input 
                            type="text" 
                            defaultValue={sub.grade || ''}
                            id={`grade-${sub._id}`}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54]"
                            placeholder={`e.g. ${selectedAssignment.totalMarks}`}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Feedback / Remarks</label>
                          <input 
                            type="text" 
                            defaultValue={sub.remarks || ''}
                            id={`remarks-${sub._id}`}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54]"
                            placeholder="Add your feedback..."
                          />
                        </div>
                        <div className="md:col-span-1 flex items-end">
                          <button
                            onClick={() => {
                              const grade = document.getElementById(`grade-${sub._id}`).value;
                              const remarks = document.getElementById(`remarks-${sub._id}`).value;
                              handleSaveGrade(sub._id, grade, remarks);
                            }}
                            className="w-full bg-[#0A6C54] hover:bg-[#085a46] text-white py-2 rounded-lg text-[13px] font-bold transition-colors"
                          >
                            Save Grade
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs font-semibold text-gray-500 mb-1">{label}</span>
    <span className="text-sm text-gray-800 font-medium">{value}</span>
  </div>
);

export default Assignments;