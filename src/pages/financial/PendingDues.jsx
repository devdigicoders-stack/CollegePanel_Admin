import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Download, Bell, AlertCircle, Eye } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const statusColors = {
  'Overdue': 'bg-red-100 text-red-700',
  'Upcoming': 'bg-orange-100 text-orange-700',
  'Paid': 'bg-green-100 text-green-700',
};

const PendingDues = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCourse, setFilterCourse] = useState('All');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus !== 'All') params.status = filterStatus;
      if (filterCourse !== 'All') params.course = filterCourse;
      const res = await axiosInstance.get('/fees/pending-dues', { params });
      setData(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch pending dues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterStatus, filterCourse]);

  const totalDue = data.reduce((sum, d) => sum + (d.dueAmount || 0), 0);
  const overdueCount = data.filter(d => d.status === 'Overdue').length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Pending Dues</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Track and manage student pending fee dues</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => toast.success('Exporting defaulter list...')} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">
            <Download size={15} /> Export Defaulter List
          </button>
          <button onClick={() => toast.success('Reminders sent successfully')} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[13px] font-semibold">
            <Bell size={15} /> Send Reminders
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Pending', value: `₹${totalDue.toLocaleString()}`, color: 'bg-red-50 text-red-700' },
          { label: 'Overdue Students', value: overdueCount, color: 'bg-orange-50 text-orange-700' },
          { label: 'Total Students', value: data.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Avg Due Amount', value: `₹${data.length ? Math.round(totalDue / data.length).toLocaleString() : 0}`, color: 'bg-purple-50 text-purple-700' },
        ].map(card => (
          <div key={card.label} className={`${card.color} rounded-xl p-4`}>
            <p className="text-[11px] font-medium mb-1 opacity-80">{card.label}</p>
            <p className="text-[20px] font-bold">{card.value}</p>
          </div>
        ))}
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
          <SkeletonLoader type="table" rows={5} cols={11} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                {['Enroll No.', 'Student Name', 'Course', 'Due Head', 'Due Amount', 'Due Date', 'Overdue Days', 'Fine', 'Promise Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(d => (
                <tr key={d._id || d.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{d.enrollNo}</td>
                  <td className="py-3 px-4 text-[13px] font-medium text-gray-800">{d.name}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{d.course}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-700">{d.dueHead}</td>
                  <td className="py-3 px-4 text-[13px] font-semibold text-red-600">₹{(d.dueAmount || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{d.dueDate}</td>
                  <td className="py-3 px-4">
                    {(d.overdueDays || 0) > 0
                      ? <span className="flex items-center gap-1 text-[13px] font-semibold text-red-600"><AlertCircle size={13} />{d.overdueDays} days</span>
                      : <span className="text-[13px] text-gray-400">-</span>}
                  </td>
                  <td className="py-3 px-4 text-[13px] text-orange-600">{(d.fine || 0) > 0 ? `₹${d.fine}` : '-'}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{d.promiseDate || <span className="text-gray-400">-</span>}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[d.status] || 'bg-gray-100 text-gray-700'}`}>{d.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg" title="View"><Eye size={14} className="text-gray-500" /></button>
                      <button onClick={() => toast.success('Reminder sent')} className="p-1.5 hover:bg-orange-100 rounded-lg" title="Send Reminder"><Bell size={14} className="text-orange-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && data.length === 0 && (
                <tr><td colSpan={11} className="py-8 text-center text-gray-500 text-[13px]">No pending dues found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-[12px] text-gray-500">Showing {data.length} records</p>
        <div className="flex gap-2">
          {['Prev', '1', '2', 'Next'].map(p => (
            <button key={p} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium ${p === '1' ? 'bg-[#0A6C54] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PendingDues;

