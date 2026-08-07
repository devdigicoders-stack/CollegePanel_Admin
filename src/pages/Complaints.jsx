import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Eye, Search, Filter, CheckCircle, XCircle, AlertTriangle, Clock, Trash2, X as XIcon, Send } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';
import { checkPermission } from '../utils/checkPermission';
import AccessDenied from '../components/AccessDenied';

const Complaints = () => {
  if (!checkPermission('View Students') && !checkPermission('View Employees')) {
    return <AccessDenied />;
  }
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [filters, setFilters] = useState({
    status: 'All',
    category: 'All',
    priority: 'All',
    search: ''
  });
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterAudience, setFilterAudience] = useState('All Audiences');
  const [adminReplyText, setAdminReplyText] = useState('');
  const searchTimeout = useRef(null);

  useEffect(() => {
    fetchComplaints();
  }, [pagination.page, filters]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status === 'All' ? '' : filters.status,
        category: filters.category === 'All' ? '' : filters.category,
        priority: filters.priority === 'All' ? '' : filters.priority,
        search: filters.search
      };
      const res = await axiosInstance.get('/complaints', { params });
      setComplaints(res.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.total || 0,
        pages: res.data.pages || 1
      }));
    } catch (error) {
      toast.error('Failed to fetch complaints');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setAdminReplyText('');
    setShowViewModal(true);
  };

  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      await axiosInstance.put(`/complaints/${complaintId}`, { status: newStatus });
      toast.success('Complaint status updated');
      setShowViewModal(false);
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteComplaint = async () => {
    if (!deleteTarget) return;
    try {
      await axiosInstance.delete(`/complaints/${deleteTarget._id}`);
      toast.success('Complaint deleted successfully');
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to delete complaint');
    }
  };

  const handleAdminReply = async () => {
    if (!selectedComplaint) return;
    try {
      await axiosInstance.put(`/complaints/${selectedComplaint._id}`, {
        status: 'Resolved',
        adminReply: adminReplyText || 'Your complaint has been reviewed and resolved.'
      });
      toast.success('Complaint resolved successfully');
      setShowViewModal(false);
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to update complaint');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'text-orange-600 bg-orange-50 border border-orange-100';
      case 'In Progress': return 'text-blue-600 bg-blue-50 border border-blue-100';
      case 'Resolved': return 'text-green-700 bg-green-50 border border-green-100';
      case 'Rejected': return 'text-red-600 bg-red-50 border border-red-100';
      default: return 'text-gray-600 bg-gray-100 border border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Urgent': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Hostel': return '🏠';
      case 'Maintenance': return '🔧';
      case 'Academics': return '📚';
      case 'Library': return '📖';
      case 'IT': return '💻';
      case 'Transport': return '🚌';
      case 'Food': return '🍽️';
      default: return '📋';
    }
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
    <div className="flex flex-col h-full font-['Inter']">
      
      {/* Title Area */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-[20px] font-bold text-[#022A36] font-['Outfit']">
            {selectedComplaint ? 'Complaint Details' : 'Complaints'}
          </h2>
          <p className="text-[13px] text-gray-500 mt-1">
            {selectedComplaint ? 'Complaints > View Details' : 'Complaints > All Complaints'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col flex-1 overflow-hidden">
        
        {!selectedComplaint ? (
          <>
            {/* Top Bar Filter */}
            <div className="p-4 sm:p-6 border-b border-gray-50 flex items-center justify-between gap-4 flex-wrap">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search complaints by subject, ID, or description..." 
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-700 py-2 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] shadow-sm"
                />
              </div>
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                <select 
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-[12px] sm:text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <select 
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-[12px] sm:text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                >
                  <option value="All">All Categories</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Academics">Academics</option>
                  <option value="Library">Library</option>
                  <option value="IT">IT</option>
                  <option value="Transport">Transport</option>
                  <option value="Food">Food</option>
                  <option value="Other">Other</option>
                </select>
                <select 
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full sm:w-auto bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-[12px] sm:text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] col-span-2 sm:col-span-1"
                >
                  <option value="All">All Priority</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-x-auto p-6 pt-2">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[#F9FAFB] border-y border-gray-100">
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%] rounded-tl-xl">ID</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[25%]">Subject</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[12%]">Category</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[12%]">Submitted By</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%]">Priority</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[12%]">Status</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%] text-center rounded-tr-xl">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="7" className="py-8"><SkeletonLoader type="table" rows={3} cols="7" /></td></tr>
                  ) : complaints.length > 0 ? complaints.map((comp) => (
                    <tr key={comp._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 text-[13px] font-bold text-[#0A6C54]">{comp.complaintId || comp._id}</td>
                      <td className="py-4 px-6 text-[13px] font-medium text-[#022A36]">{comp.subject}</td>
                      <td className="py-4 px-6 text-[13px] font-medium text-gray-600">{getCategoryIcon(comp.category)} {comp.category}</td>
                      <td className="py-4 px-6 text-[13px] font-medium text-gray-600">{comp.submittedBy}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded text-[11px] font-bold ${getPriorityColor(comp.priority)}`}>
                          {comp.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide ${getStatusColor(comp.status)}`}>
                          {comp.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => handleViewComplaint(comp)}
                          className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-[#0A6C54] rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500">No complaints found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-gray-100 bg-gray-50/30 mt-auto">
              <div className="text-[13px] text-gray-500 font-medium">
                Showing {startIndex + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
              </div>
              <div className="flex items-center gap-1.5 mt-4 sm:mt-0">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setPagination(prev => ({ ...prev, page: page }))}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium ${
                        pagination.page === page
                          ? 'bg-[#0A6C54] text-white'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
            
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
                <div>
                  <h3 className="text-[18px] font-bold text-[#022A36]">{selectedComplaint.subject}</h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                    <span className="text-[12px] sm:text-[13px] text-gray-500 font-medium">Ticket: <span className="text-[#0A6C54] font-bold">{selectedComplaint.complaintId || selectedComplaint._id}</span></span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="text-[12px] sm:text-[13px] text-gray-500 font-medium">Date: {new Date(selectedComplaint.createdAt).toLocaleDateString('en-IN')}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${getStatusColor(selectedComplaint.status)}`}>
                      {selectedComplaint.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-y-6">
                  <div>
                    <div className="text-[12px] font-semibold text-gray-400 mb-1">Submitted By</div>
                    <div className="text-[14px] font-medium text-[#022A36]">{selectedComplaint.submittedBy}</div>
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-gray-400 mb-1">Category</div>
                    <div className="text-[14px] font-medium text-[#022A36]">{selectedComplaint.category}</div>
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-gray-400 mb-1">Priority</div>
                    <div className="text-[14px] font-medium text-[#022A36]">
                      <span className={`px-2 py-1 rounded text-[11px] font-bold ${getPriorityColor(selectedComplaint.priority)}`}>
                        {selectedComplaint.priority}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-gray-400 mb-1">Status</div>
                    <div className="text-[14px] font-medium text-[#022A36]">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${getStatusColor(selectedComplaint.status)}`}>
                        {selectedComplaint.status}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[12px] font-semibold text-gray-400 mb-1">Description</div>
                    <div className="text-[14px] font-medium text-gray-700 leading-relaxed bg-white p-4 border border-gray-100 rounded-lg mt-2">
                      {selectedComplaint.description}
                    </div>
                  </div>
                  {selectedComplaint.adminReply && (
                    <div className="col-span-2">
                      <div className="text-[12px] font-semibold text-gray-400 mb-1">Admin Reply</div>
                      <div className="text-[14px] font-medium text-gray-700 leading-relaxed bg-green-50 p-4 border border-green-100 rounded-lg mt-2">
                        {selectedComplaint.adminReply}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {checkPermission('Manage Complaints') && selectedComplaint.status !== 'Resolved' && selectedComplaint.status !== 'Rejected' && (
                <div className="mb-6">
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                    Update Status
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={() => handleUpdateStatus(selectedComplaint._id, 'In Progress')}
                      className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Clock size={14} /> Mark In Progress
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedComplaint._id, 'Resolved')}
                      className="flex-1 bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 transition-colors font-medium text-sm flex items-center justify-center gap-2 shadow-sm"
                    >
                      <CheckCircle size={14} /> Mark Resolved
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedComplaint._id, 'Rejected')}
                      className="flex-1 bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm flex items-center justify-center gap-2 shadow-sm"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              )}

              {checkPermission('Manage Complaints') && (
                <div className="mb-8">
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                    Admin Reply / Resolution Notes
                  </label>
                  <textarea 
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    placeholder="Write your response here..." 
                    className="w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] shadow-sm min-h-[120px] resize-none"
                  ></textarea>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button 
                  onClick={() => setSelectedComplaint(null)}
                  className="w-full sm:w-auto px-6 py-2.5 text-[13px] font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 whitespace-nowrap text-center"
                >
                  Back to List
                </button>
                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                  {checkPermission('Manage Complaints') && (
                    <>
                      <button 
                        onClick={() => { setDeleteTarget(selectedComplaint); setShowDeleteModal(true); }}
                        className="w-full sm:w-auto px-6 py-2.5 text-[13px] font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 whitespace-nowrap text-center"
                      >
                        Delete Complaint
                      </button>
                      <button 
                        onClick={handleAdminReply}
                        className="w-full sm:w-auto px-6 sm:px-8 py-2.5 text-[13px] font-semibold text-white bg-[#0A6C54] hover:bg-[#085a46] rounded-lg transition-colors shadow-sm flex justify-center items-center gap-2 whitespace-nowrap"
                      >
                        <Send size={14} /> Submit Update
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-red-50">
              <AlertTriangle size={24} className="text-red-600" />
              <h3 className="text-lg font-bold text-gray-800">Delete Complaint</h3>
            </div>
            <div className="px-6 py-6">
              <p className="text-gray-600 text-sm">
                Are you sure you want to delete complaint <span className="font-bold text-[#022A36]">{deleteTarget?.complaintId || deleteTarget?._id}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteComplaint}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;