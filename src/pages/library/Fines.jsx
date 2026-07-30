import { useState } from 'react';
import { Search, Download, Printer, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const initialFines = [
  { id: 1, invoiceNo: 'FN-8901', memberName: 'Amit Sharma', type: 'Student', bookTitle: 'Discrete Mathematics', fineAmount: 50, paidAmount: 0, reason: 'Late return (5 days)', dateCreated: '2024-02-12', status: 'Unpaid' },
  { id: 2, invoiceNo: 'FN-8902', memberName: 'Pooja Patel', type: 'Student', bookTitle: 'Advanced Calculus', fineAmount: 120, paidAmount: 0, reason: 'Damaged Cover Page', dateCreated: '2024-02-10', status: 'Unpaid' },
  { id: 3, invoiceNo: 'FN-8903', memberName: 'Rohan Joshi', type: 'Student', bookTitle: 'Introduction to Algorithms', fineAmount: 300, paidAmount: 300, reason: 'Lost book replacement fee', dateCreated: '2024-02-08', status: 'Paid' },
  { id: 4, invoiceNo: 'FN-8904', memberName: 'Nikhil Soni', type: 'Student', bookTitle: 'Compiler Design', fineAmount: 40, paidAmount: 40, reason: 'Late return (4 days)', dateCreated: '2024-02-05', status: 'Paid' },
];

const Fines = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [fines, setFines] = useState(initialFines);
  const [selectedFine, setSelectedFine] = useState(null);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [collectAmount, setCollectAmount] = useState('');
  const [payMode, setPayMode] = useState('Cash');

  const filtered = fines.filter(f => {
    const matchesSearch = f.memberName.toLowerCase().includes(search.toLowerCase()) || 
                          f.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
                          f.bookTitle.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || f.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCollectFine = (e) => {
    e.preventDefault();
    if (!selectedFine) return;
    const paid = parseFloat(collectAmount) || 0;
    
    setFines(fines.map(f => {
      if (f.id === selectedFine.id) {
        const newPaid = f.paidAmount + paid;
        return {
          ...f,
          paidAmount: newPaid,
          status: newPaid >= f.fineAmount ? 'Paid' : 'Unpaid'
        };
      }
      return f;
    }));

    toast.success(`Fine of ₹${paid} collected successfully for ${selectedFine.memberName}!`);
    setShowCollectModal(false);
    setSelectedFine(null);
    setCollectAmount('');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Fine Management</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Auto-calculate library delay penalties, record collections, and issue receipts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export Dues
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by student name, book, or transaction no..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>

        <div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option value="All">All Transactions</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Invoice No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Member</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Book Reference</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Reason / Details</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Fine (Payable)</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Collected (Paid)</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.invoiceNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.memberName} ({item.type})</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.bookTitle}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.reason}</td>
                <td className="py-4 px-6 text-[13px] text-right font-bold text-gray-900">₹{item.fineAmount}</td>
                <td className="py-4 px-6 text-[13px] text-right font-semibold text-green-600">₹{item.paidAmount}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6 flex gap-2">
                  {item.status === 'Unpaid' && (
                    <button 
                      onClick={() => { setSelectedFine(item); setCollectAmount(item.fineAmount - item.paidAmount); setShowCollectModal(true); }}
                      className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors" 
                      title="Collect Fine"
                    >
                      <DollarSign size={15} />
                    </button>
                  )}
                  {item.status === 'Paid' && (
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Print Fine Receipt"><Printer size={15} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Collect Fine Modal */}
      {showCollectModal && selectedFine && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Collect Library Fine</h3>
              <button onClick={() => { setShowCollectModal(false); setSelectedFine(null); }} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleCollectFine} className="p-6 space-y-4">
              <div className="bg-[#0A6C54]/5 p-4 rounded-xl text-[13px] text-gray-700 space-y-1">
                <p><span className="text-gray-500">Member:</span> <strong>{selectedFine.memberName}</strong></p>
                <p><span className="text-gray-500">Fine Cause:</span> <strong>{selectedFine.reason}</strong></p>
                <p><span className="text-gray-500">Total Pending:</span> <strong className="text-red-500">₹{selectedFine.fineAmount - selectedFine.paidAmount}</strong></p>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Collection Amount (₹)</label>
                <input 
                  type="number" 
                  required
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value)}
                  max={selectedFine.fineAmount - selectedFine.paidAmount}
                  min="1"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Payment Mode</label>
                <select 
                  value={payMode} 
                  onChange={(e) => setPayMode(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
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
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
                >
                  Record Payment
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
