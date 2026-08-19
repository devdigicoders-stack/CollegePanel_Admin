import React, { useState } from 'react';
import { Search, Download, Plus, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const initialDrives = [
  { id: 1, type: 'On-Campus Drive', company: 'Tata Consultancy Services', date: '2024-02-18', venue: 'Main Auditorium Hall A', eligibleDepts: 'CSE, ECE, IT', status: 'Registration Open' },
  { id: 2, type: 'On-Campus Drive', company: 'Cognizant Technology Solutions', date: '2024-02-22', venue: 'Placement Cell Seminar Hall', eligibleDepts: 'CSE, IT', status: 'Planned' },
  { id: 3, type: 'Off-Campus Drive', company: 'Larsen & Toubro', date: '2024-02-25', venue: 'L&T Regional Corporate Office', eligibleDepts: 'ME, CE', status: 'Planned' },
];

const PlacementDrives = () => {
  const [search, setSearch] = useState('');
  const [drives, setDrives] = useState(initialDrives);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDrive, setNewDrive] = useState({
    type: 'On-Campus Drive',
    company: 'Tata Consultancy Services',
    date: '',
    venue: '',
    eligibleDepts: '',
  });

  const filtered = drives.filter(d => {
    return d.company.toLowerCase().includes(search.toLowerCase()) || 
           d.venue.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddDrive = (e) => {
    e.preventDefault();
    const driveToAdd = {
      id: drives.length + 1,
      type: newDrive.type,
      company: newDrive.company,
      date: newDrive.date,
      venue: newDrive.venue,
      eligibleDepts: newDrive.eligibleDepts,
      status: 'Planned'
    };
    setDrives([...drives, driveToAdd]);
    setShowAddModal(false);
    toast.success(`Placement Drive for ${newDrive.company} scheduled!`);
    setNewDrive({
      type: 'On-Campus Drive',
      company: 'Tata Consultancy Services',
      date: '',
      venue: '',
      eligibleDepts: '',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Recruitment Drives Schedule</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium font-semibold">Coordinate on-campus placement sessions, venue arrangements, and round instructions</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Plus size={16} /> Schedule Campus Drive
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search drives by venue or recruiting company..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Drive Type</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Recruiting Corporation</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Date</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Venue Location</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Target Departments</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.type}</td>
                <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.company}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{item.date}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.venue}</td>
                <td className="py-4 px-6 text-[13px] text-primary font-semibold">{item.eligibleDepts}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Registration Open' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Drive Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Schedule Placement Drive</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddDrive} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Drive Type</label>
                  <select 
                    value={newDrive.type} 
                    onChange={(e) => setNewDrive({...newDrive, type: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="On-Campus Drive">On-Campus Drive</option>
                    <option value="Off-Campus Drive">Off-Campus Drive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Company</label>
                  <select 
                    value={newDrive.company} 
                    onChange={(e) => setNewDrive({...newDrive, company: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    {drives.map(d => <option key={d.id} value={d.company}>{d.company}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Drive Date</label>
                  <input 
                    type="date" 
                    required
                    value={newDrive.date}
                    onChange={(e) => setNewDrive({...newDrive, date: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Venue Location</label>
                  <input 
                    type="text" 
                    required
                    value={newDrive.venue}
                    onChange={(e) => setNewDrive({...newDrive, venue: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Eligible Departments</label>
                <input 
                  type="text" 
                  required
                  value={newDrive.eligibleDepts}
                  onChange={(e) => setNewDrive({...newDrive, eligibleDepts: e.target.value})}
                  placeholder="e.g. CSE, IT, ECE"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
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
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold"
                >
                  Schedule Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementDrives;
