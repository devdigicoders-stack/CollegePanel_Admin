import React, { useState } from 'react';
import { Search, Download, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialLedger = [
  { id: 1, studentName: 'Amit Sharma', enrollNo: 'OP/23/CS/001', scheme: 'Post-Matric Scholarship for OBC', sanctioned: 12000, disbursed: 12000, pending: 0, status: 'Released', txnNo: 'TXN-OB982112' },
  { id: 2, studentName: 'Vikram Patel', enrollNo: 'OP/23/ME/015', scheme: 'AICTE Pragati Scholarship', sanctioned: 50000, disbursed: 25000, pending: 25000, status: 'Partially Released', txnNo: 'TXN-AC8811A' },
  { id: 3, studentName: 'Aditi Rao', enrollNo: 'OP/23/CS/021', scheme: 'NSP Merit-cum-Means', sanctioned: 20000, disbursed: 0, pending: 20000, status: 'Pending Transfer', txnNo: '-' },
];

const Disbursement = () => {
  const [search, setSearch] = useState('');
  const [ledger, setLedger] = useState(initialLedger);

  const filtered = ledger.filter(item => {
    return item.studentName.toLowerCase().includes(search.toLowerCase()) || 
           item.scheme.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Scholarship Disbursement Ledger</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify transaction references, sanctioned amounts, and bank transfer statuses</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export Ledger
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by student name or scheme..." 
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
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Scheme</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Sanctioned Amount</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Disbursed Amount</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Pending Amount</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">TXN Reference</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Disbursement Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.studentName}</td>
                <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.scheme}</td>
                <td className="py-4 px-6 text-[13px] text-right font-bold text-gray-900">₹{item.sanctioned.toLocaleString()}</td>
                <td className="py-4 px-6 text-[13px] text-right font-bold text-green-700">₹{item.disbursed.toLocaleString()}</td>
                <td className="py-4 px-6 text-[13px] text-right font-bold text-red-500">₹{item.pending.toLocaleString()}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-mono font-semibold">{item.txnNo}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Released' ? 'bg-green-50 text-green-700 border border-green-100' :
                    item.status === 'Partially Released' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
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

export default Disbursement;
