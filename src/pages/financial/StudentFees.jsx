import React, { useState, useEffect } from 'react';
import { Search, Eye, ChevronDown, Download, FileText } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const statusColors = {
  'Paid': 'bg-green-100 text-green-700',
  'Partial': 'bg-orange-100 text-orange-700',
  'Overdue': 'bg-red-100 text-red-700',
  'Pending': 'bg-gray-100 text-gray-700',
};

const StudentFees = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCourse, setFilterCourse] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus !== 'All') params.status = filterStatus;
      if (filterCourse !== 'All') params.course = filterCourse;
      const res = await axiosInstance.get('/fees/student-fees', { params });
      setData(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch student fees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterStatus, filterCourse]);

  const paymentHistory = [
    { date: '2024-01-15', receiptNo: 'RCP/2024/001', head: 'Admission Fee', amount: 5000, mode: 'Cash', status: 'Completed' },
    { date: '2024-01-20', receiptNo: 'RCP/2024/015', head: 'Tuition Fee (1st Inst.)', amount: 12500, mode: 'UPI', status: 'Completed' },
    { date: '2024-02-10', receiptNo: 'RCP/2024/042', head: 'Registration Fee', amount: 2000, mode: 'Bank Transfer', status: 'Completed' },
    { date: '2024-02-15', receiptNo: 'RCP/2024/058', head: 'Lab Fee', amount: 2000, mode: 'UPI', status: 'Completed' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Student Fees</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Complete fee ledger for all students</p>
        </div>
        <button onClick={() => toast.success('Export started')} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">
          <Download size={15} /> Export
        </button>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name or enrollment no..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
        <div className="relative">
          <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
            <option>All</option>
            {['Diploma in CE', 'Diploma in IT', 'Diploma in ME', 'Diploma in EE'].map(c => <option key={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
        <div className="relative">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
            <option>All</option>
            {Object.keys(statusColors).map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={13} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                {['Enroll No.', 'Student Name', 'Course', 'Sem', 'Total Fee', 'Paid', 'Discount', 'Scholarship', 'Pending', 'Fine', 'Next Due', 'Status', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(s => (
                <tr key={s._id || s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{s.enrollNo}</td>
                  <td className="py-3 px-4 text-[13px] font-medium text-gray-800">{s.name}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{s.course}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{s.semester}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-700">₹{(s.totalFee || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] font-semibold text-green-700">₹{(s.paid || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] text-blue-600">{(s.discount || 0) > 0 ? `₹${(s.discount || 0).toLocaleString()}` : '-'}</td>
                  <td className="py-3 px-4 text-[13px] text-purple-600">{(s.scholarship || 0) > 0 ? `₹${(s.scholarship || 0).toLocaleString()}` : '-'}</td>
                  <td className="py-3 px-4 text-[13px] font-semibold text-red-600">₹{(s.pending || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] text-orange-600">{(s.fine || 0) > 0 ? `₹${(s.fine || 0).toLocaleString()}` : '-'}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{s.nextDue || <span className="text-gray-400">-</span>}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[s.status] || 'bg-gray-100 text-gray-700'}`}>{s.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => setSelectedStudent(s)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={15} className="text-gray-500" /></button>
                  </td>
                </tr>
              ))}
              {!loading && data.length === 0 && (
                <tr><td colSpan={13} className="py-8 text-center text-gray-500 text-[13px]">No student fees found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-[12px] text-gray-500">Showing {data.length} of {data.length} students</p>
        <div className="flex gap-2">
          {['Prev', '1', '2', '3', 'Next'].map(p => (
            <button key={p} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium ${p === '1' ? 'bg-[#0A6C54] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
          ))}
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h3 className="text-[16px] font-bold text-gray-800">{selectedStudent.name} - Fee Ledger</h3>
                <p className="text-[12px] text-gray-500">{selectedStudent.enrollNo} • {selectedStudent.course}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">✕</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Fee', value: `₹${(selectedStudent.totalFee || 0).toLocaleString()}`, color: 'text-gray-800' },
                  { label: 'Amount Paid', value: `₹${(selectedStudent.paid || 0).toLocaleString()}`, color: 'text-green-700' },
                  { label: 'Pending', value: `₹${(selectedStudent.pending || 0).toLocaleString()}`, color: 'text-red-600' },
                  { label: 'Fine', value: `₹${(selectedStudent.fine || 0).toLocaleString()}`, color: 'text-orange-600' },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-[11px] text-gray-500 mb-1">{item.label}</p>
                    <p className={`text-[18px] font-bold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-gray-800 mb-3">Payment History</h4>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-y border-gray-100">
                      {['Date', 'Receipt No.', 'Fee Head', 'Amount', 'Mode', 'Status'].map(h => (
                        <th key={h} className="py-2.5 px-4 text-[12px] font-bold text-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((p, idx) => (
                      <tr key={idx} className="border-b border-gray-50">
                        <td className="py-2.5 px-4 text-[13px] text-gray-600">{p.date}</td>
                        <td className="py-2.5 px-4 text-[13px] font-semibold text-[#0A6C54]">{p.receiptNo}</td>
                        <td className="py-2.5 px-4 text-[13px] text-gray-700">{p.head}</td>
                        <td className="py-2.5 px-4 text-[13px] font-semibold text-gray-800">₹{p.amount.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-[13px] text-gray-600">{p.mode}</td>
                        <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFees;

