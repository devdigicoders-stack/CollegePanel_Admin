import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, ChevronDown, Download, X, Upload, CheckCircle, XCircle } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const statusColors = {
  'Approved': 'bg-green-100 text-green-700',
  'Pending': 'bg-orange-100 text-orange-700',
  'Under Review': 'bg-blue-100 text-blue-700',
  'Rejected': 'bg-red-100 text-red-700',
};

const categories = ['Electricity', 'Maintenance', 'Stationery', 'Lab Equipment', 'Transport', 'Salary', 'Events', 'Repairs', 'Internet', 'Office Expenses'];

const Expenses = () => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    category: 'Electricity', vendor: '', amount: '', date: '', mode: 'Cash', invoiceNo: '', dept: 'Admin', description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterCategory !== 'All') params.category = filterCategory;
      if (filterStatus !== 'All') params.approvalStatus = filterStatus;
      const res = await axiosInstance.get('/fees/expenses', { params });
      setData(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterCategory, filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/fees/expenses', formData);
      toast.success('Expense added successfully');
      setShowModal(false);
      setFormData({ category: 'Electricity', vendor: '', amount: '', date: '', mode: 'Cash', invoiceNo: '', dept: 'Admin', description: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/fees/expenses/${id}`, { approvalStatus: status });
      toast.success(`Expense ${status.toLowerCase()} successfully`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update expense status');
    }
  };

  const totalExpense = data.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Expenses</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Track and manage all college expenses</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => toast.success('Exporting...')} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">
            <Download size={15} /> Export
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold">
            <Plus size={15} /> Add Expense
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Expenses', value: `₹${totalExpense.toLocaleString()}`, color: 'bg-red-50 text-red-700' },
          { label: 'Approved', value: data.filter(e => e.approvalStatus === 'Approved').length, color: 'bg-green-50 text-green-700' },
          { label: 'Pending Approval', value: data.filter(e => e.approvalStatus === 'Pending').length, color: 'bg-orange-50 text-orange-700' },
          { label: 'This Month', value: `₹${data.reduce((s, e) => s + (e.amount || 0), 0).toLocaleString()}`, color: 'bg-blue-50 text-blue-700' },
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
          <input type="text" placeholder="Search by vendor, description..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
        <div className="relative">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
            <option>All</option>
            {categories.map(c => <option key={c}>{c}</option>)}
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
                {['Exp No.', 'Category', 'Vendor', 'Amount', 'Date', 'Mode', 'Invoice No.', 'Department', 'Description', 'Approval', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(e => (
                <tr key={e._id || e.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{e.expNo}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-700">{e.category}</td>
                  <td className="py-3 px-4 text-[13px] font-medium text-gray-800">{e.vendor}</td>
                  <td className="py-3 px-4 text-[13px] font-semibold text-red-600">₹{(e.amount || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{e.date}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{e.mode}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{e.invoiceNo}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{e.dept}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 max-w-[150px] truncate">{e.description}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[e.approvalStatus]}`}>{e.approvalStatus}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={14} className="text-gray-500" /></button>
                      {e.approvalStatus === 'Pending' && (
                        <>
                          <button onClick={() => handleUpdateStatus(e._id || e.id, 'Approved')} className="p-1.5 hover:bg-green-100 rounded-lg"><CheckCircle size={14} className="text-green-600" /></button>
                          <button onClick={() => handleUpdateStatus(e._id || e.id, 'Rejected')} className="p-1.5 hover:bg-red-100 rounded-lg"><XCircle size={14} className="text-red-600" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && data.length === 0 && (
                <tr><td colSpan={11} className="py-8 text-center text-gray-500 text-[13px]">No expenses found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-[16px] font-bold text-gray-800">Add Expense</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Expense Category</label>
                <div className="relative">
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value})} className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              {[
                { label: 'Vendor Name', placeholder: 'Enter vendor name', key: 'vendor' },
                { label: 'Amount (₹)', placeholder: 'Enter amount', key: 'amount', type: 'number' },
                { label: 'Invoice Number', placeholder: 'Enter invoice no.', key: 'invoiceNo' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{f.label}</label>
                  <input type={f.type || 'text'} placeholder={f.placeholder} value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
                </div>
              ))}
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Expense Date</label>
                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Payment Mode</label>
                <div className="relative">
                  <select value={formData.mode} onChange={e => setFormData({ ...formData, mode: e.target.value})} className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Card'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Department</label>
                <div className="relative">
                  <select value={formData.dept} onChange={e => setFormData({ ...formData, dept: e.target.value})} className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {['Admin', 'Civil Dept', 'IT Dept', 'Mechanical Dept', 'Electrical Dept'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea rows={2} placeholder="Enter expense description..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;


