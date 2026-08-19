import React, { useState, useEffect } from 'react';
import { Search, Download, Printer, DollarSign, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import { checkPermission } from '../../utils/checkPermission';
import SkeletonLoader from '../../components/SkeletonLoader';

const Fines = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedFine, setSelectedFine] = useState(null);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [collectAmount, setCollectAmount] = useState('');
  const [payMode, setPayMode] = useState('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/library/fines');
      setFines(res.data);
    } catch (error) {
      toast.error('Failed to load fines');
    } finally {
      setLoading(false);
    }
  };

  const filtered = fines.filter(f => {
    const matchesSearch = f.memberName?.toLowerCase().includes(search.toLowerCase()) || 
                          f.txnId?.toLowerCase().includes(search.toLowerCase()) ||
                          f.bookTitle?.toLowerCase().includes(search.toLowerCase());
    
    // Status in db is for transaction, but for fine we check balance
    let status = f.balance > 0 ? 'Unpaid' : 'Paid';
    const matchesStatus = filterStatus === 'All' || status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleCollectFine = async (e) => {
    e.preventDefault();
    if (!selectedFine) return;
    const amount = parseFloat(collectAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosInstance.post('/library/fines/collect', {
        transactionId: selectedFine.transactionId,
        amount
      });
      toast.success(`Fine collected successfully for ${selectedFine.memberName}`);
      setShowCollectModal(false);
      setSelectedFine(null);
      setCollectAmount('');
      fetchFines();
    } catch (error) {
      toast.error('Failed to collect fine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    if (fines.length === 0) {
      toast.error('No fine records to export');
      return;
    }

    const exportData = filtered.map(f => ({
      'Transaction ID': f.txnId,
      'Member Name': f.memberName,
      'Book Reference': f.bookTitle,
      'Total Fine Payable (₹)': f.fineAmount,
      'Amount Collected (₹)': f.paidAmount || 0,
      'Balance Due (₹)': f.balance || 0,
      'Status': f.balance <= 0 ? 'Paid' : 'Unpaid'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fines');
    XLSX.writeFile(workbook, 'Library_Fines_Report.xlsx');
  };

  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const userRole = adminInfo.role || 'college_admin';
  const canEdit = checkPermission('Return Book') || userRole === 'Librarian' || userRole === 'Principal';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Fine Management</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Auto-calculate library delay penalties, record collections, and issue receipts</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export Dues
        </button>
      </div>

      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by student name, book, or transaction no..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="All">All Transactions</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={5} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Txn ID</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Member</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Book Reference</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Fine (Payable)</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Collected (Paid)</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Balance</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.transactionId} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-primary">{item.txnId}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.memberName}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.bookTitle}</td>
                  <td className="py-4 px-6 text-[13px] text-right font-bold text-gray-900">₹{item.fineAmount}</td>
                  <td className="py-4 px-6 text-[13px] text-right font-semibold text-green-600">₹{item.paidAmount || 0}</td>
                  <td className="py-4 px-6 text-[13px] text-right font-bold text-red-500">₹{item.balance || 0}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      item.balance <= 0 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {item.balance <= 0 ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex gap-2">
                    {canEdit && item.balance > 0 && (
                      <button 
                        onClick={() => { setSelectedFine(item); setCollectAmount(item.balance); setShowCollectModal(true); }}
                        className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors" 
                        title="Collect Fine"
                      >
                        <DollarSign size={15} />
                      </button>
                    )}
                    {item.balance <= 0 && (
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Print Fine Receipt"><Printer size={15} /></button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-gray-500">No fines found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showCollectModal && selectedFine && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Collect Library Fine</h3>
              <button onClick={() => { setShowCollectModal(false); setSelectedFine(null); }} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleCollectFine} className="p-6 space-y-4">
              <div className="bg-primary/5 p-4 rounded-xl text-[13px] text-gray-700 space-y-1">
                <p><span className="text-gray-500">Member:</span> <strong>{selectedFine.memberName}</strong></p>
                <p><span className="text-gray-500">Total Pending:</span> <strong className="text-red-500">₹{selectedFine.balance}</strong></p>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Collection Amount (₹)</label>
                <input 
                  type="number" 
                  required
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value)}
                  max={selectedFine.balance}
                  min="1"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Payment Mode</label>
                <select 
                  value={payMode} 
                  onChange={(e) => setPayMode(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => { setShowCollectModal(false); setSelectedFine(null); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold disabled:bg-gray-400"
                >
                  {isSubmitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fines;
