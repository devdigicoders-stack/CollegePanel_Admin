import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import { Search, FileText, Eye, Lock, Unlock } from 'lucide-react';
import * as XLSX from 'xlsx';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import SkeletonLoader from '../../components/SkeletonLoader';

const Members = () => {
  if (!checkPermission('View Books') && !checkPermission('Issue Book')) {
    return <AccessDenied />;
  }
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [memberHistory, setMemberHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [page, search, filterType, filterStatus]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterType && filterType !== 'All') params.append('type', filterType);
      if (filterStatus && filterStatus !== 'All') params.append('status', filterStatus);
      params.append('page', page);
      params.append('limit', 10);
      
      const response = await axiosInstance.get(`/library/members?${params.toString()}`);
      setMembers(response.data.members || response.data);
      setTotalPages(response.data.pagination?.totalPages || response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberHistory = async (memberId) => {
    try {
      setHistoryLoading(true);
      const response = await axiosInstance.get(`/library/transactions?studentId=${memberId}`);
      setMemberHistory(response.data);
    } catch (error) {
      console.error('Error fetching member history:', error);
      toast.error('Failed to load member history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const toggleMemberStatus = async (memberId) => {
    try {
      const response = await axiosInstance.put(`/library/members/${memberId}/toggle-status`);
      toast.success(response.data.message);
      fetchMembers();
    } catch (error) {
      console.error('Error toggling member status:', error);
      toast.error(error.response?.data?.message || 'Failed to update member status');
    }
  };

  const openHistoryModal = async (member) => {
    setSelectedMember(member);
    await fetchMemberHistory(member._id);
    setShowHistoryModal(true);
  };

  const handleExport = () => {
    if (members.length === 0) {
      toast.error('No members to export');
      return;
    }
    const exportData = members.map(m => ({
      'Member ID': m.memberId,
      'Name': m.name,
      'Role': m.type,
      'Department/Course': m.department + (m.course !== 'N/A' ? ` (${m.course})` : ''),
      'Books Issued': m.issuedCount,
      'Pending Fine (₹)': m.fine,
      'Status': m.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
    XLSX.writeFile(workbook, 'Library_Members_List.xlsx');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Library Membership Management</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Activate, suspend, and view issue card limits for college members</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <FileText size={15} className="text-gray-500" /> Export Card List
        </button>
      </div>

      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by student name or member ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>

        <div className="flex gap-3">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="Student">Student</option>
            <option value="Teacher">Teacher</option>
            <option value="HOD">HOD</option>
            <option value="Employee">Employee</option>
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <SkeletonLoader type="table" rows={5} cols={5} />
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Member ID</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Role</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Department / Course</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Books Issued</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Pending Fine</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.memberId}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.type}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500">{item.department} {item.course !== 'N/A' && `(${item.course})`}</td>
                  <td className="py-4 px-6 text-[13px] text-center font-semibold text-gray-700">{item.issuedCount}</td>
                  <td className="py-4 px-6 text-[13px] text-right font-bold text-red-500">₹{item.fine}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${item.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex gap-2">
                    <button onClick={() => openHistoryModal(item)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Circulation History"><Eye size={15} /></button>
                    <button onClick={() => toggleMemberStatus(item._id)} className={`p-1.5 rounded-lg transition-colors ${item.status === 'Active' ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'}`} title={item.status === 'Active' ? 'Deactivate Card' : 'Activate Card'}>                      {item.status === 'Active' ? <Lock size={15} /> : <Unlock size={15} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {members.length === 0 && (
            <div className="flex items-center justify-center py-12 text-gray-500">
              No members found.
            </div>
          )}
        </div>
      )}

      {members.length > 0 && (
        <div className="p-6 border-t border-gray-100 flex justify-between items-center">
          <span className="text-[13px] text-gray-500">
            Showing {members.length} members • Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-[13px] border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 text-[13px] border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showHistoryModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">{selectedMember.name} - Library Card Account</h3>
              <button onClick={() => { setShowHistoryModal(false); setSelectedMember(null); }} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-[13px] bg-gray-50 p-4 rounded-xl">
                <div><span className="text-gray-500">Member ID:</span> <span className="font-semibold text-gray-800">{selectedMember.memberId}</span></div>
                <div><span className="text-gray-500">Issued Books:</span> <span className="font-semibold text-gray-800">{selectedMember.issuedCount} / 5 limit</span></div>
                <div><span className="text-gray-500">Department:</span> <span className="font-semibold text-gray-800">{selectedMember.department}</span></div>
                <div><span className="text-gray-500">Pending Fines:</span> <span className="font-bold text-red-500">₹{selectedMember.fine}</span></div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 text-[13px] mb-3">Currently Borrowed Books</h4>
                {historyLoading ? (
                  <SkeletonLoader type="table" rows={5} cols={5} />
                ) : memberHistory.filter(t => t.status === 'Issued' || t.status === 'Overdue').length > 0 ? (
                  <div className="space-y-2">
                    {memberHistory.filter(t => t.status === 'Issued' || t.status === 'Overdue').slice(0, selectedMember.issuedCount).map((trans, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg text-[13px]">
                        <div>
                          <p className="font-semibold text-gray-800">{trans.bookId?.title || 'Unknown'}</p>
                          <p className="text-[11px] text-gray-400">Barcode: {trans.bookId?.accessionNo || 'N/A'}</p>
                        </div>
                        <span className="text-[11px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">Due: {trans.dueDate ? new Date(trans.dueDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No books currently issued to this member.</p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-gray-800 text-[13px] mb-2">Recent Transactions</h4>
                {historyLoading ? (
                  <SkeletonLoader type="table" rows={5} cols={5} />
                ) : memberHistory.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {memberHistory.slice(0, 5).map((trans, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-[12px]">
                        <span className={`font-bold px-2 py-0.5 rounded ${trans.status === 'Issued' || trans.status === 'Renewed' ? 'bg-blue-50 text-blue-600' : trans.status === 'Returned' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{trans.status}</span>
                        <span className="text-gray-600">{trans.bookId?.title || 'Unknown'}</span>
                        <span className="text-gray-400">{new Date(trans.createdAt || trans.issueDate).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-gray-500 text-center py-3 bg-gray-50 rounded-lg">No transaction history found.</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => { setShowHistoryModal(false); setSelectedMember(null); }}
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
                >
                  Close Account View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
