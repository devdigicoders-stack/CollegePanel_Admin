import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Eye, Download, Printer, RotateCcw, Filter, FileText, X } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const types = ['All', 'Fee Receipt', 'Income Receipt', 'Refund Receipt', 'Expense Voucher', 'Payment Voucher'];

const Receipts = () => {
  if (!checkPermission('Generate Receipt') && !checkPermission('View Fees')) {
    return <AccessDenied />;
  }
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [printData, setPrintData] = useState(null);
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
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter'] ${printData ? 'print:hidden' : ''}`}>
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
                  <td className="py-4 px-6 text-[13px] text-gray-500">{new Date(item.date).toLocaleDateString('en-GB')}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.mode}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      item.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex items-center gap-2">
                    <button onClick={() => setPrintData(item)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Print"><Printer size={15} /></button>
                    {(item.status === 'Active' || item.status === 'Completed') && (
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

      {/* Awesome Printable Receipt Modal */}
      {printData && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 sm:p-6 print:static print:bg-transparent print:p-0 print:block">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden print:shadow-none print:max-h-none print:w-full print:overflow-visible">
            
            {/* Action Bar (Hidden on Print) */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 px-6 flex items-center justify-between print:hidden z-10">
              <h3 className="font-bold text-gray-800 text-[15px]">{printData.type || 'Fee Receipt'}</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors">
                  <Printer size={16}/> Print
                </button>
                <button onClick={() => setPrintData(null)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="p-8 sm:p-12 print:p-0 bg-white" id="printable-receipt">
              <div className="border border-gray-200 rounded-2xl p-8 sm:p-10 print:border-none print:p-0">
                
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#0A6C54] tracking-tight">DIGITAL COLLEGE</h1>
                    <p className="text-[13px] text-gray-500 mt-2 font-medium">123 Education Lane, Tech City, 10001</p>
                    <p className="text-[13px] text-gray-500 mt-0.5 font-medium">Phone: +1 234 567 8900 | Email: accounts@college.edu</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-wider uppercase">{printData.type || 'FEE RECEIPT'}</h2>
                    <p className="text-[13px] font-semibold text-gray-600 mt-3">Receipt No: <span className="text-gray-900 font-bold">{printData.receiptNo}</span></p>
                    <p className="text-[13px] font-semibold text-gray-500 mt-0.5">Date: <span className="text-gray-800">{new Date(printData.date).toLocaleDateString('en-GB')}</span></p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 print:bg-transparent print:border-none print:p-0">
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">{printData.type === 'Fee Receipt' ? 'Student Details' : 'Reference Details'}</p>
                    <p className="font-bold text-gray-900 text-[16px]">{printData.reference.split('(')[0]}</p>
                    {printData.reference.includes('(') && <p className="text-[13px] text-gray-600 mt-1">ID: <span className="font-semibold text-gray-800">{printData.reference.split('(')[1].replace(')','')}</span></p>}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 print:bg-transparent print:border-none print:p-0 text-right">
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">Payment Details</p>
                    <p className="text-[13px] text-gray-600">Payment Mode: <span className="font-semibold text-gray-800">{printData.mode}</span></p>
                    <p className="text-[13px] text-gray-600 mt-1">Status: <span className={`font-bold ${printData.status === 'Cancelled' ? 'text-red-600' : 'text-green-600'}`}>{printData.status}</span></p>
                  </div>
                </div>

                {/* Amount Table */}
                <table className="w-full mb-10">
                  <thead>
                    <tr className="bg-gray-50 border-y border-gray-200">
                      <th className="py-3 px-4 text-left text-[13px] font-bold text-gray-800">Description</th>
                      <th className="py-3 px-4 text-right text-[13px] font-bold text-gray-800">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 text-[14px] font-medium text-gray-700">{printData.remarks || printData.type || 'Fee Payment'}</td>
                      <td className="py-4 px-4 text-[14px] font-bold text-gray-900 text-right">₹{(printData.amount || 0).toLocaleString()}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td className="py-4 px-4 text-right font-bold text-gray-800 text-[14px]">Total Amount {printData.type === 'Refund Receipt' ? 'Refunded' : 'Received'}</td>
                      <td className="py-4 px-4 text-right font-black text-xl text-[#0A6C54]">₹{(printData.amount || 0).toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>

                {/* Footer Signatures */}
                <div className="flex justify-between items-end mt-16 pt-8 border-t border-gray-200">
                  <div className="max-w-[60%]">
                    <p className="text-[11px] text-gray-500 italic">This is a computer generated receipt and does not require a physical signature.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-40 border-b-2 border-gray-400 mb-2"></div>
                    <p className="text-[13px] font-bold text-gray-700">Authorized Signatory</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receipts;

