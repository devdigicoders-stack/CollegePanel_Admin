import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronDown, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, Plus, X, AlertTriangle
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const Admissions = () => {
  const [activeTab, setActiveTab] = useState('Enquiry');
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    appNo: '',
    name: '',
    course: '',
    mobile: '',
    stage: 'Enquiry',
    status: 'New'
  });

  const tabs = [
    { name: 'Enquiry' },
    { name: 'Application' },
    { name: 'Document Verification' },
    { name: 'Admitted' },
    { name: 'Cancelled' },
  ];

  useEffect(() => {
    fetchAdmissions();
  }, [activeTab, pagination.page, courseFilter, statusFilter, dateFilter, searchQuery]);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        stage: activeTab,
        ...(courseFilter !== 'All Courses' && { course: courseFilter }),
        ...(statusFilter !== 'All Status' && { status: statusFilter }),
        ...(dateFilter && { startDate: dateFilter }),
        ...(searchQuery && { search: searchQuery })
      });

      const res = await axiosInstance.get(`/admissions?${params}`);
      setAdmissions(res.data.admissions);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch admissions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-cyan-100 text-cyan-800';
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageColor = (stage) => {
    switch(stage) {
      case 'Enquiry': return 'bg-indigo-100 text-indigo-800';
      case 'Application': return 'bg-purple-100 text-purple-800';
      case 'Document Verification': return 'bg-orange-100 text-orange-800';
      case 'Admitted': return 'bg-emerald-100 text-emerald-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // View admission
  const handleView = (admission) => {
    setSelectedAdmission(admission);
    setShowViewModal(true);
  };

  // Add admission
  const handleAddClick = () => {
    setFormData({
      appNo: '',
      name: '',
      course: '',
      mobile: '',
      stage: 'Enquiry',
      status: 'New'
    });
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/admissions', formData);
      toast.success('Admission added successfully');
      setShowAddModal(false);
      setFormData({
        appNo: '',
        name: '',
        course: '',
        mobile: '',
        stage: 'Enquiry',
        status: 'New'
      });
      fetchAdmissions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add admission');
    }
  };

  // Edit admission
  const handleEdit = (admission) => {
    setSelectedAdmission(admission);
    setFormData({
      appNo: admission.appNo,
      name: admission.name,
      course: admission.course,
      mobile: admission.mobile,
      stage: admission.stage,
      status: admission.status
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/admissions/${selectedAdmission._id}`, formData);
      toast.success('Admission updated successfully');
      setShowEditModal(false);
      fetchAdmissions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update admission');
    }
  };

  // Delete admission
  const handleDelete = (admission) => {
    setSelectedAdmission(admission);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/admissions/${selectedAdmission._id}`);
      toast.success('Admission deleted successfully');
      setShowDeleteModal(false);
      fetchAdmissions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete admission');
    }
  };

  // Get unique courses
  const uniqueCourses = [...new Set(admissions.map(a => a.course))]
    .filter(Boolean)
    .sort();

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Header with Add Button */}
      <div className="flex justify-between items-center px-6 pt-4 pb-2">
        <h2 className="text-lg font-bold text-gray-800">Admissions</h2>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-[#0A6C54] text-white px-4 py-2 rounded-lg hover:bg-[#085a46] transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Add Admission
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-6 pt-2 border-b border-gray-100 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => {
              setActiveTab(tab.name);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className={`whitespace-nowrap px-4 py-4 text-[14px] font-semibold transition-all relative ${
              activeTab === tab.name 
                ? 'text-[#0A6C54]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.name}
            {activeTab === tab.name && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="p-5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
        <div className="flex gap-3 w-full sm:w-auto flex-wrap">
          <div className="relative">
            <select 
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
            >
              <option value="All Courses">All Courses</option>
              {uniqueCourses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
            >
              <option value="All Status">All Status</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
          
          <div>
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="bg-[#F9FAFB] border border-gray-200 text-gray-500 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" 
            />
          </div>
        </div>

        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            placeholder="Search by name or mobile" 
            className="w-full sm:w-[260px] bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto relative">
        {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10"><div className="w-8 h-8 border-4 border-[#0A6C54] border-t-transparent rounded-full animate-spin"></div></div>}
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-[#F9FAFB] border-y border-gray-100">
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[5%]">#</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[12%]">App No.</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Name</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[12%]">Course</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[12%]">Mobile</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-auto">Stage</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-auto">Status</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[12%]">Action</th>
            </tr>
          </thead>
          <tbody>
            {admissions.length > 0 ? admissions.map((row, index) => (
              <tr key={row._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-600">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{row.appNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-medium">{row.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.course}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.mobile}</td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <span className={`px-2.5 py-1.5 rounded-lg text-[12px] font-semibold ${getStageColor(row.stage)}`}>
                    {row.stage}
                  </span>
                </td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <span className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${getStatusColor(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleView(row)}
                      className="w-8 h-8 rounded-full border border-green-100 flex items-center justify-center text-[#0A6C54] hover:bg-green-50 transition-colors"
                      title="View"
                    >
                      <Eye size={14} strokeWidth={2} />
                    </button>
                    <button 
                      onClick={() => handleEdit(row)}
                      className="w-8 h-8 rounded-full border border-green-100 flex items-center justify-center text-[#0A6C54] hover:bg-green-50 transition-colors"
                      title="Edit"
                    >
                      <Edit size={14} strokeWidth={2} />
                    </button>
                    <button 
                      onClick={() => handleDelete(row)}
                      className="w-8 h-8 rounded-full border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" className="py-8 text-center text-[13px] text-gray-500">
                  {loading ? 'Loading admissions...' : 'No records found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-gray-100 gap-4">
        <div className="text-[13px] text-gray-500 font-medium">
          Showing {admissions.length} of {pagination.total} entries | Page {pagination.page} of {pagination.pages}
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          {[...Array(pagination.pages)].map((_, i) => {
            const pageNum = i + 1;
            if (pageNum === 1 || pageNum === pagination.pages || (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)) {
              return (
                <button
                  key={pageNum}
                  onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${
                    pagination.page === pageNum
                      ? 'bg-[#0A6C54] text-white'
                      : 'border border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            }
            if (pageNum === 2 && pagination.page > 3) return <span key="dots1" className="text-gray-400">...</span>;
            if (pageNum === pagination.pages - 1 && pagination.page < pagination.pages - 2) return <span key="dots2" className="text-gray-400">...</span>;
            return null;
          })}
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
            disabled={pagination.page === pagination.pages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* VIEW MODAL */}
      {showViewModal && selectedAdmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Admission Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <DetailRow label="App No." value={selectedAdmission.appNo} />
              <DetailRow label="Name" value={selectedAdmission.name} />
              <DetailRow label="Course" value={selectedAdmission.course} />
              <DetailRow label="Mobile" value={selectedAdmission.mobile} />
              <DetailRow label="Stage" value={<span className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${getStageColor(selectedAdmission.stage)}`}>{selectedAdmission.stage}</span>} />
              <DetailRow label="Status" value={<span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(selectedAdmission.status)}`}>{selectedAdmission.status}</span>} />
              <DetailRow label="Created" value={new Date(selectedAdmission.createdAt).toLocaleDateString()} />
              <DetailRow label="Updated" value={new Date(selectedAdmission.updatedAt).toLocaleDateString()} />
            </div>

            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(selectedAdmission);
                }}
                className="flex-1 bg-[#0A6C54] text-white py-2 rounded-lg hover:bg-[#085a46] transition-colors font-medium text-sm"
              >
                Edit
              </button>
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

      {/* ADD MODAL */}
      {showAddModal && (
        <FormModal
          title="Add New Admission"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAddSubmit}
          onClose={() => setShowAddModal(false)}
          isEditing={false}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <FormModal
          title="Edit Admission"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEditSubmit}
          onClose={() => setShowEditModal(false)}
          isEditing={true}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedAdmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={24} className="text-red-500" />
              <h3 className="text-lg font-bold text-gray-800">Delete Admission</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedAdmission.name}</strong>'s admission record? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
              >
                Delete
              </button>
              <button 
                onClick={() => setShowDeleteModal(false)}
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

// Helper Components
const DetailRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm font-medium text-gray-600">{label}:</span>
    <span className="text-sm text-gray-800 font-medium">{value}</span>
  </div>
);

const FormModal = ({ title, formData, setFormData, onSubmit, onClose, isEditing }) => {
  const courses = [
    'B.Tech - CSE',
    'B.Tech - ECE',
    'B.Tech - Mechanical',
    'B.Tech - Civil',
    'Diploma - CSE',
    'Diploma - Mechanical'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <FormInput
            label="Application No."
            value={formData.appNo}
            onChange={(e) => setFormData({ ...formData, appNo: e.target.value })}
            required
            disabled={isEditing}
          />

          <FormInput
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <FormSelect
            label="Course"
            value={formData.course}
            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            options={courses}
            required
          />

          <FormInput
            label="Mobile"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            required
          />

          <FormSelect
            label="Stage"
            value={formData.stage}
            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
            options={['Enquiry', 'Application', 'Document Verification', 'Admitted', 'Cancelled']}
          />

          <FormSelect
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={['New', 'In Progress', 'Pending', 'Confirmed']}
          />

          <div className="flex gap-3 mt-6">
            <button 
              type="submit"
              className="flex-1 bg-[#0A6C54] text-white py-2 rounded-lg hover:bg-[#085a46] transition-colors font-medium text-sm"
            >
              {isEditing ? 'Update' : 'Add'}
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormInput = ({ label, value, onChange, required, disabled }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A6C54] disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
    />
  </div>
);

const FormSelect = ({ label, value, onChange, options, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A6C54] text-sm appearance-none bg-white"
    >
      <option value="">Select {label}</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default Admissions;
