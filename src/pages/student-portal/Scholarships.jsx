import React, { useState } from 'react';
import { Search, Save, FileText, CheckCircle, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const initialScholarships = [
  { id: 1, name: 'Post-Matric Scholarship for OBC Students', status: 'Approved', amount: '₹12,000', remarks: 'Funds released on 10-Feb' },
  { id: 2, name: 'NSP Merit-cum-Means', status: 'Submitted', amount: '₹25,000', remarks: 'Awaiting Coordinator Recommendation' },
];

const Scholarships = () => {
  const [scholarships, setScholarships] = useState(initialScholarships);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyScheme, setApplyScheme] = useState('Post-Matric Scholarship for OBC Students');

  const handleApply = (e) => {
    e.preventDefault();
    const itemToAdd = {
      id: scholarships.length + 1,
      name: applyScheme,
      status: 'Submitted',
      amount: '₹20,000',
      remarks: 'Application under document verification'
    };
    setScholarships([...scholarships, itemToAdd]);
    setShowApplyModal(false);
    toast.success('Scholarship application submitted successfully!');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">My Scholarship Applications</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium font-semibold">Track government portal registrations, check renewal logs, and view disbursements</p>
        </div>
        <button onClick={() => setShowApplyModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          Apply for Scholarship
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto max-w-3xl">
        {scholarships.map(item => (
          <div key={item.id} className="p-5 border border-gray-100 rounded-xl space-y-3 bg-gray-50/20 shadow-sm text-[13px]">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-800">{item.name}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Sanctioned Amount: <strong className="text-[#0A6C54]">{item.amount}</strong></p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                item.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
              }`}>
                {item.status}
              </span>
            </div>
            <p className="text-[12px] text-gray-600 bg-white p-3 rounded border border-gray-100 font-medium">Remarks: {item.remarks}</p>
          </div>
        ))}
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Apply for Scholarship</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleApply} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Select Scheme</label>
                <select 
                  value={applyScheme} 
                  onChange={(e) => setApplyScheme(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                >
                  <option value="Post-Matric Scholarship for OBC Students">Post-Matric Scholarship for OBC Students</option>
                  <option value="NSP Merit-cum-Means">NSP Merit-cum-Means</option>
                  <option value="AICTE Pragati Scholarship">AICTE Pragati Scholarship</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Upload Income Certificate (PDF)</label>
                <input type="file" required className="w-full p-2 border border-gray-200 rounded-lg text-[12px]" />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5"
                >
                  <Upload size={14} /> Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scholarships;
