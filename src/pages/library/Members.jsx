import React, { useState } from 'react';
import { Search, Edit2, Eye, Download, UserCheck, UserX, BookOpen, AlertCircle } from 'lucide-react';

const initialMembers = [
  { id: 1, memberId: 'LIB-S-101', name: 'Amit Sharma', type: 'Student', department: 'Computer Science', course: 'Diploma CE', semester: '3rd', status: 'Active', issuedCount: 2, fine: 50 },
  { id: 2, memberId: 'LIB-S-102', name: 'Pooja Patel', type: 'Student', department: 'Computer Science', course: 'Diploma CE', semester: '5th', status: 'Active', issuedCount: 3, fine: 120 },
  { id: 3, memberId: 'LIB-T-201', name: 'Dr. Ramesh Patil', type: 'Teacher', department: 'Computer Science', course: 'N/A', semester: 'N/A', status: 'Active', issuedCount: 4, fine: 0 },
  { id: 4, memberId: 'LIB-S-103', name: 'Rohan Joshi', type: 'Student', department: 'Mechanical Engineering', course: 'Diploma ME', semester: '1st', status: 'Inactive', issuedCount: 0, fine: 0 },
  { id: 5, memberId: 'LIB-H-301', name: 'Prof. S.K. Bose', type: 'HOD', department: 'Electrical Engineering', course: 'N/A', semester: 'N/A', status: 'Active', issuedCount: 5, fine: 0 },
];

const Members = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [members, setMembers] = useState(initialMembers);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const filtered = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.memberId.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || m.type === filterType;
    const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const toggleStatus = (id) => {
    setMembers(members.map(m => m.id === id ? { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' } : m));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Library Membership Management</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Activate, suspend, and view issue card limits for college members</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export Card List
        </button>
      </div>

      {/* Filters */}
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

      {/* Table */}
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
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.memberId}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.type}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.department} {item.course !== 'N/A' && `(${item.course})`}</td>
                <td className="py-4 px-6 text-[13px] text-center font-semibold text-gray-700">{item.issuedCount}</td>
                <td className="py-4 px-6 text-[13px] text-right font-bold text-red-500">₹{item.fine}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6 flex gap-2">
                  <button onClick={() => { setSelectedMember(item); setShowHistoryModal(true); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Circulation History"><Eye size={15} /></button>
                  <button onClick={() => toggleStatus(item.id)} className={`p-1.5 rounded-lg transition-colors ${item.status === 'Active' ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'}`} title={item.status === 'Active' ? 'Deactivate Card' : 'Activate Card'}>
                    {item.status === 'Active' ? <UserX size={15} /> : <UserCheck size={15} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Member History Modal */}
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
                {selectedMember.issuedCount > 0 ? (
                  <div className="space-y-2">
                    {[
                      { title: 'Introduction to Algorithms', due: '2024-02-28', barcode: 'ACC-8021' },
                      { title: 'Database System Concepts', due: '2024-02-20', barcode: 'ACC-8022' }
                    ].slice(0, selectedMember.issuedCount).map((book, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg text-[13px]">
                        <div>
                          <p className="font-semibold text-gray-800">{book.title}</p>
                          <p className="text-[11px] text-gray-400">Barcode: {book.barcode}</p>
                        </div>
                        <span className="text-[11px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">Due: {book.due}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No books currently issued to this member.</p>
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
