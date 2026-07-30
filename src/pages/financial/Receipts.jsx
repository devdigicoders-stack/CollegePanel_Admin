import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Eye, Download, Printer, RotateCcw, Filter, FileText } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const types = ['All', 'Fee Receipt', 'Income Receipt', 'Refund Receipt', 'Expense Voucher', 'Payment Voucher'];

const Receipts = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterType !== 'All') params.type = filterType;
      if (filterStatus !== 'All') params.status = filterStatus;
      const res = await axiosInstance.get('/fees/receipts', { params });
      setData(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch receipts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterType, filterStatus]);

  const handleCancelReceipt = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/fees/receipts/${selectedReceipt._id || selectedReceipt.id}`, { status: 'Cancelled', cancelReason });
      toast.success('Receipt cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedReceipt(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to cancel receipt');
    }
  };

  const filtered = data.filter(item => {
    const matchesSearch = item.reference?.toLowerCase().includes(search.toLowerCase()) || 
                          item.receiptNo?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || item.type === filterType;
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Receipts & Vouchers</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">View, print, and audit all financial receipts, payment vouchers, and ledger postings</p>
        </div>
        <button onClick={() => toast.success('Exporting registry...')} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export Registry
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by receipt no, reference name..." 
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
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={8} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Receipt No</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Type</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Paid By / Reference</th>
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
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.type}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-medium">{item.reference}</td>
                  <td className="py-4 px-6 text-[13px] font-bold text-gray-900">₹{(item.amount || 0).toLocaleString()}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500">{item.date}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.mode}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      item.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex gap-2">
                    <button onClick={() => toast.success('Printing duplicate...')} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Print Duplicate"><Printer size={15} /></button>
                    {item.status === 'Active' && (
                      <button 
                        onClick={() => { setSelectedReceipt(item); setShowCancelModal(true); }} 
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors" 
                        title="Cancel / Reverse Transaction"
                      >
                        <RotateCcw size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-gray-500 text-[13px]">No receipts found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Cancel Receipt Modal */}
      {showCancelModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Cancel & Reverse Receipt</h3>
              <button onClick={() => { setShowCancelModal(false); setSelectedReceipt(null); }} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleCancelReceipt} className="p-6 space-y-4">
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-[13px] text-red-700 space-y-1">
                <p className="font-bold">⚠️ Warning: Cancel Transaction</p>
                <p>This will flag receipt <strong className="underline">{selectedReceipt.receiptNo}</strong> as cancelled. A reversal entry will be posted to the ledger accounts.</p>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Reason for Cancellation</label>
                <textarea 
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Duplicate collection entry / Check bounced / Wrong student profile selected"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-24 resize-none focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => { setShowCancelModal(false); setSelectedReceipt(null); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Go Back
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[13px] font-semibold"
                >
                  Confirm Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receipts;

