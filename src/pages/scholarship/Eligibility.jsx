import React, { useState } from 'react';
import { Search, Save, Filter, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialCandidates = [
  { id: 1, name: 'Amit Sharma', income: 180000, attendance: 82, cgpa: 8.8, status: 'Eligible' },
  { id: 2, name: 'Neha Verma', income: 300000, attendance: 65, cgpa: 7.9, status: 'Not Eligible' },
  { id: 3, name: 'Vikram Patel', income: 120000, attendance: 78, cgpa: 6.5, status: 'Eligible' },
];

const Eligibility = () => {
  const [maxIncome, setMaxIncome] = useState(250000);
  const [minAttendance, setMinAttendance] = useState(75);
  const [candidates, setCandidates] = useState(initialCandidates);

  const handleRunChecks = () => {
    setCandidates(candidates.map(c => {
      const incomeOk = c.income <= maxIncome;
      const attendanceOk = c.attendance >= minAttendance;
      const eligible = incomeOk && attendanceOk ? 'Eligible' : 'Not Eligible';
      return { ...c, status: eligible };
    }));
    toast.success('Eligibility algorithm executed for candidate registry.');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Eligibility Criteria Verification</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Configure algorithm thresholds for family income cutoffs and minimum class attendance ratios</p>
        </div>
        <button onClick={() => toast.success('Eligibility logs finalized.')} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-colors">
          Finalize Eligibility list
        </button>
      </div>

      {/* Selectors */}
      <div className="p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">Max Annual Family Income (₹)</label>
          <input 
            type="number" 
            value={maxIncome}
            onChange={(e) => setMaxIncome(parseInt(e.target.value))}
            className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">Min Attendance Required (%)</label>
          <input 
            type="number" 
            value={minAttendance}
            onChange={(e) => setMinAttendance(parseInt(e.target.value))}
            className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
          />
        </div>

        <div className="flex items-end">
          <button onClick={handleRunChecks} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-[13px] font-bold flex items-center justify-center gap-1">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Annual Income</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Class Attendance</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Academic CGPA</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">System Result</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                <td className="py-4 px-6 text-[13px] text-right font-bold text-gray-900">₹{item.income.toLocaleString()}</td>
                <td className="py-4 px-6 text-[13px] text-center font-semibold text-gray-700">{item.attendance}%</td>
                <td className="py-4 px-6 text-[13px] text-center font-bold text-gray-900">{item.cgpa}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Eligible' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Eligibility;
