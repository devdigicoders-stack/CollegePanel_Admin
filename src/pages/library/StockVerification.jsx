import React, { useState } from 'react';
import { Search, Plus, Barcode, CheckCircle, AlertTriangle, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const initialItems = [
  { id: 1, accessionNo: 'ACC-8021', title: 'Introduction to Algorithms', rack: 'Rack B2', lastVerified: '2024-02-15', status: 'Verified' },
  { id: 2, accessionNo: 'ACC-8022', title: 'Database System Concepts', rack: 'Rack A4', lastVerified: '2024-02-14', status: 'Verified' },
  { id: 3, accessionNo: 'ACC-8023', title: 'Engineering Physics', rack: 'Rack C1', lastVerified: '2024-02-10', status: 'Missing' },
  { id: 4, accessionNo: 'ACC-8024', title: 'Advanced Engineering Mathematics', rack: 'Rack D2', lastVerified: '2024-02-12', status: 'Wrong Rack' },
  { id: 5, accessionNo: 'ACC-8025', title: 'Theory of Machines', rack: 'Rack E3', lastVerified: '2024-02-11', status: 'Damaged' },
];

const StockVerification = () => {
  const [activeSession, setActiveSession] = useState('Annual Audit 2024');
  const [search, setSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [items, setItems] = useState(initialItems);

  const handleScanVerify = (e) => {
    e.preventDefault();
    const foundIdx = items.findIndex(item => item.accessionNo.toLowerCase() === barcodeInput.toLowerCase());
    if (foundIdx > -1) {
      const updated = [...items];
      updated[foundIdx] = {
        ...updated[foundIdx],
        status: 'Verified',
        lastVerified: new Date().toISOString().split('T')[0]
      };
      setItems(updated);
      toast.success(`Book ${updated[foundIdx].title} verified successfully!`);
      setBarcodeInput('');
    } else {
      toast.error('Accession code not found in current session inventory!');
    }
  };

  const filtered = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.accessionNo.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Physical Stock Verification</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify catalog inventory, perform rack audits, and mark missing volumes</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Discrepancy Report
          </button>
          <button className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> New Session
          </button>
        </div>
      </div>

      {/* Barcode scanner panel */}
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-2">
          <h3 className="font-bold text-gray-800 text-[14px]">Scan Barcode to Verify</h3>
          <form onSubmit={handleScanVerify} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Scan / Enter accession number (e.g. ACC-8023)..." 
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="flex-1 p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] bg-white font-mono"
            />
            <button type="submit" className="bg-[#0A6C54] text-white px-5 py-2.5 rounded-lg text-[13px] font-bold flex items-center gap-1.5">
              <Barcode size={16} /> Verify Copy
            </button>
          </form>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col justify-center">
          <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Active Audit Session</span>
          <h4 className="font-bold text-gray-800 text-[14px] mt-1">{activeSession}</h4>
          <div className="flex gap-3 text-[11px] text-gray-500 mt-2 font-medium">
            <span>Verified: {items.filter(i => i.status === 'Verified').length}</span>
            <span>Missing: {items.filter(i => i.status === 'Missing').length}</span>
            <span>Wrong Rack: {items.filter(i => i.status === 'Wrong Rack').length}</span>
          </div>
        </div>
      </div>

      {/* Filters & search */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Quick search by title or accession no..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Accession No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Book Title</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Designated Rack</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Last Audited Date</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Audit Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.accessionNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.title}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.rack}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.lastVerified}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Verified' ? 'bg-green-50 text-green-700 border border-green-100' :
                    item.status === 'Missing' ? 'bg-red-50 text-red-700 border border-red-100' :
                    item.status === 'Damaged' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                    'bg-yellow-50 text-yellow-700 border border-yellow-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockVerification;
