import React, { useState } from 'react';
import { 
  Search, ChevronDown, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, MoreHorizontal 
} from 'lucide-react';

const Admissions = () => {
  const [activeTab, setActiveTab] = useState('Enquiry');

  const tabs = [
    { name: 'Enquiry', count: 263 },
    { name: 'Application', count: 192 },
    { name: 'Document Verification', count: 86 },
    { name: 'Admitted', count: 122 },
    { name: 'Cancelled', count: 23 },
  ];

  const tableData = [
    { id: 1, appNo: 'APP2024001', name: 'Ritesh Kumar', course: 'Diploma in CE', mobile: '9876543201', stage: 'Enquiry', status: 'New', statusColor: 'text-[#0ea5e9] bg-[#e0f2fe]' },
    { id: 2, appNo: 'APP2024002', name: 'Anjali Gupta', course: 'Diploma in CE', mobile: '9876543202', stage: 'Application', status: 'In Progress', statusColor: 'text-[#0f766e] bg-[#ccfbf1]' },
    { id: 3, appNo: 'APP2024003', name: 'Mohit Yadav', course: 'Diploma in ME', mobile: '9876543203', stage: 'Doc Verification', status: 'Pending', statusColor: 'text-[#d97706] bg-[#fef3c7]' },
    { id: 4, appNo: 'APP2024004', name: 'Simran Kaur', course: 'Diploma in CE', mobile: '9876543204', stage: 'Admitted', status: 'Confirmed', statusColor: 'text-[#15803d] bg-[#dcfce3]' },
    { id: 5, appNo: 'APP2024005', name: 'Karan Singh', course: 'Diploma in CE', mobile: '9876543205', stage: 'Application', status: 'In Progress', statusColor: 'text-[#0f766e] bg-[#ccfbf1]' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Tabs */}
      <div className="flex px-6 pt-2 border-b border-gray-100 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`whitespace-nowrap px-4 py-4 text-[14px] font-semibold transition-all relative ${
              activeTab === tab.name 
                ? 'text-[#0A6C54]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.name} ({tab.count})
            {activeTab === tab.name && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="p-5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative">
            <select className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer w-full sm:w-auto">
              <option>All Courses</option>
              <option>Diploma in CE</option>
              <option>Diploma in ME</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative">
            <select className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer w-full sm:w-auto">
              <option>All Status</option>
              <option>New</option>
              <option>In Progress</option>
              <option>Pending</option>
              <option>Confirmed</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
          
          <div className="hidden md:block">
             <input type="date" className="bg-[#F9FAFB] border border-gray-200 text-gray-500 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] w-[140px]" />
          </div>
        </div>

        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by name or mobile" 
            className="w-full sm:w-[260px] bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-[#F9FAFB] border-y border-gray-100">
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[5%]">#</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Application No.</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[18%]">Name</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Course</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[12%]">Mobile</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Current Stage</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%]">Status</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%]">Action</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.id}</td>
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54] cursor-pointer hover:underline">{row.appNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-medium">{row.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.course}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.mobile}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.stage}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide ${row.statusColor}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full border border-green-100 flex items-center justify-center text-[#0A6C54] hover:bg-green-50 transition-colors">
                      <Eye size={14} strokeWidth={2} />
                    </button>
                    <button className="w-8 h-8 rounded-full border border-green-100 flex items-center justify-center text-[#0A6C54] hover:bg-green-50 transition-colors">
                      <Edit size={14} strokeWidth={2} />
                    </button>
                    <button className="w-8 h-8 rounded-full border border-green-100 flex items-center justify-center text-[#0A6C54] hover:bg-green-50 transition-colors">
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-gray-100 gap-4">
        <div className="text-[13px] text-gray-500 font-medium">
          Showing 1 to 5 of 263 entries
        </div>
        <div className="flex items-center gap-1.5">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300">
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0A6C54] text-white font-medium text-[13px]">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-[13px]">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-[13px]">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-[13px]">
            4
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-[13px]">
            5
          </button>
          <div className="w-8 h-8 flex items-center justify-center text-gray-400">
            <MoreHorizontal size={16} />
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Admissions;
