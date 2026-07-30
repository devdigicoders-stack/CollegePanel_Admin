import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, ChevronDown, Download, X } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const statusColors = {
  'Sanctioned': 'bg-green-100 text-green-700',
  'Approved': 'bg-blue-100 text-blue-700',
  'Partial': 'bg-orange-100 text-orange-700',
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Under Review': 'bg-purple-100 text-purple-700',
  'Rejected': 'bg-red-100 text-red-700',
};

const Scholarships = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '', scheme: '', type: 'Government', category: 'General', income: '', amount: '', sanctionStatus: 'Pending'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus !== 'All') params.sanctionStatus = filterStatus;
      if (filterType !== 'All') params.category = filterType;
      const res = await axiosInstance.get('/fees/scholarships', { params });
      setData(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch scholarships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterType, filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/fees/scholarships', formData);
      toast.success('Scholarship added successfully');
      setShowModal(false);
      setFormData({ studentId: '', scheme: '', type: 'Government', category: 'General', income: '', amount: '', sanctionStatus: 'Pending' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add scholarship');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/fees/scholarships/${id}`, { sanctionStatus: status });
      toast.success(`Scholarship ${status.toLowerCase()} successfully`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update scholarship status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scholarship?')) return;
    try {
      await axiosInstance.delete(`/fees/scholarships/${id}`);
      toast.success('Scholarship deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete scholarship');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Scholarships</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Track government and college scholarships</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => toast.success('Exporting...')} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">
            <Download size={15} /> Export
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold">
            <Plus size={15} /> Add Scholarship
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-3 gap-4">
        {[
          { label: 'Total Scholarship Amount', value: `₹${data.reduce((sum, s) => sum + (s.amount || 0), 0).toLocaleString()}`, color: 'bg-blue-50 text-blue-700' },
          { label: 'Amount Received', value: `₹${data.reduce((sum, s) => sum + (s.received || 0), 0).toLocaleString()}`, color: 'bg-green-50 text-green-700' },
          { label: 'Amount Pending', value: `₹${data.reduce((sum, s) => sum + (s.pending || 0), 0).toLocaleString()}`, color: 'bg-orange-50 text-orange-700' },
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
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
            <option>All</option>
            <option>Government</option>
            <option>College</option>
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
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                {['Enroll No.', 'Student Name', 'Course', 'Scheme', 'Type', 'Category', 'Amount', 'Received', 'Pending', 'Sanction Status', 'Ledger Adj.', 'Actions'].map(h => (
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
                  <td className="py-3 px-4 text-[13px] text-gray-700">{s.scheme}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.type === 'Government' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>{s.type}</span>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{s.category}</td>
                  <td className="py-3 px-4 text-[13px] font-semibold text-gray-800">₹{(s.amount || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] font-semibold text-green-700">₹{(s.received || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] font-semibold text-orange-600">₹{(s.pending || 0).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[s.sanctionStatus]}`}>{s.sanctionStatus}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.ledgerAdjusted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {s.ledgerAdjusted ? 'Done' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={14} className="text-gray-500" /></button>
                      <button onClick={() => handleUpdateStatus(s._id || s.id, 'Approved')} className="p-1.5 hover:bg-green-100 rounded-lg"><CheckCircle size={14} className="text-green-600" /></button>
                      <button onClick={() => handleDelete(s._id || s.id)} className="p-1.5 hover:bg-red-100 rounded-lg"><XCircle size={14} className="text-red-600" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && data.length === 0 && (
                <tr><td colSpan={12} className="py-8 text-center text-gray-500 text-[13px]">No scholarships found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">Add Scholarship</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Student Enrollment No.', placeholder: 'e.g. OP/24/CE/001', key: 'studentId' },
                { label: 'Scholarship Scheme Name', placeholder: 'Enter scheme name', key: 'scheme' },
                { label: 'Scholarship Amount (₹)', placeholder: 'Enter amount', key: 'amount', type: 'number' },
                { label: 'Annual Family Income', placeholder: 'Enter income', key: 'income' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{f.label}</label>
                  <input type={f.type || 'text'} placeholder={f.placeholder} value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
                </div>
              ))}
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Scholarship Type</label>
                <div className="relative">
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value})} className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {['Government', 'College', 'Merit', 'Sports', 'Other'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Sanction Status</label>
                <div className="relative">
                  <select value={formData.sanctionStatus} onChange={e => setFormData({ ...formData, sanctionStatus: e.target.value})} className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {['Pending', 'Approved', 'Sanctioned', 'Under Review'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold">Save Scholarship</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scholarships;


