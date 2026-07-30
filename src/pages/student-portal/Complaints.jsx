import React, { useState } from 'react';
import { Search, Save, Plus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialComplaints = [
  { id: 1, type: 'IT Support', desc: 'Hostel Block A WiFi signal weak on 1st floor', status: 'In Progress', date: '12-Feb' },
  { id: 2, type: 'Infrastructure', desc: 'Classroom 4 fan regulator broken', status: 'Resolved', date: '10-Feb' },
];

const Complaints = () => {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [showModal, setShowModal] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    type: 'IT Support',
    desc: '',
  });

  const handleApply = (e) => {
    e.preventDefault();
    const itemToAdd = {
      id: complaints.length + 1,
      type: newComplaint.type,
      desc: newComplaint.desc,
      date: new Date().toLocaleDateString([], { day: '2-digit', month: 'short' }),
      status: 'Open'
    };
    setComplaints([itemToAdd, ...complaints]);
    setShowModal(false);
    toast.success('Complaint ticket created and assigned to administration!');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">My Maintenance & IT Complaints</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Log room issues, academic grievances, or laboratory breakdowns, and check resolution updates</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Plus size={16} /> File Complaint Ticket
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto max-w-3xl">
        {complaints.map(item => (
          <div key={item.id} className="p-4 border border-gray-100 rounded-xl space-y-3 bg-gray-50/20 shadow-sm text-[13px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-semibold text-gray-400">{item.type} | {item.date}</span>
                <p className="font-bold text-gray-800 mt-1">{item.desc}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                item.status === 'Resolved' ? 'bg-green-50 text-green-700 border border-green-100' :
                item.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                'bg-yellow-50 text-yellow-700 border border-yellow-100'
              }`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">File Complaint Ticket</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleApply} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Issue Category</label>
                <select 
                  value={newComplaint.type} 
                  onChange={(e) => setNewComplaint({...newComplaint, type: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                >
                  <option value="IT Support">IT Support (WiFi/Portal)</option>
                  <option value="Infrastructure">Infrastructure (Light/Fan/Civil)</option>
                  <option value="Academic">Academic (Syllabus/Marks)</option>
                  <option value="Hostel / Mess">Hostel / Mess</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Description of Issue</label>
                <textarea 
                  required
                  value={newComplaint.desc}
                  onChange={(e) => setNewComplaint({...newComplaint, desc: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-24 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
                >
                  File Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
