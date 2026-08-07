const fs = require('fs');
const path = require('path');

const filepath = path.join('d:', 'Desktop', 'DCT_CLG_CRM', 'admin', 'src', 'pages', 'hostel-warden', 'Visitors.jsx');

const content = `import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../../utils/axiosInstance';

const Visitors = () => {
  const [search, setSearch] = useState('');
  const [visitors, setVisitors] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVisitor, setNewVisitor] = useState({
    visitorName: '',
    contactNumber: '',
    studentId: '',
    relation: 'Father',
    purpose: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [visitorsRes, studentsRes] = await Promise.all([
        axiosInstance.get('/hostel/visitors'),
        axiosInstance.get('/students')
      ]);
      setVisitors(visitorsRes.data || []);
      setStudents(studentsRes.data.students || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filtered = visitors.filter(v => {
    const studentName = v.studentId?.name?.toLowerCase() || '';
    const visitorName = v.visitorName.toLowerCase();
    return visitorName.includes(search.toLowerCase()) || studentName.includes(search.toLowerCase());
  });

  const handleAddVisitor = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/hostel/visitors', newVisitor);
      toast.success(\`Visitor entry recorded for \${newVisitor.visitorName}!\`);
      setShowAddModal(false);
      setNewVisitor({
        visitorName: '',
        contactNumber: '',
        studentId: '',
        relation: 'Father',
        purpose: '',
      });
      fetchData(); // refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error recording visitor');
    }
  };

  const handleCheckout = async (id) => {
    try {
      await axiosInstance.put(\`/hostel/visitors/\${id}/checkout\`);
      toast.success('Visitor checked out successfully.');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error checking out visitor');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Visitor Gates Registry</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Record guardian check-ins, issue entry slips, and track exit times</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Registry
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Record Entry
          </button>
        </div>
      </div>

      <div className="p-6 border-b border-gray-100 bg-gray-50/30">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by visitor name or student name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        {loading ? (
           <div className="flex items-center justify-center py-12 text-gray-500">Loading visitors...</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Visitor Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Mobile</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Ref</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Relation</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Entry / Exit</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.visitorName}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{item.contactNumber}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.studentId?.name || 'Unknown'} <span className="text-gray-500 font-normal text-[11px] block">{item.studentId?.rollNumber}</span></td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{item.relation}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500">
                    <div>{new Date(item.inTime).toLocaleString()}</div>
                    <div className="font-semibold">{item.outTime ? new Date(item.outTime).toLocaleString() : '-'}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={\`px-2.5 py-1 rounded-full text-[11px] font-semibold \${
                      item.outTime ? 'bg-gray-50 text-gray-600 border border-gray-200' : 'bg-green-50 text-green-700 border border-green-100'
                    }\`}>
                      {item.outTime ? 'Checked Out' : 'Currently Inside'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {!item.outTime ? (
                      <button onClick={() => handleCheckout(item._id)} className="px-2 py-1 text-[11px] font-bold bg-[#0A6C54] text-white rounded hover:bg-[#085a46] transition-colors">Checkout</button>
                    ) : (
                      <span className="text-[12px] text-gray-400 italic font-medium">Out</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500 text-[13px]">No visitor records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Record Visitor Entry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddVisitor} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Visitor Name</label>
                <input 
                  type="text" 
                  required
                  value={newVisitor.visitorName}
                  onChange={(e) => setNewVisitor({...newVisitor, visitorName: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Mobile No</label>
                <input 
                  type="text" 
                  required
                  value={newVisitor.contactNumber}
                  onChange={(e) => setNewVisitor({...newVisitor, contactNumber: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Visiting Student</label>
                  <select 
                    required
                    value={newVisitor.studentId}
                    onChange={(e) => setNewVisitor({...newVisitor, studentId: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="">Select Student...</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Relationship</label>
                  <select 
                    value={newVisitor.relation} 
                    onChange={(e) => setNewVisitor({...newVisitor, relation: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Purpose of Visit</label>
                <textarea 
                  required
                  value={newVisitor.purpose}
                  onChange={(e) => setNewVisitor({...newVisitor, purpose: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-20 resize-none focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
                >
                  Log Gate Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visitors;
`;

fs.writeFileSync(filepath, content, 'utf-8');
console.log("Rewrote Visitors.jsx");
