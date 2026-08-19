import React, { useState, useEffect, useCallback, useRef } from 'react';
import Swal from 'sweetalert2';
import { 
  Plus, Search, ChevronDown, Eye, Edit2, Trash2, X as XIcon,
  ChevronLeft, ChevronRight, Calendar, BookOpen, Users, Save, X, Paperclip, Send
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';
import { checkPermission } from '../utils/checkPermission';
import AccessDenied from '../components/AccessDenied';

const Notice = () => {
  if (!checkPermission('View Students') && !checkPermission('View Employees')) {
    return <AccessDenied />;
  }
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    noticeId: '',
    title: '',
    targetAudience: 'All Students',
    postedBy: '',
    postedByRole: 'Admin',
    department: '',
    dateOfPublishing: '',
    details: '',
    status: 'Draft',
    attachments: []
  });
  const [formLoading, setFormLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filterAudience, setFilterAudience] = useState('All Audiences');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeout = useRef(null);

  useEffect(() => {
    fetchNotices();
  }, [pagination.page, filterAudience, filterStatus]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [depRes, courRes, roleRes] = await Promise.all([
          axiosInstance.get('/academics/departments'),
          axiosInstance.get('/academics/courses'),
          axiosInstance.get('/roles/list/all')
        ]);
        setDepartments(depRes.data.data || depRes.data || []);
        setCourses(courRes.data.data || courRes.data || []);
        setRoles(roleRes.data.data || ['Admin', 'Principal', 'HOD', 'Teacher', 'Staff']);
      } catch (err) {
        console.error('Failed to fetch options', err);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchNotices();
    }, 400);
  }, [searchQuery]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: filterStatus === 'All Status' ? '' : filterStatus,
        targetAudience: filterAudience === 'All Audiences' ? '' : filterAudience,
        search: searchQuery
      };
      const res = await axiosInstance.get('/notices', { params });
      setNotices(res.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.total || 0,
        pages: res.data.pages || 1
      }));
    } catch (error) {
      toast.error('Failed to load notices');
      console.error('Failed to fetch notices', error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const resetForm = () => {
    setFormData({
      noticeId: '',
      title: '',
      targetAudience: 'All Students',
      postedBy: '',
      postedByRole: 'Admin',
      department: '',
      dateOfPublishing: '',
      details: '',
      status: 'Draft',
      attachments: []
    });
    setIsEditing(false);
    setSelectedNotice(null);
  };

  const handleCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleEdit = (notice) => {
    setFormData({
      noticeId: notice.noticeId || '',
      title: notice.title || '',
      targetAudience: notice.targetAudience || 'All Students',
      postedBy: notice.postedBy || '',
      postedByRole: notice.postedByRole || 'Admin',
      department: notice.department || '',
      dateOfPublishing: notice.dateOfPublishing ? notice.dateOfPublishing.split('T')[0] : '',
      details: notice.details || '',
      status: notice.status || 'Draft',
      attachments: notice.attachments || []
    });
    setIsEditing(true);
    setSelectedNotice(notice);
    setShowEditModal(true);
  };

  const handleView = (notice) => {
    setSelectedNotice(notice);
    setShowViewModal(true);
  };

  const handleDelete = async (notice) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete notice "${notice.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, proceed!'
    });
    if (!result.isConfirmed) return;
    try {
      await axiosInstance.delete(`/notices/${notice._id}`);
      toast.success('Notice deleted successfully');
      fetchNotices();
    } catch (error) {
      toast.error('Failed to delete notice');
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.details || !formData.dateOfPublishing) {
      toast.error('Please fill all required fields');
      return;
    }
    setFormLoading(true);
    try {
      const payload = new FormData();
      payload.append('noticeId', formData.noticeId || `NOT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);
      payload.append('title', formData.title);
      payload.append('targetAudience', formData.targetAudience);
      payload.append('postedBy', formData.postedBy);
      payload.append('postedByRole', formData.postedByRole);
      if (formData.department) payload.append('department', formData.department);
      payload.append('dateOfPublishing', new Date(formData.dateOfPublishing).toISOString());
      payload.append('details', formData.details);
      payload.append('status', formData.status);

      if (formData.attachments && formData.attachments.length > 0) {
        formData.attachments.forEach(file => {
          if (file instanceof File) {
            payload.append('attachments', file);
          }
        });
      }

      if (isEditing) {
        await axiosInstance.put(`/notices/${selectedNotice._id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Notice updated successfully');
        setShowEditModal(false);
      } else {
        await axiosInstance.post('/notices', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Notice created successfully');
        setShowCreateModal(false);
      }
      resetForm();
      fetchNotices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save notice');
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const totalPages = pagination.pages;
  const startIndex = (pagination.page - 1) * pagination.limit;

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (pagination.page <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (pagination.page >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', pagination.page - 1, pagination.page, pagination.page + 1, '...', totalPages];
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">

      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-4 pb-2">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Notice Board</h2>
          <p className="text-[13px] text-gray-500 mt-1">Manage and track notices</p>
        </div>
        {checkPermission('Add Notice') && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-[#0A6C54] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#085a46] transition-colors"
          >
            <Plus size={16} />
            Create Notice
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="p-5 flex flex-wrap gap-3 bg-white border-b border-gray-100">
        <div className="relative">
          <select
            value={filterAudience}
            onChange={(e) => { setFilterAudience(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
            className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer"
          >
            <option value="All Audiences">All Audiences</option>
            <option value="All Students">All Students</option>
            <option value="All Staff">All Staff</option>
            <option value="All Parents">All Parents</option>
            <option value="Specific Department">Specific Department</option>
            <option value="Specific Course">Specific Course</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
            className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer"
          >
            <option value="All Status">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by title or posted by"
            className="w-[260px] bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-[#F9FAFB] border-y border-gray-100">
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[35%] rounded-tl-xl">Title</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Target Audience</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[20%]">Posted By</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Posted On</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%] rounded-tr-xl">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="py-8"><SkeletonLoader type="table" rows={3} cols={5} /></td></tr>
            ) : notices.length > 0 ? notices.map((notice) => (
              <tr key={notice._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-medium text-[#022A36]">{notice.title}</td>
                <td className="py-4 px-6 text-[13px] font-medium text-gray-600">{notice.targetAudience}</td>
                <td className="py-4 px-6 text-[13px] font-medium text-gray-600">{notice.postedBy}</td>
                <td className="py-4 px-6 text-[13px] font-medium text-gray-600">{formatDate(notice.dateOfPublishing)}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${
                    notice.status === 'Published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {notice.status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">
                  {loading ? <SkeletonLoader type="table" rows={3} cols={5} /> : 'No notices found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-gray-100 gap-4">
        <div className="text-[13px] text-gray-500 font-medium">
          Showing {notices.length} of {pagination.total} entries | Page {pagination.page} of {pagination.pages}
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

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Create New Notice</h3>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Notice Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter notice title"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Target Audience *</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value, department: '' })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="All Students">All Students</option>
                    <option value="All Staff">All Staff</option>
                    <option value="All Parents">All Parents</option>
                    <option value="Specific Department">Specific Department</option>
                    <option value="Specific Course">Specific Course</option>
                  </select>
                </div>
                
                {formData.targetAudience === 'Specific Department' ? (
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Select Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                    >
                      <option value="">-- Select Department --</option>
                      {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                ) : formData.targetAudience === 'Specific Course' ? (
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Select Course *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                    >
                      <option value="">-- Select Course --</option>
                      {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Posted By *</label>
                    <input
                      type="text"
                      value={formData.postedBy}
                      onChange={(e) => setFormData({ ...formData, postedBy: e.target.value })}
                      placeholder="e.g., Admin, Principal"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                    />
                  </div>
                )}
              </div>

              {(formData.targetAudience === 'Specific Department' || formData.targetAudience === 'Specific Course') && (
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Posted By *</label>
                  <input
                    type="text"
                    value={formData.postedBy}
                    onChange={(e) => setFormData({ ...formData, postedBy: e.target.value })}
                    placeholder="e.g., Admin, Principal"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Posted By Role</label>
                  <select
                    value={formData.postedByRole}
                    onChange={(e) => setFormData({ ...formData, postedByRole: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="">-- Select Role --</option>
                    {roles.map((r, i) => <option key={i} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Date of Publishing *</label>
                  <input
                    type="date"
                    value={formData.dateOfPublishing}
                    onChange={(e) => setFormData({ ...formData, dateOfPublishing: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Notice Details *</label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="Enter notice details and message..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] resize-none"
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Attachments</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-[13px] font-medium text-gray-600">
                    <Paperclip size={16} />
                    Upload Files
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        setFormData(prev => ({
                          ...prev,
                          attachments: [...prev.attachments, ...files]
                        }));
                      }}
                    />
                  </label>
                  {formData.attachments.length > 0 && (
                    <span className="text-[12px] text-gray-500">{formData.attachments.length} file(s) selected</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={formLoading}
                className="flex-1 bg-[#0A6C54] text-white py-2.5 rounded-lg hover:bg-[#085a46] transition-colors font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send size={14} />
                {formLoading ? 'Saving...' : 'Publish Notice'}
              </button>
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedNotice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Edit Notice</h3>
              <button onClick={() => { setShowEditModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Notice Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Target Audience *</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value, department: '' })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="All Students">All Students</option>
                    <option value="All Staff">All Staff</option>
                    <option value="All Parents">All Parents</option>
                    <option value="Specific Department">Specific Department</option>
                    <option value="Specific Course">Specific Course</option>
                  </select>
                </div>
                
                {formData.targetAudience === 'Specific Department' ? (
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Select Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                    >
                      <option value="">-- Select Department --</option>
                      {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                ) : formData.targetAudience === 'Specific Course' ? (
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Select Course *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                    >
                      <option value="">-- Select Course --</option>
                      {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Posted By *</label>
                    <input
                      type="text"
                      value={formData.postedBy}
                      onChange={(e) => setFormData({ ...formData, postedBy: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                    />
                  </div>
                )}
              </div>

              {(formData.targetAudience === 'Specific Department' || formData.targetAudience === 'Specific Course') && (
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Posted By *</label>
                  <input
                    type="text"
                    value={formData.postedBy}
                    onChange={(e) => setFormData({ ...formData, postedBy: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Date of Publishing *</label>
                  <input
                    type="date"
                    value={formData.dateOfPublishing}
                    onChange={(e) => setFormData({ ...formData, dateOfPublishing: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Notice Details *</label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] resize-none"
                />
              </div>
              
              {/* Attachments */}
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Attachments (Upload new files to replace old ones)</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-[13px] font-medium text-gray-600">
                    <Paperclip size={16} />
                    Upload Files
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        setFormData(prev => ({
                          ...prev,
                          attachments: files // replacing since we do simple replace on backend
                        }));
                      }}
                    />
                  </label>
                  {formData.attachments && formData.attachments.length > 0 && (
                    <span className="text-[12px] text-gray-500">{formData.attachments.length} file(s) selected</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={formLoading}
                className="flex-1 bg-[#0A6C54] text-white py-2.5 rounded-lg hover:bg-[#085a46] transition-colors font-medium text-sm disabled:opacity-50"
              >
                {formLoading ? 'Updating...' : 'Update Notice'}
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
      {showViewModal && selectedNotice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Notice Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Title" value={selectedNotice.title} />
                <DetailRow label="Status" value={<span className={`px-3 py-1.5 rounded-full text-xs font-bold ${selectedNotice.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{selectedNotice.status}</span>} />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Notice Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Target Audience" value={selectedNotice.targetAudience} />
                  <DetailRow label="Posted By" value={selectedNotice.postedBy} />
                  <DetailRow label="Role" value={selectedNotice.postedByRole} />
                  <DetailRow label="Department" value={selectedNotice.department || 'N/A'} />
                  <DetailRow label="Posted On" value={formatDate(selectedNotice.dateOfPublishing)} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Details</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{selectedNotice.details}</p>
              </div>

              {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Paperclip size={16} /> Attachments</h4>
                  <div className="flex flex-col gap-2">
                    {selectedNotice.attachments.map((att, i) => (
                      <a 
                        key={i} 
                        href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${att}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[13px] text-blue-600 hover:underline flex items-center gap-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100 w-fit"
                      >
                        <BookOpen size={14} /> File {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
        {checkPermission('Edit Notice') && selectedNotice.status === 'Draft' && (
          <button
            onClick={() => {
              setShowViewModal(false);
              handleEdit(selectedNotice);
            }}
            className="flex-1 bg-[#0A6C54] text-white py-2 rounded-lg hover:bg-[#085a46] transition-colors font-medium text-sm"
          >
            Edit Notice
          </button>
        )}
        {checkPermission('Delete Notice') && (
          <button
            onClick={async () => {
              const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this notice?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, proceed!'
    });
    if (result.isConfirmed) {
                axiosInstance.delete(`/notices/${selectedNotice._id}`)
                  .then(() => { toast.success('Notice deleted'); setShowViewModal(false); fetchNotices(); })
                  .catch(() => toast.error('Failed to delete'));
              }
            }}
            className="flex-1 border border-red-200 text-red-600 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
          >
            Delete Notice
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
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs font-semibold text-gray-500 mb-1">{label}</span>
    <span className="text-sm text-gray-800 font-medium">{value}</span>
  </div>
);

export default Notice;