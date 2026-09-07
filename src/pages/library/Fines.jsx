import React, { useState, useEffect } from 'react';
import { 
  Search, Download, Printer, DollarSign, X, 
  CheckCircle, Clock, ShieldAlert, Receipt, CreditCard, Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import { checkPermission } from '../../utils/checkPermission';
import SkeletonLoader from '../../components/SkeletonLoader';
import FineReceiptModal from './components/FineReceiptModal';

const Fines = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedFine, setSelectedFine] = useState(null);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [collectAmount, setCollectAmount] = useState('');
  const [payMode, setPayMode] = useState('Cash');
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Receipt Modal state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptModalData, setReceiptModalData] = useState(null);

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/library/fines');
      setFines(res.data || []);
    } catch (error) {
      toast.error('Failed to load fines');
    } finally {
      setLoading(false);
    }
  };

  // Metrics summary
  const totalLevied = fines.reduce((sum, f) => sum + (Number(f.fineAmount) || 0), 0);
  const totalCollected = fines.reduce((sum, f) => sum + (Number(f.paidAmount) || 0), 0);
  const totalPending = fines.reduce((sum, f) => sum + (Number(f.balance) || 0), 0);
  const waivedCount = fines.filter(f => f.fineStatus === 'Waived').length;

  const filtered = fines.filter(f => {
    const matchesSearch = 
      f.memberName?.toLowerCase().includes(search.toLowerCase()) || 
      f.memberId?.toLowerCase().includes(search.toLowerCase()) || 
      f.txnId?.toLowerCase().includes(search.toLowerCase()) ||
      f.receiptNumber?.toLowerCase().includes(search.toLowerCase()) ||
      f.bookTitle?.toLowerCase().includes(search.toLowerCase());
    
    if (filterStatus === 'All') return matchesSearch;
    if (filterStatus === 'Paid') return matchesSearch && f.fineStatus === 'Paid';
    if (filterStatus === 'Partially Paid') return matchesSearch && f.fineStatus === 'Partially Paid';
    if (filterStatus === 'Unpaid') return matchesSearch && (f.fineStatus === 'Pending' || (!f.fineStatus && f.balance > 0));
    if (filterStatus === 'Waived') return matchesSearch && f.fineStatus === 'Waived';
    
    return matchesSearch;
  });

  const handleCollectFine = async (e) => {
    e.preventDefault();
    if (!selectedFine) return;
    const amount = parseFloat(collectAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid collection amount');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await axiosInstance.post('/library/fines/collect', {
        transactionId: selectedFine.transactionId,
        amount,
        paymentMode: payMode,
        remarks: paymentRemarks
      });
      
      toast.success(`Fine collected successfully for ${selectedFine.memberName}`);
      setShowCollectModal(false);

      if (res.data.receipt) {
        setReceiptModalData(res.data.receipt);
        setShowReceiptModal(true);
      }

      setSelectedFine(null);
      setCollectAmount('');
      setPaymentRemarks('');
      fetchFines();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to collect fine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenReceipt = (item) => {
    setReceiptModalData({
      receiptNumber: item.receiptNumber || `LIB-RCP-${item.txnId || item.transactionId.toString().slice(-6)}`,
      transactionId: item.txnId,
      bookTitle: item.bookTitle,
      accessionNo: item.accessionNo,
      memberName: item.memberName,
      memberId: item.memberId,
      fineAmount: item.fineAmount,
      paidAmount: item.paidAmount,
      balance: item.balance,
      paymentMode: item.paymentMode,
      fineStatus: item.fineStatus,
      paidAt: item.paidAt,
      collectedBy: item.collectedBy,
      dueDate: item.dueDate,
      returnDate: item.returnDate
    });
    setShowReceiptModal(true);
  };

  const handleExport = () => {
    if (fines.length === 0) {
      toast.error('No fine records to export');
      return;
    }

    const exportData = filtered.map(f => ({
      'Receipt No': f.receiptNumber || 'N/A',
      'Transaction ID': f.txnId,
      'Member Name': f.memberName,
      'Member ID': f.memberId,
      'Book Title': f.bookTitle,
      'Total Fine (₹)': f.fineAmount,
      'Paid Amount (₹)': f.paidAmount || 0,
      'Balance Due (₹)': f.balance || 0,
      'Payment Mode': f.paymentMode || 'N/A',
      'Fine Status': f.fineStatus || (f.balance <= 0 ? 'Paid' : 'Pending'),
      'Due Date': f.dueDate ? new Date(f.dueDate).toLocaleDateString() : 'N/A',
      'Return Date': f.returnDate ? new Date(f.returnDate).toLocaleDateString() : 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Library_Fines');
    XLSX.writeFile(workbook, 'Library_Fines_Dues_Report.xlsx');
  };

  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const userRole = adminInfo.role || 'college_admin';
  const canEdit = checkPermission('Return Book') || userRole === 'Librarian' || userRole === 'Principal';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      
      {/* Page Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-bold text-gray-800">Library Fine & Penalty Management</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
              SMART DUES
            </span>
          </div>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">
            Track overdue library delays, collect cash/UPI counter payments, waive penalties, and issue printed slips
          </p>
        </div>
        
        <button 
          onClick={handleExport} 
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Download size={15} /> Export Dues Report
        </button>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6 border-b border-gray-100 bg-gray-50/50">
        <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Levied</p>
          <h3 className="text-xl font-black text-gray-900 mt-0.5">₹{totalLevied}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">{fines.length} total penalty records</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Total Collected</p>
          <h3 className="text-xl font-black text-emerald-600 mt-0.5">₹{totalCollected}</h3>
          <p className="text-[11px] text-emerald-500 mt-0.5 font-medium">Cleared at counter</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
          <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Outstanding Dues</p>
          <h3 className="text-xl font-black text-red-600 mt-0.5">₹{totalPending}</h3>
          <p className="text-[11px] text-red-400 mt-0.5 font-medium">Pending on student ledgers</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
          <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Waived Penalties</p>
          <h3 className="text-xl font-black text-purple-700 mt-0.5">{waivedCount}</h3>
          <p className="text-[11px] text-purple-400 mt-0.5">Authorized medical/holiday waivers</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 flex-wrap items-center">
        <div className="flex-1 min-w-[260px] relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search student name, ID, book title, receipt no..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-1 focus:ring-primary bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={15} className="text-gray-400" />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer w-full sm:w-auto"
          >
            <option value="All">All Fines ({fines.length})</option>
            <option value="Paid">Paid / Cleared</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Unpaid">Unpaid / Pending</option>
            <option value="Waived">Waived / Discounted</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <SkeletonLoader type="table" rows={6} cols={7} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="py-3.5 px-5">Receipt / Txn</th>
                <th className="py-3.5 px-5">Member</th>
                <th className="py-3.5 px-5">Book Title</th>
                <th className="py-3.5 px-5 text-right">Fine Levied</th>
                <th className="py-3.5 px-5 text-right">Paid</th>
                <th className="py-3.5 px-5 text-right">Balance Due</th>
                <th className="py-3.5 px-5">Payment Mode</th>
                <th className="py-3.5 px-5">Fine Status</th>
                <th className="py-3.5 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filtered.map(item => {
                const isCleared = item.fineStatus === 'Paid' || (item.balance <= 0 && item.paidAmount > 0);
                const isPartial = item.fineStatus === 'Partially Paid' || (item.paidAmount > 0 && item.balance > 0);
                const isWaived = item.fineStatus === 'Waived';
                const isPending = !isCleared && !isPartial && !isWaived;

                return (
                  <tr key={item.transactionId} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      {item.receiptNumber ? (
                        <span className="font-mono font-bold text-primary">{item.receiptNumber}</span>
                      ) : (
                        <span className="font-mono text-gray-500">{item.txnId}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-5">
                      <p className="font-bold text-gray-800">{item.memberName}</p>
                      {item.memberId && item.memberId !== 'N/A' && (
                        <p className="text-[10px] font-mono text-gray-400">{item.memberId}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-5">
                      <p className="font-medium text-gray-700 max-w-[200px] truncate" title={item.bookTitle}>
                        {item.bookTitle}
                      </p>
                      {item.accessionNo && item.accessionNo !== 'N/A' && (
                        <p className="text-[10px] font-mono text-gray-400">Acc: {item.accessionNo}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-right font-bold text-gray-800">₹{item.fineAmount}</td>
                    <td className="py-3.5 px-5 text-right font-bold text-emerald-600">₹{item.paidAmount || 0}</td>
                    <td className="py-3.5 px-5 text-right font-black text-red-600">
                      {item.balance > 0 ? `₹${item.balance}` : '₹0'}
                    </td>

                    <td className="py-3.5 px-5">
                      {item.paymentMode && item.paymentMode !== 'None' ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                          {item.paymentMode}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[11px]">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-5">
                      {isWaived ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200">
                          WAIVED
                        </span>
                      ) : isCleared ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle size={11} /> PAID
                        </span>
                      ) : isPartial ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                          PARTIAL
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-red-700 border border-red-200">
                          <Clock size={11} /> UNPAID
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Collect Payment Button */}
                        {canEdit && item.balance > 0 && !isWaived && (
                          <button 
                            onClick={() => { 
                              setSelectedFine(item); 
                              setCollectAmount(item.balance.toString()); 
                              setShowCollectModal(true); 
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm" 
                            title="Collect Payment"
                          >
                            <DollarSign size={13} /> Collect
                          </button>
                        )}

                        {/* Print Receipt Button */}
                        {(item.paidAmount > 0 || item.receiptNumber) && (
                          <button 
                            onClick={() => handleOpenReceipt(item)}
                            className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm" 
                            title="Print / View Receipt Slip"
                          >
                            <Printer size={13} /> Slip
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-400">
                    No matching library fine or dues records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Collect Fine Modal */}
      {showCollectModal && selectedFine && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-['Inter']">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-600" />
                <h3 className="font-bold text-gray-800 text-sm">Collect Library Fine Payment</h3>
              </div>
              <button 
                onClick={() => { setShowCollectModal(false); setSelectedFine(null); }} 
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCollectFine} className="p-6 space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-2xl text-xs text-gray-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Member:</span>
                  <span className="font-bold text-gray-900">{selectedFine.memberName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Book:</span>
                  <span className="font-bold text-gray-900 max-w-[200px] truncate">{selectedFine.bookTitle}</span>
                </div>
                <div className="flex justify-between border-t border-emerald-200/50 pt-1.5 font-bold">
                  <span className="text-gray-600">Pending Balance:</span>
                  <span className="text-red-600 font-mono text-sm">₹{selectedFine.balance}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Collection Amount (₹)</label>
                <input 
                  type="number" 
                  required
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value)}
                  max={selectedFine.balance}
                  min="1"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-[10px] text-gray-400 mt-1">Supports partial or full fine settlement.</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Payment Mode</label>
                <select 
                  value={payMode} 
                  onChange={(e) => setPayMode(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Cash">Cash at Counter</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Remarks / Transaction Note</label>
                <input
                  type="text"
                  placeholder="Optional reference note..."
                  value={paymentRemarks}
                  onChange={(e) => setPaymentRemarks(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={() => { setShowCollectModal(false); setSelectedFine(null); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:bg-gray-400 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle size={14} /> {isSubmitting ? 'Recording...' : `Collect ₹${collectAmount || selectedFine.balance}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {showReceiptModal && (
        <FineReceiptModal
          receipt={receiptModalData}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

    </div>
  );
};

export default Fines;
