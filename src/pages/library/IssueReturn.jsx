import React, { useState } from 'react';
import { Search, Plus, Calendar, FileText, CheckCircle, RotateCcw, Barcode } from 'lucide-react';
import toast from 'react-hot-toast';

const IssueReturn = () => {
  const [activeTab, setActiveTab] = useState('Issue');
  const [memberSearch, setMemberSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const [returnBarcode, setReturnBarcode] = useState('');
  const [returnDetails, setReturnDetails] = useState(null);
  const [bookCondition, setBookCondition] = useState('Good');

  // Static reference data for validation/lookup
  const members = [
    { id: 1, memberId: 'LIB-S-101', name: 'Amit Sharma', type: 'Student', status: 'Active', issuedCount: 2, fine: 50 },
    { id: 2, memberId: 'LIB-S-102', name: 'Pooja Patel', type: 'Student', status: 'Active', issuedCount: 5, fine: 120 }, // at limit
    { id: 3, memberId: 'LIB-S-103', name: 'Rohan Joshi', type: 'Student', status: 'Inactive', issuedCount: 0, fine: 0 }, // inactive
  ];

  const books = [
    { id: 1, accessionNo: 'ACC-8021', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', available: 3, status: 'Available' },
    { id: 2, accessionNo: 'ACC-8022', title: 'Database System Concepts', author: 'Abraham Silberschatz', available: 0, status: 'Issued' }, // unavailable
  ];

  const handleMemberSearch = (e) => {
    e.preventDefault();
    const found = members.find(m => m.memberId.toLowerCase() === memberSearch.toLowerCase() || m.name.toLowerCase().includes(memberSearch.toLowerCase()));
    if (found) {
      setSelectedMember(found);
      setMemberSearch('');
    } else {
      toast.error('Member not found!');
    }
  };

  const handleBookSearch = (e) => {
    e.preventDefault();
    const found = books.find(b => b.accessionNo.toLowerCase() === bookSearch.toLowerCase() || b.title.toLowerCase().includes(bookSearch.toLowerCase()));
    if (found) {
      setSelectedBook(found);
      setBookSearch('');
    } else {
      toast.error('Book not found!');
    }
  };

  const handleIssueBook = (e) => {
    e.preventDefault();
    if (!selectedMember || !selectedBook) return;

    // Checks
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
    if (selectedBook.status !== 'Available') {
      toast.error('Cannot issue: Selected copy is already issued or reserved!');
      return;
    }

    toast.success(`Book issued successfully to ${selectedMember.name}!`);
    setSelectedMember(null);
    setSelectedBook(null);
  };

  const handleReturnScan = (e) => {
    e.preventDefault();
    if (returnBarcode === 'ACC-8021') {
      setReturnDetails({
        accessionNo: 'ACC-8021',
        title: 'Introduction to Algorithms',
        borrower: 'Amit Sharma',
        issueDate: '2024-02-01',
        dueDate: '2024-02-14',
        lateDays: 2,
        fine: 20
      });
      setReturnBarcode('');
    } else {
      toast.error('No active issue record found for this barcode!');
    }
  };

  const handleCompleteReturn = () => {
    toast.success(`Book ${returnDetails.title} returned successfully. Fine of ₹${returnDetails.fine} posted.`);
    setReturnDetails(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Tabs */}
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
              activeTab === tab ? 'text-[#0A6C54]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab} Book
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-md"></div>}
          </button>
        ))}
      </div>

      {activeTab === 'Issue' ? (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto">
          {/* Issue Parameters */}
          <div className="space-y-6">
            <div className="border border-gray-100 p-5 rounded-xl bg-gray-50/50 space-y-4">
              <h3 className="font-bold text-gray-800 text-[14px]">1. Scan / Search Member</h3>
              <form onSubmit={handleMemberSearch} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter Member ID (e.g. LIB-S-101)..." 
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
                    <span className={`font-semibold ${selectedMember.status === 'Active' ? 'text-green-600' : 'text-red-500'}`}>{selectedMember.status}</span>
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
                  placeholder="Enter Accession No (e.g. ACC-8021)..." 
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
                    <span className="text-gray-500">Catalog Availability:</span>
                    <span className={`font-semibold ${selectedBook.status === 'Available' ? 'text-green-600' : 'text-red-500'}`}>{selectedBook.status}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Issue Confirmation / Actions */}
          <div className="border border-gray-100 p-6 rounded-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-[14px] pb-2 border-b border-gray-100">Issue Confirmation</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Issue Date</label>
                  <input type="date" className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Due Date</label>
                  <input type="date" className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]" defaultValue={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Borrow Type</label>
                <select className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]">
                  <option>Standard (14 Days Renewal)</option>
                  <option>Reference Only (Not to be Taken Out)</option>
                  <option>Book Bank Scheme (Semester Long)</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Remarks</label>
                <textarea placeholder="e.g. Issued with minor wear on cover" className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-20 resize-none"></textarea>
              </div>
            </div>

            <button 
              onClick={handleIssueBook}
              disabled={!selectedMember || !selectedBook}
              className={`w-full py-3 rounded-lg text-[13px] font-bold text-white transition-colors ${
                selectedMember && selectedBook ? 'bg-[#0A6C54] hover:bg-[#085a46]' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Issue Book Copies
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto">
          {/* Scan for Return */}
          <div className="border border-gray-100 p-5 rounded-xl bg-gray-50/50 space-y-4">
            <h3 className="font-bold text-gray-800 text-[14px]">Scan Book Barcode for Return</h3>
            <form onSubmit={handleReturnScan} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Scan / Type Accession Number (e.g. ACC-8021)..." 
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
                  <span className="text-gray-500">Issued To:</span>
                  <span className="font-semibold text-gray-800">{returnDetails.borrower}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Due Date:</span>
                  <span className="text-gray-600">{returnDetails.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Late Return Delay:</span>
                  <span className="font-bold text-red-600">{returnDetails.lateDays} Days Overdue</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Calculated Late Fine:</span>
                  <span className="font-bold text-red-600">₹{returnDetails.fine}</span>
                </div>
              </div>
            )}
          </div>

          {/* Book Condition & Return Action */}
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
                disabled={!returnDetails}
                className="flex-1 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-[13px] font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Renew / Reissue Copy
              </button>
              <button 
                type="button"
                onClick={handleCompleteReturn}
                disabled={!returnDetails}
                className={`flex-1 py-3 rounded-lg text-[13px] font-bold text-white transition-colors ${
                  returnDetails ? 'bg-[#0A6C54] hover:bg-[#085a46]' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Post Book Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueReturn;
