const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, FileText, CheckCircle, RotateCcw, Barcode } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const IssueReturn = () => {
  const [activeTab, setActiveTab] = useState('Issue');
  const [memberSearch, setMemberSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const [returnBarcode, setReturnBarcode] = useState('');
  const [returnDetails, setReturnDetails] = useState(null); // Will hold the active transaction
  const [bookCondition, setBookCondition] = useState('Good');
  
  const [issueData, setIssueData] = useState({
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    remarks: '',
    borrowType: 'Standard'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMemberSearch = async (e) => {
    e.preventDefault();
    if(!memberSearch) return;
    try {
      const res = await axiosInstance.get(\`/library/members?search=\${memberSearch}\`);
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
      const res = await axiosInstance.get(\`/library/books?search=\${bookSearch}\`);
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
    if (!selectedMember || !selectedBook) return;

    if (selectedMember.status !== 'Active') {
      toast.error('Cannot issue: Member account is inactive!');
      return;
    }
    if (selectedMember.issuedCount >= 5) {
      toast.error('Cannot issue: Member has reached borrowing limit (5 books)!');
      return;
    }
    if (selectedMember.fine > 100) {
      toast.warning('Member has high unpaid fines. Collect fine first.');
    }
    if (selectedBook.availableCopies <= 0) {
      toast.error('Cannot issue: No copies available!');
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosInstance.post('/library/issue', {
        bookId: selectedBook._id,
        memberId: selectedMember._id,
        dueDate: issueData.dueDate,
        remarks: issueData.remarks
      });
      toast.success(\`Book issued successfully to \${selectedMember.name}!\`);
      setSelectedMember(null);
      setSelectedBook(null);
      setIssueData({ ...issueData, remarks: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnScan = async (e) => {
    e.preventDefault();
    if(!returnBarcode) return;
    try {
      // Find active transaction for this book accession number or transaction ID
      const res = await axiosInstance.get(\`/library/transactions?search=\${returnBarcode}&status=Issued\`);
      const transactions = res.data;
      if (transactions.length > 0) {
        const t = transactions[0];
        
        // Calculate late fine
        const today = new Date();
        const due = new Date(t.dueDate);
        let lateDays = 0;
        let fine = 0;
        if(today > due) {
          lateDays = Math.floor((today - due) / (1000 * 60 * 60 * 24));
          fine = lateDays * 10; // Rs 10 per day late
        }
        
        setReturnDetails({
          transactionId: t._id,
          bookId: t.bookId?._id,
          title: t.bookId?.title || 'Unknown',
          accessionNo: t.bookId?.accessionNo || returnBarcode,
          borrower: t.studentId?.firstName ? \`\${t.studentId.firstName} \${t.studentId.lastName || ''}\` : t.memberName,
          issueDate: new Date(t.issueDate).toLocaleDateString(),
          dueDate: new Date(t.dueDate).toLocaleDateString(),
          lateDays,
          fine
        });
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
    try {
      setIsSubmitting(true);
      await axiosInstance.post('/library/return', {
        transactionId: returnDetails.transactionId,
        condition: bookCondition,
        fineAmount: returnDetails.fine,
        remarks: \`Returned in \${bookCondition} condition\`
      });
      toast.success(\`Book \${returnDetails.title} returned successfully.\${returnDetails.fine > 0 ? ' Fine posted.' : ''}\`);
      setReturnDetails(null);
      setBookCondition('Good');
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
            className={\`px-6 py-4 text-[14px] font-semibold relative \${
              activeTab === tab ? 'text-[#0A6C54]' : 'text-gray-500 hover:text-gray-700'
            }\`}
          >
            {tab} Book
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-md"></div>}
          </button>
        ))}
      </div>

      {activeTab === 'Issue' ? (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto">
          <div className="space-y-6">
            <div className="border border-gray-100 p-5 rounded-xl bg-gray-50/50 space-y-4">
              <h3 className="font-bold text-gray-800 text-[14px]">1. Scan / Search Member</h3>
              <form onSubmit={handleMemberSearch} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter Member Name or Enrollment No..." 
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="flex-1 p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] bg-white"
                />
                <button type="submit" className="bg-[#0A6C54] text-white px-4 py-2.5 rounded-lg text-[13px] font-bold">Search</button>
              </form>

              {selectedMember && (
                <div className="bg-white p-4 rounded-lg border border-gray-100 text-[13px] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Borrower:</span>
                    <span className="font-semibold text-gray-800">{selectedMember.name} ({selectedMember.type})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Library Card Status:</span>
                    <span className={\`font-semibold \${selectedMember.status === 'Active' ? 'text-green-600' : 'text-red-500'}\`}>{selectedMember.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Books Currently Issued:</span>
                    <span className="font-semibold text-gray-800">{selectedMember.issuedCount} / 5 limit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pending Fines:</span>
                    <span className="font-bold text-red-500">₹{selectedMember.fine}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="border border-gray-100 p-5 rounded-xl bg-gray-50/50 space-y-4">
              <h3 className="font-bold text-gray-800 text-[14px]">2. Scan / Search Book</h3>
              <form onSubmit={handleBookSearch} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter Accession No or Title..." 
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="flex-1 p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] bg-white"
                />
                <button type="submit" className="bg-[#0A6C54] text-white px-4 py-2.5 rounded-lg text-[13px] font-bold">Search</button>
              </form>

              {selectedBook && (
                <div className="bg-white p-4 rounded-lg border border-gray-100 text-[13px] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Title:</span>
                    <span className="font-semibold text-gray-800">{selectedBook.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Author:</span>
                    <span className="text-gray-600">{selectedBook.author}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Accession Code:</span>
                    <span className="font-semibold text-gray-700">{selectedBook.accessionNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Copies Available:</span>
                    <span className={\`font-semibold \${selectedBook.availableCopies > 0 ? 'text-green-600' : 'text-red-500'}\`}>{selectedBook.availableCopies}</span>
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
              className={\`w-full py-3 rounded-lg text-[13px] font-bold text-white transition-colors \${
                selectedMember && selectedBook && !isSubmitting ? 'bg-[#0A6C54] hover:bg-[#085a46]' : 'bg-gray-300 cursor-not-allowed'
              }\`}
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
                className="flex-1 p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] bg-white"
              />
              <button type="submit" className="bg-[#0A6C54] text-white px-4 py-2.5 rounded-lg text-[13px] font-bold flex items-center gap-1">
                <Barcode size={15} /> Scan
              </button>
            </form>

            {returnDetails && (
              <div className="bg-white p-4 rounded-lg border border-gray-100 text-[13px] space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Book Returned:</span>
                  <span className="font-bold text-gray-800">{returnDetails.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Accession No:</span>
                  <span className="font-semibold text-gray-800">{returnDetails.accessionNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Issued To:</span>
                  <span className="font-semibold text-gray-800">{returnDetails.borrower}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Due Date:</span>
                  <span className="text-gray-600">{returnDetails.dueDate}</span>
                </div>
                {returnDetails.lateDays > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Late Return Delay:</span>
                      <span className="font-bold text-red-600">{returnDetails.lateDays} Days Overdue</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Calculated Late Fine:</span>
                      <span className="font-bold text-red-600">₹{returnDetails.fine}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="border border-gray-100 p-6 rounded-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-[14px] pb-2 border-b border-gray-100">Return Details</h3>
              
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

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Remarks</label>
                <textarea placeholder="Write any physical damages or exceptions here..." className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-24 resize-none"></textarea>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                type="button"
                onClick={handleCompleteReturn}
                disabled={!returnDetails || isSubmitting}
                className={\`w-full py-3 rounded-lg text-[13px] font-bold text-white transition-colors \${
                  returnDetails && !isSubmitting ? 'bg-[#0A6C54] hover:bg-[#085a46]' : 'bg-gray-300 cursor-not-allowed'
                }\`}
              >
                {isSubmitting ? 'Processing...' : 'Post Book Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueReturn;
`;

fs.writeFileSync('d:/Desktop/DCT_CLG_CRM/admin/src/pages/library/IssueReturn.jsx', content, 'utf-8');
console.log("Rewrote IssueReturn.jsx");
