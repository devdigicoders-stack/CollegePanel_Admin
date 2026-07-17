import React from 'react';
import { 
  Search, ChevronDown, Eye, ChevronLeft, ChevronRight, MoreHorizontal, Plus 
} from 'lucide-react';

const Students = () => {
  const tableData = [
    { id: 1, enrollNo: 'OP/23/CE/001', name: 'Aarav Singh', dept: 'Computer Engg.', sem: '4th', section: 'A', mobile: '9876543210', status: 'Active', statusColor: 'text-green-700 bg-green-50' },
    { id: 2, enrollNo: 'OP/23/CE/002', name: 'Neha Verma', dept: 'Computer Engg.', sem: '4th', section: 'A', mobile: '9876543211', status: 'Active', statusColor: 'text-green-700 bg-green-50' },
    { id: 3, enrollNo: 'OP/23/EE/015', name: 'Rohan Kumar', dept: 'Electrical Engg.', sem: '4th', section: 'B', mobile: '9876543212', status: 'Active', statusColor: 'text-green-700 bg-green-50' },
    { id: 4, enrollNo: 'OP/23/ME/021', name: 'Pooja Sahu', dept: 'Mechanical Engg.', sem: '2nd', section: 'A', mobile: '9876543213', status: 'Active', statusColor: 'text-green-700 bg-green-50' },
    { id: 5, enrollNo: 'OP/23/CE/045', name: 'Vikram Patel', dept: 'Computer Engg.', sem: '2nd', section: 'B', mobile: '9876543214', status: 'Inactive', statusColor: 'text-red-700 bg-red-50' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Filters Top Row */}
      <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-gray-50">
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
              <option>All Departments</option>
              <option>Computer Engg.</option>
              <option>Electrical Engg.</option>
              <option>Mechanical Engg.</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative flex-1 md:flex-none">
            <select className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
              <option>All Semesters</option>
              <option>1st Semester</option>
              <option>2nd Semester</option>
              <option>3rd Semester</option>
              <option>4th Semester</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative flex-1 md:flex-none">
            <select className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
              <option>All Sections</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative flex-1 md:flex-none">
            <select className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
              <option>Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        <button className="w-full md:w-auto bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors">
          <Plus size={16} strokeWidth={2.5} />
          Add Student
        </button>
      </div>

      {/* Filters Bottom Row */}
      <div className="px-5 py-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border-b border-gray-50">
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by name or enrollment no." 
            className="w-full bg-white border border-gray-200 text-gray-700 py-2 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] placeholder:text-gray-400 shadow-sm"
          />
        </div>
        
        <div className="relative w-full sm:w-auto">
          <select className="appearance-none w-full sm:w-auto bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm">
            <option>Export</option>
            <option>Export to CSV</option>
            <option>Export to Excel</option>
            <option>Export to PDF</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[5%]">#</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%]">Enrollment No.</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[18%]">Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[18%]">Department</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[10%]">Semester</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[8%]">Section</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[12%]">Mobile</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[8%]">Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[6%] text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.id}</td>
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54] cursor-pointer hover:underline">{row.enrollNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-medium">{row.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.dept}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.sem}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.section}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.mobile}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${row.statusColor}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center">
                    <button className="text-gray-400 hover:text-[#0A6C54] transition-colors p-1">
                      <Eye size={18} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-5 border-t border-gray-100 gap-4">
        <div className="text-[13px] text-gray-500 font-medium">
          Showing 1 to 5 of 3,245 entries
        </div>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0A6C54] text-white font-semibold text-[13px] transition-colors">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-gray-600 hover:bg-gray-50 font-medium text-[13px] transition-colors">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-gray-600 hover:bg-gray-50 font-medium text-[13px] transition-colors">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-gray-600 hover:bg-gray-50 font-medium text-[13px] transition-colors">
            4
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-gray-600 hover:bg-gray-50 font-medium text-[13px] transition-colors">
            5
          </button>
          <div className="w-8 h-8 flex items-center justify-center text-gray-400">
            <MoreHorizontal size={16} />
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-gray-600 hover:bg-gray-50 font-medium text-[13px] transition-colors">
            649
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Students;
