import React, { useState } from 'react';
import { Search, Download, Plus, AlertCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const initialIncidents = [
  { id: 1, caseNo: 'DISC-501', studentName: 'Aarav Singh', room: '101', type: 'Late return', date: '2024-02-14', desc: 'Returned to hostel at 11:30 PM (Curfew is 9:30 PM)', parentInformed: 'Yes', action: 'Written warning issued' },
  { id: 2, caseNo: 'DISC-502', studentName: 'Vikram Patel', room: '102', type: 'Property damage', date: '2024-02-10', desc: 'Accidentally broke common room window glass during table tennis', parentInformed: 'Yes', action: 'Window replacement charge posted to Accountant' },
];

const Incidents = () => {
  const [search, setSearch] = useState('');
  const [incidents, setIncidents] = useState(initialIncidents);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIncident, setNewIncident] = useState({
    studentName: '',
    room: '',
    type: 'Late return',
    desc: '',
    parentInformed: 'No',
  });

  const filtered = incidents.filter(i => {
    const matchesSearch = i.studentName.toLowerCase().includes(search.toLowerCase()) || 
                          i.caseNo.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleAddIncident = (e) => {
    e.preventDefault();
    const incidentToAdd = {
      id: incidents.length + 1,
      caseNo: `DISC-${Math.floor(500 + Math.random() * 500)}`,
      studentName: newIncident.studentName,
      room: newIncident.room,
      type: newIncident.type,
      date: new Date().toISOString().split('T')[0],
      desc: newIncident.desc,
      parentInformed: newIncident.parentInformed,
      action: 'Under Investigation / Review'
    };
    setIncidents([incidentToAdd, ...incidents]);
    setShowAddModal(false);
    toast.success(`Disciplinary incident logged for ${newIncident.studentName}.`);
    setNewIncident({
      studentName: '',
      room: '',
      type: 'Late return',
      desc: '',
      parentInformed: 'No',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Discipline & Incident Registry</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Record curfew delays, property damages, or rule violations, and inform parents</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Registry
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Log Incident
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by student name or case number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-red-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Case No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Room Location</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Incident Type</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Occurrence Date</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Details / Description</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Parent Informed</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Action Taken / Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-red-600">{item.caseNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.studentName}</td>
                <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">Room {item.room}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{item.type}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.date}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.desc}</td>
                <td className="py-4 px-6 text-center font-bold text-gray-700">{item.parentInformed}</td>
                <td className="py-4 px-6 text-[13px] font-medium text-gray-700 italic">{item.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Incident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Log Disciplinary Incident</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddIncident} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Student Name</label>
                <input 
                  type="text" 
                  required
                  value={newIncident.studentName}
                  onChange={(e) => setNewIncident({...newIncident, studentName: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Room Number</label>
                  <input 
                    type="text" 
                    required
                    value={newIncident.room}
                    onChange={(e) => setNewIncident({...newIncident, room: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Incident Type</label>
                  <select 
                    value={newIncident.type} 
                    onChange={(e) => setNewIncident({...newIncident, type: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Late return">Late return</option>
                    <option value="Unauthorized absence">Unauthorized absence</option>
                    <option value="Property damage">Property damage</option>
                    <option value="Rule violation">Rule violation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Description / Details</label>
                <textarea 
                  required
                  value={newIncident.desc}
                  onChange={(e) => setNewIncident({...newIncident, desc: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Parent Informed?</label>
                <select 
                  value={newIncident.parentInformed} 
                  onChange={(e) => setNewIncident({...newIncident, parentInformed: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
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
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[13px] font-semibold"
                >
                  Post Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;
