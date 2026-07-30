import React, { useState } from 'react';
import { Search, Save, Plus, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const initialStudents = [
  { id: 1, name: 'Aarav Singh', enrollNo: 'OP/23/CE/001', block: 'Block A (Boys)', preference: 'Veg', breakfast: 'Served', lunch: 'Pending', dinner: 'Pending' },
  { id: 2, name: 'Vikram Patel', enrollNo: 'OP/23/ME/015', block: 'Block A (Boys)', preference: 'Non-Veg', breakfast: 'Served', lunch: 'Served', dinner: 'Pending' },
  { id: 3, name: 'Neha Verma', enrollNo: 'OP/23/IT/002', block: 'Block C (Girls)', preference: 'Veg', breakfast: 'Skipped', lunch: 'Pending', dinner: 'Pending' },
  { id: 4, name: 'Aditi Rao', enrollNo: 'OP/23/CE/021', block: 'Block C (Girls)', preference: 'Veg', breakfast: 'Served', lunch: 'Served', dinner: 'Pending' },
];

const MealAttendance = () => {
  const [search, setSearch] = useState('');
  const [mealType, setMealType] = useState('Lunch');
  const [students, setStudents] = useState(initialStudents);

  const handleAction = (id, action) => {
    setStudents(students.map(s => {
      if (s.id === id) {
        if (mealType === 'Breakfast') return { ...s, breakfast: action };
        if (mealType === 'Lunch') return { ...s, lunch: action };
        return { ...s, dinner: action };
      }
      return s;
    }));
    toast.success(`Meal marked as ${action}`);
  };

  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.enrollNo.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Meal Attendance Logging</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Record breakfast, lunch, and dinner serving metrics per student</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Plus size={15} /> Guest Meal Entry
          </button>
          <button onClick={() => toast.success('Sheet locked and saved.')} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Save size={16} /> Save Daily Ledger
          </button>
        </div>
      </div>

      {/* Selectors */}
      <div className="p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">Select Current Meal Session</label>
          <select 
            value={mealType} 
            onChange={(e) => setMealType(e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none"
          >
            <option value="Breakfast">Breakfast Session</option>
            <option value="Lunch">Lunch Session</option>
            <option value="Dinner">Dinner Session</option>
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">Search Student Card</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search by student name or roll number..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Enrollment No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Hostel Block</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Dietary Preference</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Session Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const currentStatus = mealType === 'Breakfast' ? item.breakfast : mealType === 'Lunch' ? item.lunch : item.dinner;
              return (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.enrollNo}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{item.block}</td>
                  <td className="py-4 px-6 text-[13px] font-medium text-gray-600">{item.preference}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      currentStatus === 'Served' ? 'bg-green-50 text-green-700 border border-green-100' :
                      currentStatus === 'Skipped' ? 'bg-red-50 text-red-700 border border-red-100' :
                      'bg-yellow-50 text-yellow-700 border border-yellow-100'
                    }`}>
                      {currentStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex gap-2">
                    {currentStatus === 'Pending' && (
                      <>
                        <button onClick={() => handleAction(item.id, 'Served')} className="px-2 py-1 text-[11px] font-bold bg-[#0A6C54] text-white rounded hover:bg-[#085a46]">Served</button>
                        <button onClick={() => handleAction(item.id, 'Skipped')} className="px-2 py-1 text-[11px] font-bold bg-red-600 text-white rounded hover:bg-red-700">Skip</button>
                      </>
                    )}
                    {currentStatus !== 'Pending' && (
                      <span className="text-[12px] text-gray-400 italic font-medium">Logged</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MealAttendance;
