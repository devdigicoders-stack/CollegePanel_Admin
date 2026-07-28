import React, { useState } from 'react';
import { Edit, Trash2, ChevronRight, Plus } from 'lucide-react';

const Academics = () => {
  const [activeMenu, setActiveMenu] = useState('Departments');

  const sideMenu = [
    { name: 'Departments' },
    { name: 'Courses' },
    { name: 'Semesters' },
    { name: 'Subjects' },
    { name: 'Sections' },
  ];

  const tableData = [
    { id: 1, name: 'Computer Engineering', hod: 'Dr. Neha Verma', code: 'CE', status: 'Active', statusColor: 'text-[#15803d] bg-[#dcfce3]' },
    { id: 2, name: 'Electrical Engineering', hod: 'Mr. Amit Gupta', code: 'EE', status: 'Active', statusColor: 'text-[#15803d] bg-[#dcfce3]' },
    { id: 3, name: 'Mechanical Engineering', hod: 'Mr. Pankaj Sahu', code: 'ME', status: 'Active', statusColor: 'text-[#15803d] bg-[#dcfce3]' },
    { id: 4, name: 'Civil Engineering', hod: 'Dr. Sunil Yadav', code: 'CV', status: 'Active', statusColor: 'text-[#15803d] bg-[#dcfce3]' },
    { id: 5, name: 'Applied Science', hod: 'Dr. Ritu Sharma', code: 'AS', status: 'Active', statusColor: 'text-[#15803d] bg-[#dcfce3]' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col md:flex-row h-full font-['Inter']">
      
      {/* Inner Sidebar */}
      <div className="w-full md:w-[240px] border-b md:border-b-0 md:border-r border-gray-100 py-2 md:py-4 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible flex-shrink-0 custom-scrollbar">
        {sideMenu.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveMenu(item.name)}
            className={`w-auto md:w-full flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-2.5 md:py-3.5 transition-colors text-left mx-2 md:mx-0 rounded-full md:rounded-none md:rounded-r-full ${
              activeMenu === item.name 
                ? 'bg-[#0A6C54] text-white font-medium' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium'
            }`}
          >
            <span className="text-[13px] md:text-[14px] whitespace-nowrap">{item.name}</span>
            <ChevronRight size={16} className={`hidden md:block ${activeMenu === item.name ? 'text-white' : 'text-gray-400'}`} />
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header inside content */}
        <div className="flex items-center justify-between p-6">
          <h2 className="text-[18px] font-bold text-[#0A6C54] font-['Outfit']">{activeMenu}</h2>
          <button className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors shadow-sm font-['Inter']">
            <Plus size={16} strokeWidth={2.5} />
            Add {activeMenu.slice(0, -1)}
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto px-6 pb-6">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#F9FAFB] border-y border-gray-100">
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[8%] rounded-tl-xl">#</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[25%]">Department Name</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[22%]">HOD</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Short Code</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Status</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%] text-center rounded-tr-xl">Action</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{row.id}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-medium">{row.name}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{row.hod}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{row.code}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-3">
                      <button className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
                        <Edit size={14} strokeWidth={2} />
                      </button>
                      <button className="w-8 h-8 rounded border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm bg-red-50/50">
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Academics;
