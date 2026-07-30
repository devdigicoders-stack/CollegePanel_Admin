import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Eye, Download, Filter, Trash2, Calendar, FileText, IndianRupee } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const categories = ['All', 'Rental Income', 'Training Income', 'Seminar Fees', 'Donations', 'Grants', 'Scrap Sale', 'Other Income'];
const modes = ['All', 'Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque', 'Demand Draft'];

const Income = () => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterMode, setFilterMode] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [newIncome, setNewIncome] = useState({
    category: 'Training Income',
    source: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    mode: 'Bank Transfer',
    description: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterCategory !== 'All') params.category = filterCategory;
      if (filterMode !== 'All') params.status = filterMode;
      const res = await axiosInstance.get('/fees/income', { params });
      setData(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch income');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterCategory, filterMode]);

  const handleAddIncome = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/fees/income', newIncome);
      toast.success('Income recorded successfully');
      setShowModal(false);
      setNewIncome({
        category: 'Training Income',
        source: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        mode: 'Bank Transfer',
        description: '',
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record income');
    }
  };

  const filtered = data.filter(item => {
    const matchesSearch = item.source?.toLowerCase().includes(search.toLowerCase()) || 
                          item.receiptNo?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesMode = filterMode === 'All' || item.mode === filterMode;
    return matchesSearch && matchesCategory && matchesMode;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Other Income</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Track and record non-academic income sources</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => toast.success('Exporting...')} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export
          </button>
          <button onClick={() => setShowModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Record Income
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by source or receipt no..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>

        <div className="flex gap-3">
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            value={filterMode} 
            onChange={(e) => setFilterMode(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            {modes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={8} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Receipt No</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Category</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Source</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Amount</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Date</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Payment Mode</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id || item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.receiptNo}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.category}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-medium">{item.source}</td>
                  <td className="py-4 px-6 text-[13px] font-bold text-gray-900">₹{(item.amount || 0).toLocaleString()}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500">{item.date}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.mode}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      item.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"><Eye size={15} /></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"><Edit2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-gray-500 text-[13px]">No income records found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Record Income Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Record New Income</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddIncome} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Category</label>
                <select 
                  value={newIncome.category} 
                  onChange={(e) => setNewIncome({...newIncome, category: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                >
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Source / Description</label>
                <input 
                  type="text" 
                  required
                  value={newIncome.source}
                  onChange={(e) => setNewIncome({...newIncome, source: e.target.value})}
                  placeholder="e.g. Auditorium Booking Fee"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({...newIncome, amount: e.target.value})}
                    placeholder="0"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    value={newIncome.date}
                    onChange={(e) => setNewIncome({...newIncome, date: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Payment Mode</label>
                <select 
                  value={newIncome.mode} 
                  onChange={(e) => setNewIncome({...newIncome, mode: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                >
                  {modes.filter(m => m !== 'All').map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Remarks</label>
                <textarea 
                  value={newIncome.description}
                  onChange={(e) => setNewIncome({...newIncome, description: e.target.value})}
                  placeholder="Additional details..."
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-20 resize-none focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Income;

