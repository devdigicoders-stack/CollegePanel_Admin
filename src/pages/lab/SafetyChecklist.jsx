import React, { useState } from 'react';
import { ShieldCheck, Calendar, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const initialChecklist = [
  { id: 1, name: 'Electrical Earthing & Insulation Check', category: 'Electrical', lastInspected: '2024-02-14', status: 'Passed' },
  { id: 2, name: 'Fire Extinguisher Pressure & Expiry', category: 'Fire Safety', lastInspected: '2024-02-10', status: 'Requires Attention' },
  { id: 3, name: 'First Aid Kit Supply Restocking', category: 'Medical', lastInspected: '2024-02-15', status: 'Passed' },
  { id: 4, name: 'Chemical Ventilation & Storage Locks', category: 'Chemical Safety', lastInspected: '2024-02-12', status: 'Passed' },
  { id: 5, name: 'PPE Kits Availability (Gloves/Goggles)', category: 'Safety Wear', lastInspected: '2024-02-14', status: 'Passed' },
];

const SafetyChecklist = () => {
  const [checklist, setChecklist] = useState(initialChecklist);

  const handleToggleStatus = (id) => {
    setChecklist(checklist.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'Passed' ? 'Requires Attention' : 'Passed';
        return { ...c, status: nextStatus, lastInspected: new Date().toISOString().split('T')[0] };
      }
      return c;
    }));
    toast.success('Inspection log status updated!');
  };

  const handleSaveLogs = () => {
    toast.success('Lab safety checklist audit report logged successfully!');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Weekly Lab Safety Audit Checklist</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Perform inspections on fire extinguishers, chemical lockers, and shock safety tools</p>
        </div>
        <button onClick={handleSaveLogs} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Save size={16} /> Log Audit Report
        </button>
      </div>

      {/* List */}
      <div className="p-6 space-y-4 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {checklist.map(item => (
            <div key={item.id} className="p-5 border border-gray-100 rounded-xl shadow-sm space-y-4 bg-gradient-to-br from-white to-gray-50/50 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{item.category}</span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                    item.status === 'Passed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                  }`}>{item.status}</span>
                </div>
                <h3 className="font-bold text-gray-800 text-[14px] mt-2">{item.name}</h3>
                <p className="text-[11px] text-gray-500 mt-1">Last Checked: {item.lastInspected}</p>
              </div>

              <button 
                onClick={() => handleToggleStatus(item.id)}
                className={`w-full py-2 border rounded-lg text-[12px] font-bold transition-colors ${
                  item.status === 'Passed' ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                }`}
              >
                {item.status === 'Passed' ? 'Mark Flag / Fail' : 'Mark Passed'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SafetyChecklist;
