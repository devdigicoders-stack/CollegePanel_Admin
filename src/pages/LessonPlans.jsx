import { useState, useEffect, useCallback } from 'react';
import { 
  Search, ChevronDown, Eye, Check, X as XIcon, Plus,
  ChevronLeft, ChevronRight, FileText, Download, Upload,
  Loader2, AlertCircle, Filter, RefreshCw, Trash2, XCircle
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';
import { checkPermission } from '../utils/checkPermission';
import AccessDenied from '../components/AccessDenied';

const STATUS_OPTIONS = ['Pending', 'Submitted', 'Approved', 'Rejected'];

const LessonPlans = () => {
  if (!checkPermission('View Courses') && !checkPermission('Manage Courses')) {
    return <AccessDenied />;
  }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [lessonPlans, setLessonPlans] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);

  const [filters, setFilters] = useState({
    department: 'All Departments',
    subject: 'All Subjects',
    status: 'All',
    search: ''
  });

  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    planId: '',
    teacherId: '',
    teacherName: '',
    department: '',
    subject: '',
    semester: '',
    section: '',
    week: '',
    month: '',
    topic: '',
    description: '',
    objectives: '',
    resources: '',
    status: 'Pending'
  });

  const [rejectReason, setRejectReason] = useState('');

  const fetchStaticData = useCallback(async () => {
    try {
      const [deptRes, subjRes, teacherRes, semRes, secRes] = await Promise.all([
        axiosInstance.get('/academics/departments'),
        axiosInstance.get('/academics/subjects'),
        axiosInstance.get('/teachers/list/all'),
        axiosInstance.get('/academics/semesters'),
        axiosInstance.get('/academics/sections')
      ]);
      setDepartments(deptRes.data.data || deptRes.data || []);
      setSubjects(subjRes.data.data || subjRes.data || []);
      const allTeachers = teacherRes.data.data || teacherRes.data || [];
      setTeachers(allTeachers);
      setSemesters(semRes.data.data || semRes.data || []);
      setSections(secRes.data.data || secRes.data || []);
    } catch {
      toast.error('Failed to load filter options');
    }
  }, []);

  const fetchLessonPlans = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.department && filters.department !== 'All Departments') params.department = filters.department;
      if (filters.subject && filters.subject !== 'All Subjects') params.subject = filters.subject;
      if (filters.status && filters.status !== 'All') params.status = filters.status;
      if (filters.search) params.search = filters.search;
      params.page = pagination.page;
      params.limit = pagination.limit;

      const res = await axiosInstance.get('/lesson-plans', { params });
      const data = res.data.data || res.data;
      setLessonPlans(data);
      setPagination({
        page: res.data.page || 1,
        limit: res.data.limit || 10,
        total: res.data.total || data.length,
        pages: res.data.pages || 1
      });
    } catch {
      toast.error('Failed to fetch lesson plans');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStaticData(), fetchLessonPlans()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      handleFilterChange('search', e.target.value);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (e) => {
    setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }));
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTeacherSelect = (teacherId) => {
    const teacher = teachers.find(t => t._id === teacherId);
    if (teacher) {
      setFormData(prev => ({
        ...prev,
        teacherId,
        teacherName: teacher.name,
        department: teacher.department || ''
      }));
    }
  };

  const handleSaveAdd = async () => {
    if (!formData.planId || !formData.teacherName || !formData.subject || !formData.topic) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      setSaving(true);
      await axiosInstance.post('/lesson-plans', formData);
      toast.success('Lesson plan added successfully!');
      setShowAddModal(false);
      setFormData({
        planId: '', teacherId: '', teacherName: '', department: '', subject: '',
        semester: '', section: '', week: '', month: '', topic: '', description: '',
        objectives: '', resources: '', status: 'Pending'
      });
      fetchLessonPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add lesson plan');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (plan) => {
    setSelectedPlan(plan);
    setShowApproveModal(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedPlan) return;
    try {
      setActionLoading(true);
      await axiosInstance.post(`/lesson-plans/${selectedPlan._id}/approve`);
      toast.success('Lesson plan approved successfully!');
      setShowApproveModal(false);
      setSelectedPlan(null);
      fetchLessonPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve lesson plan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPlan || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      setActionLoading(true);
      await axiosInstance.post(`/lesson-plans/${selectedPlan._id}/reject`, { rejectionReason: rejectReason });
      toast.success('Lesson plan rejected');
      setShowRejectModal(false);
      setShowApproveModal(false);
      setSelectedPlan(null);
      setRejectReason('');
      fetchLessonPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject lesson plan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await axiosInstance.delete(`/lesson-plans/${deleteTarget._id}`);
      toast.success('Lesson plan deleted successfully!');
      setDeleteTarget(null);
      fetchLessonPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete lesson plan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (lessonPlans.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Plan ID', 'Teacher', 'Department', 'Subject', 'Semester', 'Week', 'Topic', 'Status'];
    const rows = lessonPlans.map(p => [
      p.planId || '',
      p.teacherName || '',
      p.department || '',
      p.subject || '',
      p.semester || '',
      p.week || '',
      p.topic || '',
      p.status || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lesson_plans_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully!');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { name: 'Pending', status: 'Pending' },
    { name: 'Submitted', status: 'Submitted' },
    { name: 'Approved', status: 'Approved' },
    { name: 'Rejected', status: 'Rejected' },
    { name: 'All', status: 'All' }
  ];

  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const userRole = adminInfo.role || 'college_admin';
  const canApprove = userRole === 'college_admin' || userRole === 'Principal' || userRole === 'HOD';
  const canEdit = canApprove || userRole === 'Teacher';

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 pt-4 pb-2 gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Lesson Plans</h2>
          <p className="text-[12px] sm:text-[13px] text-gray-500 mt-1">Manage teacher lesson plans and approvals</p>
        </div>
        {canEdit && (
          <button
            onClick={() => { setShowAddModal(true); setFormData({
              planId: '', teacherId: '', teacherName: '', department: '', subject: '',
              semester: '', section: '', week: '', month: '', topic: '', description: '',
              objectives: '', resources: '', status: 'Pending'
            }); }}
            className="flex items-center justify-center sm:justify-start gap-2 bg-[#0A6C54] text-white px-4 py-2.5 sm:py-2 rounded-lg text-[13px] font-semibold hover:bg-[#085a46] transition-colors whitespace-nowrap w-full sm:w-auto shadow-sm"
          >
            <Plus size={16} />
            Add Lesson Plan
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex px-6 pt-2 border-b border-gray-100 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.name}
            onClick={() => handleFilterChange('status', tab.status)}
            className={`whitespace-nowrap px-4 py-4 text-[14px] font-semibold transition-all relative flex items-center gap-2 ${
              (filters.status === tab.status || (tab.status === 'All' && filters.status === 'All'))
                ? 'text-[#0A6C54]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.name}
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              (filters.status === tab.status || (tab.status === 'All' && filters.status === 'All'))
                ? 'bg-[#0A6C54] text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {tab.name === 'All' ? pagination.total : ''}
            </span>
            {(filters.status === tab.status || (tab.status === 'All' && filters.status === 'All')) && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="p-5 flex flex-wrap gap-4 items-center bg-white border-b border-gray-50">
        <div className="relative flex-1 min-w-[140px]">
          <select
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option>All Departments</option>
            {departments.map(dept => (
              <option key={dept._id} value={dept.name}>{dept.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative flex-1 min-w-[140px]">
          <select
            value={filters.subject}
            onChange={(e) => handleFilterChange('subject', e.target.value)}
            className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option>All Subjects</option>
            {subjects.map(subj => (
              <option key={subj._id} value={subj.name}>{subj.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by teacher, subject, or topic..."
            defaultValue={filters.search}
            onKeyDown={handleSearch}
            className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] placeholder:text-gray-400"
          />
        </div>

        <button
          onClick={() => { setFilters({ department: 'All Departments', subject: 'All Subjects', status: 'All', search: '' }); setPagination(prev => ({ ...prev, page: 1 })); }}
          className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw size={14} />
          Clear
        </button>

        <button
          onClick={handleExportCSV}
          className="w-full sm:w-auto bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={8} />
        ) : lessonPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText size={40} className="mb-3 opacity-30" />
            <p className="text-[13px] font-medium">No lesson plans found.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-[#F9FAFB] border-y border-gray-100">
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800">Plan ID</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800">Teacher</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800">Subject</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800">Semester</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800">Week</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800">Topic</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {lessonPlans.map((plan) => (
                <tr key={plan._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{plan.planId}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-[13px] text-gray-800 font-medium">{plan.teacherName}</span>
                      <span className="text-[11px] text-gray-500">{plan.department}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{plan.subject}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{plan.semester} - Sec {plan.section}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">Week {plan.week}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{plan.topic}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${getStatusColor(plan.status)}`}>
                      {plan.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setSelectedPlan(plan); setShowViewModal(true); }}
                        className="w-8 h-8 rounded-full border border-green-100 flex items-center justify-center text-[#0A6C54] hover:bg-green-50 transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      {canApprove && (
                        <>
                          {plan.status !== 'Approved' && (
                            <button
                              onClick={() => handleApprove(plan)}
                              className="w-8 h-8 rounded-full border border-green-100 flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors"
                              title="Approve"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          {plan.status !== 'Rejected' && (
                            <button
                              onClick={() => { setSelectedPlan(plan); setShowRejectModal(true); }}
                              className="w-8 h-8 rounded-full border border-red-100 flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors"
                              title="Reject"
                            >
                              <XCircle size={14} />
                            </button>
                          )}
                        </>
                      )}
                      {canEdit && (
                        <button
                          onClick={() => { setDeleteTarget(plan); handleDelete(); }}
                          className="w-8 h-8 rounded-full border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-gray-100 gap-4">
        <div className="text-[13px] text-gray-500 font-medium">
          Showing {lessonPlans.length} of {pagination.total} entries | Page {pagination.page} of {pagination.pages}
        </div>
        <div className="flex items-center gap-1">
          <select
            value={pagination.limit}
            onChange={handleLimitChange}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-1.5 px-2 rounded text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0A6C54] text-white text-[13px] font-medium">
            {pagination.page}
          </button>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Add New Lesson Plan</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Plan ID *</label>
                  <input
                    type="text"
                    name="planId"
                    value={formData.planId}
                    onChange={handleInputChange}
                    placeholder="e.g., LP2024001"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Teacher *</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => handleTeacherSelect(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(t => (
                      <option key={t._id} value={t._id}>{t.name} ({t.designation})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Subject *</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] bg-white"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] bg-white"
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Semester</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] bg-white"
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(s => <option key={s._id} value={`Sem ${s.semesterNumber}`}>Sem {s.semesterNumber}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Section</label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] bg-white"
                  >
                    <option value="">Select Section</option>
                    {sections.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Week</label>
                  <input
                    type="text"
                    name="week"
                    value={formData.week}
                    onChange={handleInputChange}
                    placeholder="e.g., 5"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Month</label>
                  <input
                    type="text"
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    placeholder="e.g., February"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Topic *</label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="e.g., Binary Search Trees"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter lesson plan description..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveAdd}
                disabled={saving}
                className="flex-1 bg-[#0A6C54] text-white py-2.5 rounded-lg hover:bg-[#085a46] disabled:bg-gray-400 transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Add Lesson Plan
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
      {showViewModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Lesson Plan Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-gray-500">Plan ID</span>
                  <p className="text-sm text-gray-800 font-medium">{selectedPlan.planId}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500">Status</span>
                  <p className="mt-1">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(selectedPlan.status)}`}>
                      {selectedPlan.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Teacher Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Teacher Name</span>
                    <p className="text-sm text-gray-800 font-medium">{selectedPlan.teacherName}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Department</span>
                    <p className="text-sm text-gray-600">{selectedPlan.department}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Class Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Subject</span>
                    <p className="text-sm text-gray-600">{selectedPlan.subject}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Semester</span>
                    <p className="text-sm text-gray-600">{selectedPlan.semester} Semester</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Section</span>
                    <p className="text-sm text-gray-600">Section {selectedPlan.section}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Week & Month</span>
                    <p className="text-sm text-gray-600">Week {selectedPlan.week}, {selectedPlan.month}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Topic</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedPlan.topic}</p>
              </div>

              {selectedPlan.description && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">Description</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedPlan.description}</p>
                </div>
              )}

              {selectedPlan.submittedDate && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Submission Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Submitted Date</span>
                      <p className="text-sm text-gray-600">{selectedPlan.submittedDate ? new Date(selectedPlan.submittedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</p>
                    </div>
                    {selectedPlan.approvedDate && (
                      <div>
                        <span className="text-xs font-semibold text-gray-500">Approved Date</span>
                        <p className="text-sm text-gray-600">{new Date(selectedPlan.approvedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                    )}
                    {selectedPlan.approvedBy && (
                      <div>
                        <span className="text-xs font-semibold text-gray-500">Approved By</span>
                        <p className="text-sm text-gray-600">{selectedPlan.approvedBy}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedPlan.rejectionReason && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">Rejection Reason</h4>
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{selectedPlan.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              {selectedPlan.status !== 'Approved' && (
                <button
                  onClick={() => { setShowViewModal(false); handleApproveConfirm(); }}
                  disabled={actionLoading}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:bg-green-300 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Approve
                </button>
              )}
              {selectedPlan.status !== 'Rejected' && (
                <button
                  onClick={() => { setShowViewModal(false); setShowRejectModal(true); }}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                >
                  Reject
                </button>
              )}
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

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <XCircle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-gray-800">Reject Lesson Plan</h3>
                <p className="text-[13px] text-gray-500">Provide a reason for rejection.</p>
              </div>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 disabled:bg-red-300 transition-colors font-medium text-sm"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : 'Reject'}
              </button>
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
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

export default LessonPlans;