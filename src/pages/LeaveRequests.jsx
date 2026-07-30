import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronDown, Eye, Check, X as XIcon, 
  ChevronLeft, ChevronRight, Calendar, User, FileText, AlertTriangle
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const LeaveRequests = () => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  
  // Filters
  const [filters, setFilters] = useState({
    type: 'All Types',
    department: 'All Departments',
    search: ''
  });

  // Modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const tabs = [
    { name: 'Pending', count: 12 },
    { name: 'Approved', count: 45 },
    { name: 'Rejected', count: 8 },
    { name: 'All', count: 65 }
  ];

  // Static data for now
  const staticLeaveRequests = [
    {
      _id: '1',
      requestId: 'LR2024001',
      applicantName: 'Dr. Rajesh Kumar',
      employeeId: 'EMP20240001',
      applicantType: 'Faculty',
      department: 'Computer Science',
      leaveType: 'Casual Leave',
      fromDate: '2024-02-15',
      toDate: '2024-02-17',
      days: 3,
      reason: 'Personal work',
      status: 'Pending',
      appliedDate: '2024-02-10',
      attachments: []
    },
    {
      _id: '2',
      requestId: 'LR2024002',
      applicantName: 'Prof. Meena Sharma',
      employeeId: 'EMP20240015',
      applicantType: 'Faculty',
      department: 'Electronics',
      leaveType: 'Medical Leave',
      fromDate: '2024-02-12',
      toDate: '2024-02-14',
      days: 3,
      reason: 'Health checkup',
      status: 'Pending',
      appliedDate: '2024-02-08',
      attachments: ['medical_certificate.pdf']
    },
    {
      _id: '3',
      requestId: 'LR2024003',
      applicantName: 'Mr. Suresh Patel',
      employeeId: 'EMP20240032',
      applicantType: 'Staff',
      department: 'Administration',
      leaveType: 'Earned Leave',
      fromDate: '2024-02-20',
      toDate: '2024-02-25',
      days: 6,
      reason: 'Family function',
      status: 'Approved',
      appliedDate: '2024-02-05',
      approvedBy: 'Principal',
      approvedDate: '2024-02-06',
      attachments: []
    }
  ];

  useEffect(() => {
    fetchLeaveRequests();
  }, [activeTab, pagination.page, filters]);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const res = await axiosInstance.get('/leave-requests', { params: { status: activeTab, ...filters } });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter static data based on tab
      let filtered = staticLeaveRequests;
      if (activeTab !== 'All') {
        filtered = staticLeaveRequests.filter(req => req.status === activeTab);
      }
      
      setLeaveRequests(filtered);
      setPagination(prev => ({ ...prev, total: filtered.length, pages: Math.ceil(filtered.length / prev.limit) }));
    } catch (error) {
      toast.error('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveTypeColor = (type) => {
    switch(type) {
      case 'Casual Leave': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Medical Leave': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Earned Leave': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Emergency Leave': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleView = (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const handleApproveClick = (request) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleApproveConfirm = async () => {
    try {
      // TODO: API call to approve
      // await axiosInstance.put(`/leave-requests/${selectedRequest._id}/approve`);
      toast.success('Leave request approved successfully');
      setShowApproveModal(false);
      fetchLeaveRequests();
    } catch (error) {
      toast.error('Failed to approve leave request');
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      // TODO: API call to reject
      // await axiosInstance.put(`/leave-requests/${selectedRequest._id}/reject`, { reason: rejectReason });
      toast.success('Leave request rejected');
      setShowRejectModal(false);
      fetchLeaveRequests();
    } catch (error) {
      toast.error('Failed to reject leave request');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-4 pb-2">
        <h2 className="text-lg font-bold text-gray-800">Leave Requests</h2>
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
            className={`whitespace-nowrap px-4 py-4 text-[14px] font-semibold transition-all relative flex items-center gap-2 ${
              activeTab === tab.name 
                ? 'text-[#0A6C54]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.name}
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === tab.name ? 'bg-[#0A6C54] text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {tab.count}
            </span>
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
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
            >
              <option value="All Types">All Types</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Medical Leave">Medical Leave</option>
              <option value="Earned Leave">Earned Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative">
            <select 
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
              className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
            >
              <option value="All Departments">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Administration">Administration</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            placeholder="Search by name or ID" 
            className="w-full sm:w-[260px] bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto relative">
        {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10"><div className="w-8 h-8 border-4 border-[#0A6C54] border-t-transparent rounded-full animate-spin"></div></div>}
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-[#F9FAFB] border-y border-gray-100">
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[8%]">Request ID</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[14%]">Applicant</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[11%]">Department</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[13%]">Leave Type</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%]">From Date</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%]">To Date</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[6%]">Days</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%]">Status</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[18%] text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.length > 0 ? leaveRequests.map((row) => (
              <tr key={row._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{row.requestId}</td>
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <span className="text-[13px] text-gray-800 font-medium">{row.applicantName}</span>
                    <span className="text-[11px] text-gray-500">{row.employeeId}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.department}</td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <span className={`inline-block px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border ${getLeaveTypeColor(row.leaveType)} whitespace-nowrap`}>
                    {row.leaveType}
                  </span>
                </td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{formatDate(row.fromDate)}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{formatDate(row.toDate)}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{row.days}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${getStatusColor(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-1.5">
                    <button 
                      onClick={() => handleView(row)}
                      className="w-8 h-8 rounded-full border border-green-100 flex items-center justify-center text-[#0A6C54] hover:bg-green-50 transition-colors"
                      title="View Details"
                    >
                      <Eye size={14} strokeWidth={2} />
                    </button>
                    {row.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => handleApproveClick(row)}
                          className="w-8 h-8 rounded-full border border-green-100 flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors"
                          title="Approve"
                        >
                          <Check size={14} strokeWidth={2} />
                        </button>
                        <button 
                          onClick={() => handleRejectClick(row)}
                          className="w-8 h-8 rounded-full border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                          title="Reject"
                        >
                          <XIcon size={14} strokeWidth={2} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="9" className="py-8 text-center text-[13px] text-gray-500">
                  {loading ? 'Loading leave requests...' : 'No leave requests found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-gray-100 gap-4">
        <div className="text-[13px] text-gray-500 font-medium">
          Showing {leaveRequests.length} of {pagination.total} entries | Page {pagination.page} of {pagination.pages}
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

      {/* VIEW MODAL */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Leave Request Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Request ID" value={selectedRequest.requestId} />
                <DetailRow label="Status" value={<span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(selectedRequest.status)}`}>{selectedRequest.status}</span>} />
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Applicant Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Name" value={selectedRequest.applicantName} />
                  <DetailRow label="Employee ID" value={selectedRequest.employeeId} />
                  <DetailRow label="Type" value={selectedRequest.applicantType} />
                  <DetailRow label="Department" value={selectedRequest.department} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Leave Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Leave Type" value={<span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getLeaveTypeColor(selectedRequest.leaveType)}`}>{selectedRequest.leaveType}</span>} />
                  <DetailRow label="Total Days" value={`${selectedRequest.days} days`} />
                  <DetailRow label="From Date" value={formatDate(selectedRequest.fromDate)} />
                  <DetailRow label="To Date" value={formatDate(selectedRequest.toDate)} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Reason</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">Attachments</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.attachments.map((file, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200">
                        {file}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.status !== 'Pending' && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Decision Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRequest.approvedBy && <DetailRow label="Approved By" value={selectedRequest.approvedBy} />}
                    {selectedRequest.approvedDate && <DetailRow label="Approved Date" value={formatDate(selectedRequest.approvedDate)} />}
                    {selectedRequest.rejectedBy && <DetailRow label="Rejected By" value={selectedRequest.rejectedBy} />}
                    {selectedRequest.rejectedDate && <DetailRow label="Rejected Date" value={formatDate(selectedRequest.rejectedDate)} />}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              {selectedRequest.status === 'Pending' && (
                <>
                  <button 
                    onClick={() => {
                      setShowViewModal(false);
                      handleApproveClick(selectedRequest);
                    }}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => {
                      setShowViewModal(false);
                      handleRejectClick(selectedRequest);
                    }}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                  >
                    Reject
                  </button>
                </>
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

      {/* APPROVE MODAL */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check size={24} className="text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Approve Leave Request</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to approve <strong>{selectedRequest.applicantName}</strong>'s leave request for <strong>{selectedRequest.days} days</strong>?
            </p>

            <div className="flex gap-3">
              <button 
                onClick={handleApproveConfirm}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
              >
                Approve
              </button>
              <button 
                onClick={() => setShowApproveModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Reject Leave Request</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting <strong>{selectedRequest.applicantName}</strong>'s leave request:
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 resize-none mb-4"
            />

            <div className="flex gap-3">
              <button 
                onClick={handleRejectConfirm}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
              >
                Reject
              </button>
              <button 
                onClick={() => setShowRejectModal(false)}
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

// Helper Component
const DetailRow = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs font-semibold text-gray-500 mb-1">{label}</span>
    <span className="text-sm text-gray-800 font-medium">{value}</span>
  </div>
);

export default LeaveRequests;
