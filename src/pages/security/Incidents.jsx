import React, { useState } from 'react';
import { Search, Download, Plus, AlertCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const initialIncidents = [
  { id: 1, type: 'Property Damage', desc: 'Slight dent to staff parking side gate', priority: 'Medium', status: 'Forwarded to Admin' },
  { id: 2, type: 'Lost Item', desc: 'Calculated scale drawing board left in auditorium', priority: 'Low', status: 'Logged' },
];

const Incidents = () => {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIncident, setNewIncident] = useState({
    type: 'Property Damage',
    desc: '',
    priority: 'Medium',
  });

  const handleCreateIncident = (e) => {
    e.preventDefault();
    const itemToAdd = {
      id: incidents.length + 1,
      type: newIncident.type,
      desc: newIncident.desc,
      priority: newIncident.priority,
      status: 'Forwarded to Admin'
    };
    setIncidents([...incidents, itemToAdd]);
    setShowAddModal(false);
    toast.success('Incident logged and forwarded to Discipline Officer.');
    setNewIncident({
      type: 'Property Damage',
      desc: '',
      priority: 'Medium',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Security Incidents & Misconduct Logs</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium font-semibold">Log property damages, rule violations, and forward tickets to HOD/Discipline Office</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Plus size={16} /> File Incident Ticket
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Incident Category</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Detailed Description</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Priority Level</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Forwarding status</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.type}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.desc}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                    {item.priority}
                  </span>
                </td>
                <td className="py-4 px-6 text-[13px]">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-50 text-gray-600 border border-gray-200">
                    {item.status}
                  </span>
                </td>
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
              <h3 className="font-bold text-gray-800 text-[15px]">Create Incident Ticket</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleCreateIncident} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Incident Category</label>
                <select 
                  value={newIncident.type} 
                  onChange={(e) => setNewIncident({...newIncident, type: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                >
                  <option value="Property Damage">Property Damage</option>
                  <option value="Lost Item">Lost Item</option>
                  <option value="Rule Violation">Rule Violation</option>
                  <option value="Theft / Misplacement">Theft / Misplacement</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Priority Level</label>
                <select 
                  value={newIncident.priority} 
                  onChange={(e) => setNewIncident({...newIncident, priority: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Detailed Description</label>
                <textarea 
                  required
                  value={newIncident.desc}
                  onChange={(e) => setNewIncident({...newIncident, desc: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-24 resize-none"
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
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
                >
                  File Incident
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
