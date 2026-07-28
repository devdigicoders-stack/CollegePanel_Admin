import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, AlertTriangle, Eye, User } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const Hods = () => {
  const [hods, setHods] = useState([]);
  const [filteredHods, setFilteredHods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHod, setSelectedHod] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchHods();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, hods]);

  const fetchHods = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/teachers/hods');
      const hodsData = res.data.data || [];
      setHods(hodsData);
      setFilteredHods(hodsData);
    } catch (error) {
      console.error('Error fetching HODs:', error);
      toast.error('Failed to fetch HODs');
      setHods([]);
      setFilteredHods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredHods(hods);
      setCurrentPage(1);
      return;
    }

    const filtered = hods.filter(hod =>
      hod.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hod.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hod.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hod.mobile?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredHods(filtered);
    setCurrentPage(1);
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'text-[#15803d] bg-[#dcfce3]';
      case 'Inactive': return 'text-[#dc2626] bg-[#fee2e2]';
      case 'On Leave': return 'text-[#d97706] bg-[#fef3c7]';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  // Pagination
  const totalPages = Math.ceil(filteredHods.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHods = filteredHods.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Filters Top Row */}
      <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-gray-50">
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search HOD by name or department..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] placeholder:text-gray-400 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{filteredHods.length}</span> HOD{filteredHods.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[#0A6C54] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : currentHods.length === 0 ? (
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
              {currentHods.map((hod, index) => (
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
      {!loading && filteredHods.length > itemsPerPage && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-[13px] text-gray-600 font-medium">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredHods.length)} of {filteredHods.length} entries
          </p>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 text-[13px] font-medium rounded border transition-colors ${
                currentPage === 1 
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
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[32px] px-3 py-1.5 text-[13px] font-medium rounded border transition-colors ${
                    currentPage === page
                      ? 'bg-[#0A6C54] text-white border-[#0A6C54]'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 text-[13px] font-medium rounded border transition-colors ${
                currentPage === totalPages 
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
        <ViewHodModal 
          hod={selectedHod} 
          onClose={() => {
            setShowViewModal(false);
            setSelectedHod(null);
          }} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedHod && (
        <DeleteConfirmationModal
          title="Delete HOD"
          message={`Are you sure you want to delete ${selectedHod.name}? This will remove them from the HOD role but they will still exist as a teacher.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedHod(null);
          }}
        />
      )}
    </div>
  );
};

// View Modal Component
const ViewHodModal = ({ hod, onClose }) => {
  const baseURL = 'http://localhost:5000';
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'text-[#15803d] bg-[#dcfce3]';
      case 'Inactive': return 'text-[#dc2626] bg-[#fee2e2]';
      case 'On Leave': return 'text-[#d97706] bg-[#fef3c7]';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-[#0A6C54] to-[#0d8566] p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <h3 className="text-xl font-bold text-white">HOD Details</h3>
          <p className="text-white/80 text-sm mt-1">Complete information about the HOD</p>
        </div>

        {/* Profile Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-[#0A6C54] to-[#0d8566] flex items-center justify-center flex-shrink-0">
              {hod.profileImage ? (
                <img 
                  src={`${baseURL}${hod.profileImage}`} 
                  alt={hod.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={hod.profileImage ? 'hidden' : 'flex'} style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <User size={40} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-800">{hod.name}</h4>
              <p className="text-sm text-[#0A6C54] font-medium">{hod.designation} - {hod.department}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wide mt-2 ${getStatusColor(hod.status)}`}>
                {hod.status}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div>
            <h5 className="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200">Personal Information</h5>
            <div className="space-y-3">
              <InfoRow label="Email" value={hod.email || 'N/A'} />
              <InfoRow label="Mobile" value={hod.mobile || 'N/A'} />
              {hod.dateOfBirth && <InfoRow label="Date of Birth" value={formatDate(hod.dateOfBirth)} />}
              {hod.gender && <InfoRow label="Gender" value={hod.gender} />}
              {hod.qualification && <InfoRow label="Qualification" value={hod.qualification} />}
              {hod.experience && <InfoRow label="Experience" value={`${hod.experience} years`} />}
            </div>
          </div>

          {/* Employment Information */}
          <div>
            <h5 className="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200">Employment Information</h5>
            <div className="space-y-3">
              <InfoRow label="Department" value={hod.department || 'N/A'} />
              <InfoRow label="Designation" value={hod.designation || 'N/A'} />
              <InfoRow label="Date of Joining" value={formatDate(hod.dateOfJoining)} />
              {hod.payScale && <InfoRow label="Pay Scale" value={hod.payScale} />}
              <InfoRow label="Status" value={hod.status || 'N/A'} />
              {hod.createdAt && <InfoRow label="Created Date" value={formatDate(hod.createdAt)} />}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Info Row Component
const InfoRow = ({ label, value }) => (
  <div className="flex items-start">
    <span className="text-xs font-semibold text-gray-500 w-32 flex-shrink-0">{label}</span>
    <span className="text-sm text-gray-800 font-medium flex-1">{value}</span>
  </div>
);

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-red-50">
          <AlertTriangle size={24} className="text-red-600" />
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>

        <div className="px-6 py-6">
          <p className="text-gray-600 text-sm">{message}</p>
        </div>

        <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hods;
