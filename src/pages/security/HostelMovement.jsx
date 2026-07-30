import React, { useState } from 'react';
import { Search, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialLogs = [
  { id: 1, studentName: 'Amit Sharma', roomNo: 'Block A - 102', status: 'Outing Approved', checkOutTime: '04:00 PM', checkInTime: '-' },
  { id: 2, studentName: 'Neha Verma', roomNo: 'Block B - 204', status: 'Late Return Alert', checkOutTime: '02:00 PM', checkInTime: '-', isLate: true },
];

const HostelMovement = () => {
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState(initialLogs);

  const filtered = logs.filter(l => {
    return l.studentName.toLowerCase().includes(search.toLowerCase()) || 
           l.roomNo.toLowerCase().includes(search.toLowerCase());
  });

  const handleReturn = (id) => {
    setLogs(logs.map(l => l.id === id ? { ...l, status: 'Returned', checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isLate: false } : l));
    toast.success('Hostel student check-in recorded.');
  };

  const handleNotifyWarden = (id) => {
    toast.error('Alert: Warden notified regarding late return of student.');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Hostel Student Check-In & Out</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify hostel outing gate slips, check return timestamps, and trigger late-return alerts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search hostel movements by student name or room number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Room Location</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Out / In Time</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Outing Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.studentName}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{item.roomNo}</td>
                <td className="py-4 px-6 text-[13px] text-center text-gray-500 font-semibold">{item.checkOutTime} / {item.checkInTime}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.isLate ? 'bg-red-50 text-red-700 border border-red-100' :
                    item.status === 'Returned' ? 'bg-gray-50 text-gray-600 border border-gray-200' :
                    'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6 flex gap-2">
                  {item.checkInTime === '-' && (
                    <button onClick={() => handleReturn(item.id)} className="px-2.5 py-1 text-[11px] font-bold bg-[#0A6C54] text-white rounded hover:bg-[#085a46]">Check-In</button>
                  )}
                  {item.isLate && (
                    <button onClick={() => handleNotifyWarden(item.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Notify Warden"><AlertTriangle size={15} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HostelMovement;
