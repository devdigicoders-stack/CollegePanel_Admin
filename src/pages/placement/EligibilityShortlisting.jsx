import React, { useState } from 'react';
import { Search, Save, Filter, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialCandidates = [
  { id: 1, name: 'Amit Sharma', cgpa: 8.8, backlogs: 0, dept: 'Computer Science', shortlisted: true },
  { id: 2, name: 'Neha Verma', cgpa: 7.9, backlogs: 1, dept: 'Information Tech', shortlisted: false },
  { id: 3, name: 'Vikram Patel', cgpa: 6.5, backlogs: 0, dept: 'Mechanical', shortlisted: true },
  { id: 4, name: 'Aditi Rao', cgpa: 8.1, backlogs: 0, dept: 'Computer Science', shortlisted: true },
];

const EligibilityShortlisting = () => {
  const [minCgpa, setMinCgpa] = useState(7.0);
  const [allowBacklogs, setAllowBacklogs] = useState(false);
  const [candidates, setCandidates] = useState(initialCandidates);

  const handleRunFilter = () => {
    setCandidates(candidates.map(c => {
      const cgpaCheck = c.cgpa >= minCgpa;
      const backlogCheck = allowBacklogs ? true : c.backlogs === 0;
      return { ...c, shortlisted: cgpaCheck && backlogCheck };
    }));
    toast.success('System filters applied to applicant registry!');
  };

  const handleManualToggle = (id) => {
    setCandidates(candidates.map(c => c.id === id ? { ...c, shortlisted: !c.shortlisted } : c));
    toast.success('Applicant shortlist override posted successfully.');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Eligibility Filter & Shortlisting</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify CGPA margins, backlog parameters, and generate candidate lists</p>
        </div>
        <button onClick={() => toast.success('Shortlist roster published!')} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-colors">
          Publish Shortlist
        </button>
      </div>

      {/* Selector and Parameters */}
      <div className="p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">Minimum CGPA</label>
          <input 
            type="number" 
            step="0.1" 
            value={minCgpa}
            onChange={(e) => setMinCgpa(parseFloat(e.target.value))}
            className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">Allow Active Backlogs?</label>
          <select 
            value={allowBacklogs ? 'Yes' : 'No'}
            onChange={(e) => setAllowBacklogs(e.target.value === 'Yes')}
            className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
          >
            <option value="No">No Backlogs Allowed</option>
            <option value="Yes">Allow Active Backlogs</option>
          </select>
        </div>

        <div className="flex items-end">
          <button onClick={handleRunFilter} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-[13px] font-bold flex items-center justify-center gap-1">
            <Filter size={15} /> Apply System Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Department</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">CGPA</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Active Backlogs</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Manual Override</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.dept}</td>
                <td className="py-4 px-6 text-[13px] text-center font-bold text-gray-900">{item.cgpa}</td>
                <td className="py-4 px-6 text-[13px] text-center font-bold text-red-500">{item.backlogs}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.shortlisted ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {item.shortlisted ? 'Shortlisted' : 'Excluded'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <button onClick={() => handleManualToggle(item.id)} className="px-2 py-1 text-[11px] font-bold bg-[#0A6C54] text-white rounded hover:bg-[#085a46] flex items-center gap-1">
                    {item.shortlisted ? 'Exclude' : 'Shortlist'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EligibilityShortlisting;
