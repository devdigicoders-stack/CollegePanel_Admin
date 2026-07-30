import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search, Edit, Trash2, X, AlertTriangle, Eye, User, ChevronDown } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';

const Hods = () => {
  const [hods, setHods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHod, setSelectedHod] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [filterDepartment, setFilterDepartment] = useState('All Departments');
  const searchTimeout = useRef(null);

  useEffect(() => {
    fetchDepartments();
    fetchHods();
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchHods();
    }, 400);
  }, [searchQuery]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchHods();
  }, [filterDepartment]);

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get('/academics/departments');
      const depts = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setDepartments(depts);
    } catch (error) {
      console.error('Failed to fetch departments', error);
    }
  };

  const fetchHods = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        department: filterDepartment === 'All Departments' ? '' : filterDepartment,
        search: searchQuery
      };
      const res = await axiosInstance.get('/teachers/hods', { params });
      const hodsData = res.data.data || [];
      setHods(hodsData);
      setPagination(prev => ({
        ...prev,
        total: res.data.total || 0,
        pages: res.data.pages || 1
      }));
    } catch (error) {
      toast.error('Failed to fetch HODs');
      console.error('Error fetching HODs:', error);
      setHods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleFilterChange = (value) => {
    setFilterDepartment(value);
  };

  const handleViewClick = (hod) => {
    setSelectedHod(hod);
    setShowViewModal(true);
  };

  const handleDeleteClick = (hod) => {
    setSelectedHod(hod);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/teachers/${selectedHod._id}`);
      toast.success('HOD deleted successfully');
      setShowDeleteModal(false);
      setSelectedHod(null);
      fetchHods();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete HOD');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'text-[#15803d] bg-[#dcfce3]';
      case 'Inactive': return 'text-[#dc2626] bg-[#fee2e2]';
      case 'On Leave': return 'text-[#d97706] bg-[#fef3c7]';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const totalPages = pagination.pages;
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = Math.min(startIndex + pagination.limit, pagination.total);

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

      {/* Filters Top Row */}
      <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-gray-50">
        <div className="flex gap-3 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:flex-none">
            <select
              value={filterDepartment}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
            >
              <option>All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{pagination.total}</span> HOD{pagination.total !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Search Row */}
      <div className="px-5 py-4 flex justify-between items-center bg-white border-b border-gray-50">
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search HOD by name or department..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-700 py-2 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] placeholder:text-gray-400 shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={8} />
        ) : hods.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 text-sm">
              {searchQuery ? 'No HODs found matching your search' : 'No HODs found'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">#</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">HOD Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Department</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Email</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Mobile</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Date of Joining</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {hods.map((hod, index) => (
                <tr key={hod._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{startIndex + index + 1}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-medium whitespace-nowrap">{hod.name}</td>
                  <td className="py-4 px-6 text-[13px] text-[#0A6C54] font-medium whitespace-nowrap">{hod.department}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 whitespace-nowrap">{hod.email}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 whitespace-nowrap">{hod.mobile}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 whitespace-nowrap">{formatDate(hod.dateOfJoining)}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide inline-block ${getStatusColor(hod.status)}`}>
                      {hod.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                      <button
                        onClick={() => handleViewClick(hod)}
                        className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm flex-shrink-0"
                        title="View HOD"
                      >
                        <Eye size={14} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(hod)}
                        className="w-8 h-8 rounded border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm bg-red-50/50 flex-shrink-0"
                        title="Delete HOD"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination.total > pagination.limit && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-[13px] text-gray-600 font-medium">
            Showing {startIndex + 1} to {endIndex} of {pagination.total} entries
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className={`px-3 py-1.5 text-[13px] font-medium rounded border transition-colors ${
                pagination.page === 1
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>

            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, page: page }))}
                  className={`min-w-[32px] px-3 py-1.5 text-[13px] font-medium rounded border transition-colors ${
                    pagination.page === page
                      ? 'bg-[#0A6C54] text-white border-[#0A6C54]'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )
            ))}

            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
              disabled={pagination.page === totalPages}
              className={`px-3 py-1.5 text-[13px] font-medium rounded border transition-colors ${
                pagination.page === totalPages
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedHod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#0A6C54] to-[#0d8566]">
              <h3 className="text-lg font-bold text-white">HOD Details</h3>
              <button
                onClick={() => { setShowViewModal(false); setSelectedHod(null); }}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="bg-gradient-to-br from-[#0A6C54]/5 to-[#0A6C54]/10 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-[#0A6C54] flex items-center justify-center text-white text-2xl font-bold">
                    {selectedHod.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">{selectedHod.name}</h4>
                    <p className="text-sm text-[#0A6C54] font-medium">{selectedHod.designation} - {selectedHod.department}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wide mt-2 ${getStatusColor(selectedHod.status)}`}>
                      {selectedHod.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Employee ID:</span>
                    <span className="ml-2 font-semibold text-[#0A6C54]">{selectedHod.empId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Department:</span>
                    <span className="ml-2 font-semibold text-gray-800">{selectedHod.department}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-2">Personal Information</h5>
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Email</span>
                    <p className="text-sm text-gray-800 font-medium">{selectedHod.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Mobile</span>
                    <p className="text-sm text-gray-800 font-medium">{selectedHod.mobile || 'N/A'}</p>
                  </div>
                  {selectedHod.dateOfBirth && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Date of Birth</span>
                      <p className="text-sm text-gray-800 font-medium">{formatDate(selectedHod.dateOfBirth)}</p>
                    </div>
                  )}
                  {selectedHod.gender && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Gender</span>
                      <p className="text-sm text-gray-800 font-medium">{selectedHod.gender}</p>
                    </div>
                  )}
                  {selectedHod.qualification && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Qualification</span>
                      <p className="text-sm text-gray-800 font-medium">{selectedHod.qualification}</p>
                    </div>
                  )}
                  {selectedHod.experience && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Experience</span>
                      <p className="text-sm text-gray-800 font-medium">{selectedHod.experience} years</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-2">Employment Information</h5>
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Department</span>
                    <p className="text-sm text-gray-800 font-medium">{selectedHod.department || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Designation</span>
                    <p className="text-sm text-gray-800 font-medium">{selectedHod.designation || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Date of Joining</span>
                    <p className="text-sm text-gray-800 font-medium">{formatDate(selectedHod.dateOfJoining)}</p>
                  </div>
                  {selectedHod.payScale && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Pay Scale</span>
                      <p className="text-sm text-gray-800 font-medium">{selectedHod.payScale}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Status</span>
                    <p className="text-sm text-gray-800 font-medium">{selectedHod.status || 'N/A'}</p>
                  </div>
                  {selectedHod.createdAt && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Created Date</span>
                      <p className="text-sm text-gray-800 font-medium">{formatDate(selectedHod.createdAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
              <button
                onClick={() => { setShowViewModal(false); setSelectedHod(null); }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedHod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-red-50">
              <AlertTriangle size={24} className="text-red-600" />
              <h3 className="text-lg font-bold text-gray-800">Delete HOD</h3>
            </div>

            <div className="px-6 py-6">
              <p className="text-gray-600 text-sm">Are you sure you want to delete {selectedHod.name}? This will remove them from the HOD role but they will still exist as a teacher.</p>
            </div>

            <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
              >
                Delete
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedHod(null); }}
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

export default Hods;