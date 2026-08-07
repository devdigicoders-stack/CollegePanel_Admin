const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import { Search, Plus, Barcode, CheckCircle, AlertTriangle, FileText, Download } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const StockVerification = () => {
  const [activeSession, setActiveSession] = useState('Annual Audit 2024');
  const [search, setSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/library/stock');
      // Adding mock status for UI demonstration since backend just returns books
      const mapped = res.data.map(book => ({
        ...book,
        status: book.status === 'Lost' ? 'Missing' : 'Pending Verification',
        lastVerified: 'N/A'
      }));
      setItems(mapped);
    } catch (error) {
      toast.error('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const handleScanVerify = async (e) => {
    e.preventDefault();
    if(!barcodeInput) return;

    try {
      // Just hit the dummy verify endpoint
      await axiosInstance.post('/library/stock/verify', { accessionNo: barcodeInput });
      
      const foundIdx = items.findIndex(item => item.accessionNo?.toLowerCase() === barcodeInput.toLowerCase());
      if (foundIdx > -1) {
        const updated = [...items];
        updated[foundIdx] = {
          ...updated[foundIdx],
          status: 'Verified',
          lastVerified: new Date().toISOString().split('T')[0]
        };
        setItems(updated);
        toast.success(\`Book \${updated[foundIdx].title} verified successfully!\`);
      } else {
        toast.error('Accession code not found in current session inventory!');
      }
    } catch (err) {
      toast.error('Verification failed');
    } finally {
      setBarcodeInput('');
    }
  };

  const filtered = items.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(search.toLowerCase()) || 
                          item.accessionNo?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Physical Stock Verification</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify catalog inventory, perform rack audits, and mark missing volumes</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Discrepancy Report
          </button>
          <button onClick={() => { setActiveSession(\`Audit Session \${new Date().toLocaleDateString()}\`); fetchStock(); }} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> New Session
          </button>
        </div>
      </div>

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
            <span>Pending: {items.filter(i => i.status === 'Pending Verification').length}</span>
            <span>Missing: {items.filter(i => i.status === 'Missing').length}</span>
          </div>
        </div>
      </div>

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

      <div className="overflow-x-auto flex-1">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading stock data...</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Accession No</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Book Title</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Category</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Last Audited Date</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Audit Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.accessionNo}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.title}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.category}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500">{item.lastVerified}</td>
                  <td className="py-4 px-6">
                    <span className={\`px-2.5 py-1 rounded-full text-[11px] font-semibold \${
                      item.status === 'Verified' ? 'bg-green-50 text-green-700 border border-green-100' :
                      item.status === 'Missing' ? 'bg-red-50 text-red-700 border border-red-100' :
                      item.status === 'Pending Verification' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                      'bg-gray-50 text-gray-700 border border-gray-200'
                    }\`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">No books found in catalog.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StockVerification;
`;

fs.writeFileSync('d:/Desktop/DCT_CLG_CRM/admin/src/pages/library/StockVerification.jsx', content, 'utf-8');
console.log("Rewrote StockVerification.jsx");
