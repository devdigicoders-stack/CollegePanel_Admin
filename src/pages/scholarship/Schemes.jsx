import React, { useState } from 'react';
import { Plus, Edit2, Download, Calendar, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const initialSchemes = [
  { id: 1, name: 'Post-Matric Scholarship for OBC Students', type: 'Government (State)', eligibility: 'OBC Category, Family Income < ₹2.5 LPA', reward: 'Tuition Fee reimbursement', deadline: '2024-03-15', status: 'Applications Open' },
  { id: 2, name: 'AICTE Pragati Scholarship for Girls', type: 'AICTE', eligibility: 'Girl Student, CGPA > 8.0, Income < ₹8.0 LPA', reward: '₹50,000 per annum', deadline: '2024-03-31', status: 'Applications Open' },
  { id: 3, name: 'NSP Merit-cum-Means Scholarship', type: 'NSP (National)', eligibility: 'Minority Category, Marks > 50%, Income < ₹2.5 LPA', reward: '₹20,000 per annum', deadline: '2024-03-10', status: 'Applications Open' },
  { id: 4, name: 'College Merit-cum-Need Aid', type: 'College', eligibility: 'General/OBC/SC/ST, CGPA > 9.0', reward: '50% Tuition Fee waiver', deadline: '2024-02-28', status: 'Applications Closed' },
];

const Schemes = () => {
  const [schemes, setSchemes] = useState(initialSchemes);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newScheme, setNewScheme] = useState({
    name: '',
    type: 'Government (State)',
    eligibility: '',
    reward: '',
    deadline: '',
  });

  const handleAddScheme = (e) => {
    e.preventDefault();
    const itemToAdd = {
      id: schemes.length + 1,
      name: newScheme.name,
      type: newScheme.type,
      eligibility: newScheme.eligibility,
      reward: newScheme.reward,
      deadline: newScheme.deadline,
      status: 'Applications Open'
    };
    setSchemes([...schemes, itemToAdd]);
    setShowAddModal(false);
    toast.success(`Scholarship Scheme ${newScheme.name} configured successfully!`);
    setNewScheme({
      name: '',
      type: 'Government (State)',
      eligibility: '',
      reward: '',
      deadline: '',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Scholarship Scheme Portal</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Configure government, state, merit-cum-means, or AICTE scholarship schemes</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Plus size={16} /> Configure Scheme
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Scheme Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Funding / Agency</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Eligibility Criteria</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Award Description</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Last Date</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
            </tr>
          </thead>
          <tbody>
            {schemes.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{item.type}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.eligibility}</td>
                <td className="py-4 px-6 text-[13px] text-[#0A6C54] font-bold">{item.reward}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{item.deadline}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Applications Open' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Scheme Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Configure Scholarship Scheme</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddScheme} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Scheme Name</label>
                <input 
                  type="text" 
                  required
                  value={newScheme.name}
                  onChange={(e) => setNewScheme({...newScheme, name: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Funding / Agency</label>
                  <select 
                    value={newScheme.type} 
                    onChange={(e) => setNewScheme({...newScheme, type: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Government (State)">Government (State)</option>
                    <option value="AICTE">AICTE</option>
                    <option value="NSP (National)">NSP (National)</option>
                    <option value="College">College</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Last Date</label>
                  <input 
                    type="date" 
                    required
                    value={newScheme.deadline}
                    onChange={(e) => setNewScheme({...newScheme, deadline: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Eligibility Criteria Details</label>
                <input 
                  type="text" 
                  required
                  value={newScheme.eligibility}
                  onChange={(e) => setNewScheme({...newScheme, eligibility: e.target.value})}
                  placeholder="e.g. SC Category, Income < ₹2.5 LPA"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Award / Reward Description</label>
                <input 
                  type="text" 
                  required
                  value={newScheme.reward}
                  onChange={(e) => setNewScheme({...newScheme, reward: e.target.value})}
                  placeholder="e.g. ₹50,000 per annum"
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
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
                >
                  Save Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schemes;
