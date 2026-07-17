import { Plus, Search, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Edit, Trash2 } from 'lucide-react';

const Employees = () => {
  // Dummy data for employees table
  const tableData = [
    { id: 1, empId: 'EMP2024001', name: 'Ramesh Patel', role: 'Accountant', dept: 'Accounts', mobile: '9876543220', status: 'Active', statusColor: 'text-green-700 bg-green-50' },
    { id: 2, empId: 'EMP2024002', name: 'Suresh Kumar', role: 'Clerk', dept: 'Administration', mobile: '9876543221', status: 'Active', statusColor: 'text-green-700 bg-green-50' },
    { id: 3, empId: 'EMP2024003', name: 'Priya Sharma', role: 'Librarian', dept: 'Library', mobile: '9876543222', status: 'Active', statusColor: 'text-green-700 bg-green-50' },
    { id: 4, empId: 'EMP2024004', name: 'Amit Singh', role: 'Lab Assistant', dept: 'Computer Engg.', mobile: '9876543223', status: 'On Leave', statusColor: 'text-orange-700 bg-orange-50' },
    { id: 5, empId: 'EMP2024005', name: 'Vikash Rao', role: 'Peon', dept: 'Support Staff', mobile: '9876543224', status: 'Inactive', statusColor: 'text-red-700 bg-red-50' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Header / Title area inside page */}
      <div className="flex items-center justify-between p-6 pb-2">
        <h2 className="text-[20px] font-bold text-[#022A36] font-['Outfit']">All Employees List</h2>
      </div>

      {/* Filters Top Row */}
      <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-gray-50 pt-2">
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
              <option>All Roles</option>
              <option>Accountant</option>
              <option>Clerk</option>
              <option>Librarian</option>
              <option>Lab Assistant</option>
              <option>Support Staff</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative flex-1 md:flex-none">
            <select className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
              <option>All Departments</option>
              <option>Administration</option>
              <option>Accounts</option>
              <option>Library</option>
              <option>Computer Engg.</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative flex-1 md:flex-none">
            <select className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
              <option>Status</option>
              <option>Active</option>
              <option>On Leave</option>
              <option>Inactive</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        <button className="w-full md:w-auto bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm">
          <Plus size={16} strokeWidth={2.5} />
          Add Employee
        </button>
      </div>

      {/* Filters Bottom Row */}
      <div className="px-5 py-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border-b border-gray-50">
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by name or employee ID" 
            className="w-full bg-white border border-gray-200 text-gray-700 py-2 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] placeholder:text-gray-400 shadow-sm"
          />
        </div>
        
        <div className="relative w-full sm:w-auto">
          <select className="appearance-none w-full sm:w-auto bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm">
            <option>Export</option>
            <option>Export to CSV</option>
            <option>Export to Excel</option>
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
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[12%]">Employee ID</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[18%]">Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%]">Role</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[18%]">Department</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[12%]">Mobile</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[10%]">Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[10%] text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.id}</td>
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54] cursor-pointer hover:underline">{row.empId}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-medium">{row.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{row.role}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.dept}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.mobile}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${row.statusColor}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-3">
                    <button className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                      <Edit size={14} strokeWidth={2} />
                    </button>
                    <button className="w-7 h-7 rounded border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors bg-red-50/50">
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
      <div className="flex flex-col sm:flex-row justify-between items-center p-5 border-t border-gray-100 gap-4">
        <div className="text-[13px] text-gray-500 font-medium">
          Showing 1 to 5 of 84 entries
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
          <div className="w-8 h-8 flex items-center justify-center text-gray-400">
            <MoreHorizontal size={16} />
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-gray-600 hover:bg-gray-50 font-medium text-[13px] transition-colors">
            17
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Employees;
