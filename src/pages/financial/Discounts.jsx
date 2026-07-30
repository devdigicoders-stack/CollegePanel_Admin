import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, ChevronDown, CheckCircle, XCircle, Clock, X, Download } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const statusColors = {
  'Approved': 'bg-green-100 text-green-700',
  'Pending': 'bg-orange-100 text-orange-700',
  'Under Review': 'bg-blue-100 text-blue-700',
  'Rejected': 'bg-red-100 text-red-700',
};

const discountTypes = ['Sibling Discount', 'Staff Ward Discount', 'Merit Discount', 'Sports Concession', 'Financial Assistance', 'Special Approval', 'Early Payment Discount'];

const Discounts = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '', type: 'Merit Discount', amount: '', appliedTo: 'Tuition Fee', remarks: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus !== 'All') params.status = filterStatus;
      const res = await axiosInstance.get('/fees/discounts', { params });
      setData(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch discounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/fees/discounts', formData);
      toast.success('Discount request submitted successfully');
      setShowModal(false);
      setFormData({ studentId: '', type: 'Merit Discount', amount: '', appliedTo: 'Tuition Fee', remarks: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit discount request');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/fees/discounts/${id}`, { status });
      toast.success(`Discount ${status.toLowerCase()} successfully`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update discount status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discount?')) return;
    try {
      await axiosInstance.delete(`/fees/discounts/${id}`);
      toast.success('Discount deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete discount');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Discounts & Concessions</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Manage student fee discounts and concessions</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => toast.success('Exporting...')} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">
            <Download size={15} /> Export
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold">
            <Plus size={15} /> New Discount Request
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Approved', value: `₹${data.filter(d => d.status === 'Approved').reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}`, color: 'bg-green-50 text-green-700' },
          { label: 'Pending Requests', value: data.filter(d => d.status === 'Pending').length, color: 'bg-orange-50 text-orange-700' },
          { label: 'Under Review', value: data.filter(d => d.status === 'Under Review').length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Total Requests', value: data.length, color: 'bg-purple-50 text-purple-700' },
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
          <SkeletonLoader type="table" rows={5} cols={10} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                {['Enroll No.', 'Student Name', 'Course', 'Discount Type', 'Amount', 'Applied To', 'Request Date', 'Approved By', 'Status', 'Actions'].map(h => (
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
                  <td className="py-3 px-4 text-[13px] text-gray-700">{d.type}</td>
                  <td className="py-3 px-4 text-[13px] font-semibold text-blue-700">₹{(d.amount || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{d.appliedTo}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{d.requestDate}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{d.approvedBy || <span className="text-gray-400">-</span>}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[d.status]}`}>{d.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={14} className="text-gray-500" /></button>
                      {d.status === 'Pending' && (
                        <>
                          <button onClick={() => handleUpdateStatus(d._id || d.id, 'Approved')} className="p-1.5 hover:bg-green-100 rounded-lg"><CheckCircle size={14} className="text-green-600" /></button>
                          <button onClick={() => handleUpdateStatus(d._id || d.id, 'Rejected')} className="p-1.5 hover:bg-red-100 rounded-lg"><XCircle size={14} className="text-red-600" /></button>
                        </>
                      )}
                      <button onClick={() => handleDelete(d._id || d.id)} className="p-1.5 hover:bg-red-100 rounded-lg"><XCircle size={14} className="text-red-600" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && data.length === 0 && (
                <tr><td colSpan={10} className="py-8 text-center text-gray-500 text-[13px]">No discounts found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">New Discount Request</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Student Enrollment No.</label>
                <input type="text" placeholder="e.g. OP/24/CE/001" value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Discount Type</label>
                <div className="relative">
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value})} className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {discountTypes.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Discount Amount (₹)</label>
                <input type="number" placeholder="Enter amount" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Apply To</label>
                <div className="relative">
                  <select value={formData.appliedTo} onChange={e => setFormData({ ...formData, appliedTo: e.target.value})} className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {['Tuition Fee', 'Total Fee', 'Admission Fee', 'Exam Fee'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Reason / Remarks</label>
                <textarea rows={3} placeholder="Explain reason for discount..." value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discounts;


