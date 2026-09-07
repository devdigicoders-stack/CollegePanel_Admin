import { useState, useEffect } from 'react';
import { 
  Search, CheckCircle, RotateCcw, Barcode,
  DollarSign, Clock, ShieldAlert, Receipt, ShieldCheck} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import FineReceiptModal from './components/FineReceiptModal';

const IssueReturn = () => {
  if (!checkPermission('Issue Book') && !checkPermission('Return Book')) {
    return <AccessDenied />;
  }
  const [activeTab, setActiveTab] = useState('Issue');
  const [memberSearch, setMemberSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const [returnBarcode, setReturnBarcode] = useState('');
  const [returnDetails, setReturnDetails] = useState(null); // Will hold the active transaction
  const [bookCondition, setBookCondition] = useState('Good');
  const [returnRemarks, setReturnRemarks] = useState('');

  // Fine settlement state
  const [fineAction, setFineAction] = useState('collect_now'); // 'collect_now' | 'pay_later' | 'waive' | 'none'
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [waivedReason, setWaivedReason] = useState('Medical Leave');
  const [customWaiveNote, setCustomWaiveNote] = useState('');

  // Receipt modal state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptModalData, setReceiptModalData] = useState(null);
  
  const [issueData, setIssueData] = useState({
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    remarks: '',
    borrowType: 'Standard'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeIssuedList, setActiveIssuedList] = useState([]);
  const [loadingActiveIssues, setLoadingActiveIssues] = useState(false);

  const fetchActiveIssues = async () => {
    try {
      setLoadingActiveIssues(true);
      const res = await axiosInstance.get('/library/transactions?status=active');
      setActiveIssuedList(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Error loading active issues:', e);
    } finally {
      setLoadingActiveIssues(false);
    }
  };

  useEffect(() => {
    fetchActiveIssues();
  }, [activeTab]);

  useEffect(() => {
    let days = 14;
    if (issueData.borrowType === 'Reference Only') days = 0;
    else if (issueData.borrowType === 'Book Bank') days = 120;
    
    setIssueData(prev => ({
      ...prev,
      dueDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));
  }, [issueData.borrowType]);

  const handleMemberSearch = async (e) => {
    e.preventDefault();
    if(!memberSearch) return;
    try {
      const res = await axiosInstance.get(`/library/members?search=${memberSearch}`);
      const members = res.data.members || [];
      if (members.length > 0) {
        setSelectedMember(members[0]);
        setMemberSearch('');
        toast.success('Member found');
      } else {
        toast.error('Member not found!');
        setSelectedMember(null);
      }
    } catch(err) {
      toast.error('Error searching member');
    }
  };

  const handleBookSearch = async (e) => {
    e.preventDefault();
    if(!bookSearch) return;
    try {
      const res = await axiosInstance.get(`/library/books?search=${bookSearch}`);
      const books = res.data.books || [];
      if (books.length > 0) {
        setSelectedBook(books[0]);
        setBookSearch('');
        toast.success('Book found');
      } else {
        toast.error('Book not found!');
        setSelectedBook(null);
      }
    } catch(err) {
      toast.error('Error searching book');
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    if(!selectedMember || !selectedBook) return;
    
    try {
      setIsSubmitting(true);
      await axiosInstance.post('/library/issue', {
        bookId: selectedBook._id,
        memberId: selectedMember._id,
        memberType: selectedMember.type,
        borrowType: issueData.borrowType,
        dueDate: issueData.dueDate,
        remarks: issueData.remarks
      });
      toast.success(`Book "${selectedBook.title}" issued to ${selectedMember.name}`);
      fetchActiveIssues();
      setSelectedMember(null);
      setSelectedBook(null);
      setIssueData({
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        remarks: '',
        borrowType: 'Standard'
      });
    } catch(err) {
      toast.error(err.response?.data?.message || 'Error issuing book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectTransactionForReturn = (t) => {
    const today = new Date();
    const due = new Date(t.dueDate);
    let lateDays = 0;
    let fine = 0;
    if (today > due) {
      lateDays = Math.floor((today - due) / (1000 * 60 * 60 * 24));
      fine = lateDays * 10; // Rs 10 per day late
    }

    setReturnDetails({
      transactionId: t._id,
      bookId: t.bookId?._id,
      title: t.bookId?.title || 'Unknown',
      accessionNo: t.bookId?.accessionNo || returnBarcode || 'N/A',
      borrower: t.studentId?.studentName || (t.studentId?.firstName ? `${t.studentId.firstName} ${t.studentId.lastName || ''}`.trim() : t.memberName) || 'Student',
      issueDate: new Date(t.issueDate).toLocaleDateString(),
      dueDate: new Date(t.dueDate).toLocaleDateString(),
      lateDays,
      fine
    });

    if (fine > 0) {
      setFineAction('collect_now');
      setPaidAmount(fine.toString());
      setPaymentMode('Cash');
      setWaivedReason('Medical Leave');
      setCustomWaiveNote('');
    } else {
      setFineAction('none');
      setPaidAmount('0');
    }
  };

  const handleReturnScan = async (e) => {
    e.preventDefault();
    if(!returnBarcode) return;
    try {
      // Find active transaction for this book accession number or transaction ID
      const res = await axiosInstance.get(`/library/transactions?search=${returnBarcode}&status=active`);
      const transactions = res.data;
      if (transactions.length > 0) {
        selectTransactionForReturn(transactions[0]);
        setReturnBarcode('');
        toast.success('Active issue record found');
      } else {
        toast.error('No active issue record found for this barcode!');
        setReturnDetails(null);
      }
    } catch (err) {
      toast.error('Error fetching transaction');
    }
  };

  const handleCompleteReturn = async () => {
    if (!returnDetails) return;
    try {
      setIsSubmitting(true);
      
      const isFineApplicable = returnDetails.fine > 0;
      const payload = {
        transactionId: returnDetails.transactionId,
        condition: bookCondition,
        fineAmount: returnDetails.fine,
        fineAction: isFineApplicable ? fineAction : 'none',
        paidAmount: isFineApplicable && fineAction === 'collect_now' ? (parseFloat(paidAmount) || returnDetails.fine) : 0,
        paymentMode: isFineApplicable && fineAction === 'collect_now' ? paymentMode : isFineApplicable && fineAction === 'waive' ? 'Waived' : 'None',
        waivedReason: isFineApplicable && fineAction === 'waive' ? (customWaiveNote ? `${waivedReason}: ${customWaiveNote}` : waivedReason) : undefined,
        remarks: returnRemarks || `Returned in ${bookCondition} condition`
      };

      const res = await axiosInstance.post('/library/return', payload);
      
      if (res.data.receipt) {
        setReceiptModalData(res.data.receipt);
        setShowReceiptModal(true);
        toast.success('Book returned & fine collected! Receipt generated.');
      } else if (fineAction === 'waive') {
        toast.success('Book returned successfully with fine waived.');
      } else if (fineAction === 'pay_later') {
        toast.success(`Book returned. ₹${returnDetails.fine} posted as pending due on student ledger.`);
      } else {
        toast.success(`Book ${returnDetails.title} returned successfully.`);
      }

      setReturnDetails(null);
      setBookCondition('Good');
      setReturnRemarks('');
      fetchActiveIssues();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return book');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="flex border-b border-gray-100 px-6 pt-2">
        {['Issue', 'Return'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSelectedMember(null);
              setSelectedBook(null);
              setReturnDetails(null);
            }}
            className={`px-6 py-4 text-[14px] font-semibold relative ${
              activeTab === tab ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab} Book
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-md"></div>}
          </button>
        ))}
      </div>

      {activeTab === 'Issue' ? (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto">
          <div className="space-y-6">
            <div className="border border-gray-100 p-5 rounded-xl bg-gray-50/50 space-y-4">
              <h3 className="font-bold text-gray-800 text-[14px]">1. Identify Member</h3>
              <form onSubmit={handleMemberSearch} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Scan Member Barcode / Roll No..." 
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="flex-1 p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                />
                <button type="submit" className="bg-primary text-white px-4 py-2.5 rounded-lg text-[13px] font-bold flex items-center gap-1">
                  <Search size={15} /> Find
                </button>
              </form>

              {selectedMember && (
                <div className="bg-white p-3.5 rounded-lg border border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[13px] text-gray-800">{selectedMember.name}</h4>
                    <p className="text-[12px] text-gray-500">{selectedMember.type} • {selectedMember.code}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 font-bold text-[11px] rounded-full border border-green-200">Verified</span>
                </div>
              )}
            </div>

            <div className="border border-gray-100 p-5 rounded-xl bg-gray-50/50 space-y-4">
              <h3 className="font-bold text-gray-800 text-[14px]">2. Identify Book</h3>
              <form onSubmit={handleBookSearch} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Scan Book Barcode / Accession No..." 
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="flex-1 p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                />
                <button type="submit" className="bg-primary text-white px-4 py-2.5 rounded-lg text-[13px] font-bold flex items-center gap-1">
                  <Search size={15} /> Find
                </button>
              </form>

              {selectedBook && (
                <div className="bg-white p-3.5 rounded-lg border border-gray-100 space-y-1 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Title:</span>
                    <span className="font-bold text-gray-800">{selectedBook.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Accession No:</span>
                    <span className="font-semibold text-gray-800">{selectedBook.accessionNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Copies Available:</span>
                    <span className={`font-semibold ${selectedBook.availableCopies > 0 ? 'text-green-600' : 'text-red-500'}`}>{selectedBook.availableCopies}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border border-gray-100 p-6 rounded-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-[14px] pb-2 border-b border-gray-100">Issue Confirmation</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Issue Date</label>
                  <input type="date" disabled className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] bg-gray-50" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Due Date</label>
                  <input type="date" value={issueData.dueDate} onChange={e => setIssueData({...issueData, dueDate: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Borrow Type</label>
                <select value={issueData.borrowType} onChange={e => setIssueData({...issueData, borrowType: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]">
                  <option value="Standard">Standard (14 Days Renewal)</option>
                  <option value="Reference Only">Reference Only (Not to be Taken Out)</option>
                  <option value="Book Bank">Book Bank Scheme (Semester Long)</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Remarks</label>
                <textarea value={issueData.remarks} onChange={e => setIssueData({...issueData, remarks: e.target.value})} placeholder="e.g. Issued with minor wear on cover" className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-20 resize-none"></textarea>
              </div>
            </div>

            <button 
              onClick={handleIssueBook}
              disabled={!selectedMember || !selectedBook || isSubmitting}
              className={`w-full py-3 rounded-lg text-[13px] font-bold text-white transition-colors ${
                selectedMember && selectedBook && !isSubmitting ? 'bg-primary hover:bg-primary-hover' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Issuing...' : 'Issue Book Copies'}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto">
          <div className="border border-gray-100 p-5 rounded-xl bg-gray-50/50 space-y-4">
            <h3 className="font-bold text-gray-800 text-[14px]">Scan Book Barcode for Return</h3>
            <form onSubmit={handleReturnScan} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Scan / Type Accession Number or TXN ID..." 
                value={returnBarcode}
                onChange={(e) => setReturnBarcode(e.target.value)}
                className="flex-1 p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary bg-white"
              />
              <button type="submit" className="bg-primary text-white px-4 py-2.5 rounded-lg text-[13px] font-bold flex items-center gap-1">
                <Barcode size={15} /> Scan
              </button>
            </form>

            {returnDetails && (
              <div className="bg-white p-4 rounded-xl border border-gray-100 text-[13px] space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Book Returned:</span>
                  <span className="font-bold text-gray-800">{returnDetails.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Accession No:</span>
                  <span className="font-semibold text-gray-800 font-mono">{returnDetails.accessionNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Issued To:</span>
                  <span className="font-semibold text-gray-800">{returnDetails.borrower}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Issue Date:</span>
                  <span className="text-gray-600">{returnDetails.issueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Due Date:</span>
                  <span className="text-gray-600">{returnDetails.dueDate}</span>
                </div>

                {returnDetails.lateDays > 0 ? (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-200 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-red-700">Overdue Delay:</span>
                      <span className="font-black text-red-700">{returnDetails.lateDays} Days</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-red-700">Late Penalty (@ ₹10/day):</span>
                      <span className="font-black text-red-800 text-sm">₹{returnDetails.fine}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                    <CheckCircle size={14} /> Returned on or before due date. No late fine.
                  </div>
                )}
              </div>
            )}

            {/* Quick-Select Currently Issued Books */}
            <div className="pt-3 border-t border-gray-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-[12px] font-bold text-gray-700 flex items-center gap-1.5">
                  <RotateCcw size={13} className="text-primary" /> Currently Issued Books ({activeIssuedList.length})
                </h4>
                <span className="text-[11px] text-gray-400">Click to select for return</span>
              </div>

              {loadingActiveIssues ? (
                <div className="text-xs text-gray-400 py-3 text-center">Loading issued records...</div>
              ) : activeIssuedList.length === 0 ? (
                <div className="text-xs text-gray-400 py-3 text-center bg-white rounded-lg border border-dashed border-gray-200">
                  No active issued books found
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {activeIssuedList.map((t) => {
                    const isSelected = returnDetails?.transactionId === t._id;
                    const today = new Date();
                    const due = new Date(t.dueDate);
                    const isOverdue = today > due;
                    const lateDays = isOverdue ? Math.floor((today - due) / (1000 * 60 * 60 * 24)) : 0;
                    const estFine = lateDays * 10;

                    return (
                      <div
                        key={t._id}
                        onClick={() => selectTransactionForReturn(t)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-1.5 ${
                          isSelected
                            ? 'bg-primary/5 border-primary shadow-sm'
                            : 'bg-white border-gray-200 hover:border-primary/50 hover:bg-gray-50/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-gray-800 text-[13px] line-clamp-1">
                              {t.bookId?.title || 'Unknown Title'}
                            </span>
                            <span className="text-[11px] font-mono text-gray-500">
                              Acc: {t.bookId?.accessionNo || 'N/A'} • {t.transactionId}
                            </span>
                          </div>
                          {isOverdue ? (
                            <span className="px-2 py-0.5 rounded-md font-black text-[10px] bg-red-100 text-red-700 whitespace-nowrap">
                              {lateDays}d Late (₹{estFine})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-100 text-emerald-700 whitespace-nowrap">
                              Active
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-600 pt-1 border-t border-gray-100">
                          <span className="font-medium text-gray-700">
                            👤 {t.studentId?.studentName || (t.studentId?.firstName ? `${t.studentId.firstName} ${t.studentId.lastName || ''}`.trim() : t.memberName) || 'Student'}
                          </span>
                          <span className="text-gray-400">
                            Due: {new Date(t.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="border border-gray-100 p-6 rounded-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-[14px] pb-2 border-b border-gray-100">Return & Settlement</h3>
              
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Returned Copy Condition</label>
                <select 
                  value={bookCondition} 
                  onChange={(e) => setBookCondition(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                >
                  <option value="Good">Good / Undamaged</option>
                  <option value="Minor Damage">Minor Damage (Needs Repair)</option>
                  <option value="Severe Damage">Severely Damaged (Lost Book Fine to apply)</option>
                  <option value="Missing Pages">Pages Missing (Requires replacement/penalty)</option>
                </select>
              </div>

              {/* Fine Settlement Panel (Only if fine is applicable) */}
              {returnDetails && returnDetails.fine > 0 && (
                <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                      <DollarSign size={16} className="text-amber-600" />
                      Fine Settlement Option
                    </div>
                    <span className="text-xs font-black text-amber-800">Total: ₹{returnDetails.fine}</span>
                  </div>

                  {/* 3 Settlement Tabs */}
                  <div className="grid grid-cols-3 gap-1.5 bg-white p-1 rounded-xl border border-amber-200/80">
                    <button
                      type="button"
                      onClick={() => setFineAction('collect_now')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                        fineAction === 'collect_now'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <CheckCircle size={12} /> Collect Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setFineAction('pay_later')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                        fineAction === 'pay_later'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Clock size={12} /> Add to Dues
                    </button>
                    <button
                      type="button"
                      onClick={() => setFineAction('waive')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                        fineAction === 'waive'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ShieldAlert size={12} /> Waive Fine
                    </button>
                  </div>

                  {/* Option 1 Details: Collect Now */}
                  {fineAction === 'collect_now' && (
                    <div className="space-y-2.5 pt-1 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">Amount to Collect (₹)</label>
                          <input
                            type="number"
                            min="1"
                            max={returnDetails.fine}
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            className="w-full p-2 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-900 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">Payment Mode</label>
                          <select
                            value={paymentMode}
                            onChange={(e) => setPaymentMode(e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white font-medium"
                          >
                            <option value="Cash">Cash at Counter</option>
                            <option value="UPI">UPI / QR Payment</option>
                            <option value="Card">Debit / Credit Card</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-[10px] text-emerald-700 font-medium">
                        ✓ Fine will be recorded as cleared and printable receipt slip will be generated.
                      </p>
                    </div>
                  )}

                  {/* Option 2 Details: Add to Dues */}
                  {fineAction === 'pay_later' && (
                    <div className="p-2.5 bg-amber-100/60 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
                      <p className="font-bold">Pending Dues Notice:</p>
                      <p className="text-[11px] text-amber-800">
                        Book will be returned to shelf, but ₹{returnDetails.fine} will remain as pending balance on student's record and Fines dashboard.
                      </p>
                    </div>
                  )}

                  {/* Option 3 Details: Waive Fine */}
                  {fineAction === 'waive' && (
                    <div className="space-y-2 pt-1 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">Waiver Reason</label>
                        <select
                          value={waivedReason}
                          onChange={(e) => setWaivedReason(e.target.value)}
                          className="w-full p-2 border border-purple-200 rounded-lg text-xs bg-white"
                        >
                          <option value="Medical Leave">Medical Leave / Illness</option>
                          <option value="Principal Approved">Principal / Management Approval</option>
                          <option value="College Holiday / Emergency">College Closed / Emergency Holidays</option>
                          <option value="Special Discretion">Librarian Discretion</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        placeholder="Additional waiver remarks / approval ref..."
                        value={customWaiveNote}
                        onChange={(e) => setCustomWaiveNote(e.target.value)}
                        className="w-full p-2 border border-purple-200 rounded-lg text-xs bg-white"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Remarks</label>
                <textarea 
                  value={returnRemarks}
                  onChange={(e) => setReturnRemarks(e.target.value)}
                  placeholder="Write any physical damages or exceptions here..." 
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-20 resize-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="button"
                onClick={handleCompleteReturn}
                disabled={!returnDetails || isSubmitting}
                className={`w-full py-3.5 rounded-xl text-[13px] font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                  returnDetails && !isSubmitting
                    ? fineAction === 'collect_now' && returnDetails.fine > 0
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : fineAction === 'waive' && returnDetails.fine > 0
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : fineAction === 'pay_later' && returnDetails.fine > 0
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-primary hover:bg-primary-hover'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  'Processing Return...'
                ) : returnDetails?.fine > 0 ? (
                  fineAction === 'collect_now' ? (
                    <>
                      <Receipt size={16} /> Return Book & Collect ₹{paidAmount || returnDetails.fine}
                    </>
                  ) : fineAction === 'waive' ? (
                    <>
                      <ShieldCheck size={16} /> Return Book & Waive Fine
                    </>
                  ) : (
                    <>
                      <Clock size={16} /> Return Book & Post Due (₹{returnDetails.fine})
                    </>
                  )
                ) : (
                  'Complete Book Return'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Slip Modal */}
      {showReceiptModal && (
        <FineReceiptModal
          receipt={receiptModalData}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
};

export default IssueReturn;
