import React, { useState } from 'react';
import { Search, Download, Plus, Calendar, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialAppointments = [
  { id: 1, visitorName: 'Suresh Chandra', host: 'Principal Office', date: '2024-02-15', time: '10:00 AM', status: 'Confirmed' },
  { id: 2, visitorName: 'Tech Solutions Rep', host: 'HOD CSE', date: '2024-02-15', time: '11:30 AM', status: 'Confirmed' },
  { id: 3, visitorName: 'Dr. R.S. Rawat', host: 'Principal Office', date: '2024-02-16', time: '02:00 PM', status: 'Pending Approval' },
];

const Appointments = () => {
  const [search, setSearch] = useState('');
  const [appts, setAppts] = useState(initialAppointments);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAppt, setNewAppt] = useState({
    visitorName: '',
    host: 'Principal Office',
    date: '',
    time: '',
  });

  const filtered = appts.filter(a => {
    return a.visitorName.toLowerCase().includes(search.toLowerCase()) || 
           a.host.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddAppointment = (e) => {
    e.preventDefault();
    const itemToAdd = {
      id: appts.length + 1,
      visitorName: newAppt.visitorName,
      host: newAppt.host,
      date: newAppt.date,
      time: newAppt.time,
      status: 'Pending Approval'
    };
    setAppts([...appts, itemToAdd]);
    setShowAddModal(false);
    toast.success(`Appointment scheduled with ${newAppt.host}!`);
    setNewAppt({
      visitorName: '',
      host: 'Principal Office',
      date: '',
      time: '',
    });
  };

  const handleApprove = (id) => {
    setAppts(appts.map(a => a.id === id ? { ...a, status: 'Confirmed' } : a));
    toast.success('Appointment status approved and calendar synced.');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Campus Meeting Appointments</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify meeting timings for Principal/HOD offices and approve parent meeting slots</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Schedule
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Schedule Meeting
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by visitor name or host office..." 
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
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Visitor Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Meeting Target Office</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Meeting Date</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Time Slot</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 font-bold">Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.visitorName}</td>
                <td className="py-4 px-6 text-[13px] text-[#0A6C54] font-semibold">{item.host}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{item.date}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.time}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Confirmed' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {item.status === 'Pending Approval' ? (
                    <button onClick={() => handleApprove(item.id)} className="px-2.5 py-1 text-[11px] font-bold bg-[#0A6C54] text-white rounded hover:bg-[#085a46]">Approve</button>
                  ) : (
                    <span className="text-[12px] text-gray-400 italic">Confirmed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Schedule Office Meeting</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddAppointment} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Visitor Name</label>
                <input 
                  type="text" 
                  required
                  value={newAppt.visitorName}
                  onChange={(e) => setNewAppt({...newAppt, visitorName: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Select Office / Officer</label>
                <select 
                  value={newAppt.host} 
                  onChange={(e) => setNewAppt({...newAppt, host: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                >
                  <option value="Principal Office">Principal Office</option>
                  <option value="HOD CSE Office">HOD CSE Office</option>
                  <option value="Placement Cell">Placement Cell</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Meeting Date</label>
                  <input 
                    type="date" 
                    required
                    value={newAppt.date}
                    onChange={(e) => setNewAppt({...newAppt, date: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Time Slot</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 10:00 AM"
                    value={newAppt.time}
                    onChange={(e) => setNewAppt({...newAppt, time: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
