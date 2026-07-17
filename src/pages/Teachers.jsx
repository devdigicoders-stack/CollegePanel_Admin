import React, { useState } from 'react';
import { Copy, Plus, Search, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';

const Teachers = () => {
  const [isCreating, setIsCreating] = useState(false);

  // Dummy data for teachers table
  const tableData = [
    { id: 1, empId: 'EMP2024001', name: 'Dr. Rahul Sharma', designation: 'Assistant Professor', dept: 'Computer Engg.', mobile: '9876543210', status: 'Active', statusColor: 'text-green-700 bg-green-50' },
    { id: 2, empId: 'EMP2024002', name: 'Dr. Neha Verma', designation: 'Associate Professor', dept: 'Computer Engg.', mobile: '9876543211', status: 'Active', statusColor: 'text-green-700 bg-green-50' },
    { id: 3, empId: 'EMP2024003', name: 'Mr. Amit Gupta', designation: 'Assistant Professor', dept: 'Electrical Engg.', mobile: '9876543212', status: 'Active', statusColor: 'text-green-700 bg-green-50' },
    { id: 4, empId: 'EMP2024004', name: 'Mr. Pankaj Sahu', designation: 'Lecturer', dept: 'Mechanical Engg.', mobile: '9876543213', status: 'On Leave', statusColor: 'text-orange-700 bg-orange-50' },
    { id: 5, empId: 'EMP2024005', name: 'Dr. Sunil Yadav', designation: 'HOD', dept: 'Civil Engg.', mobile: '9876543214', status: 'Active', statusColor: 'text-green-700 bg-green-50' },
  ];

  if (isCreating) {
    return (
      <div className="flex flex-col h-full font-['Inter']">
        
        {/* Header for Form */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-gray-800 font-['Outfit']">Create New Employee</h2>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Left Column: Personal Information */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 sm:p-8 h-fit">
              <h3 className="text-[15px] font-bold text-[#0A6C54] mb-6">Personal Information</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Full Name<span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter full name"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Department<span className="text-red-500">*</span>
                  </label>
                  <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] appearance-none bg-white">
                    <option>Select Department</option>
                    <option>Computer Engineering</option>
                    <option>Electrical Engineering</option>
                    <option>Mechanical Engineering</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Date of Birth<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="date" 
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Gender<span className="text-red-500">*</span>
                    </label>
                    <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] appearance-none bg-white">
                      <option>Select Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    placeholder="Enter email address"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Mobile<span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter mobile number"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Employment Information */}
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 sm:p-8 h-fit">
                <h3 className="text-[15px] font-bold text-gray-800 mb-6">Employment Information</h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Designation<span className="text-red-500">*</span>
                    </label>
                    <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] appearance-none bg-white">
                      <option>Select Designation</option>
                      <option>Assistant Professor</option>
                      <option>Associate Professor</option>
                      <option>HOD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Date of Joining<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="date" 
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Employee ID
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. EMP2024001"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Pay Scale / Grade
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Level 10"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                    />
                  </div>
                </div>
              </div>

              {/* Login Credentials */}
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 sm:p-8 h-fit">
                <h3 className="text-[15px] font-bold text-[#0A6C54] mb-6">Login Credentials <span className="font-medium text-gray-500">(Auto Generated)</span></h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="w-20 text-[13px] font-semibold text-gray-700">Username</label>
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        readOnly
                        value="auto.generated"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-[13px] text-gray-500 bg-gray-50 outline-none pr-10"
                      />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#0A6C54] hover:bg-green-50 rounded-md transition-colors">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-20 text-[13px] font-semibold text-gray-700">Password</label>
                    <div className="flex-1 relative">
                      <input 
                        type="password" 
                        readOnly
                        value="**********"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-[13px] text-gray-500 bg-gray-50 outline-none pr-10"
                      />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#0A6C54] hover:bg-green-50 rounded-md transition-colors">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center cursor-pointer group">
                      <div className="relative flex items-center">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0A6C54] focus:ring-[#0A6C54] accent-[#0A6C54] cursor-pointer" />
                      </div>
                      <span className="ml-2 text-[13px] text-gray-600 font-medium group-hover:text-gray-800 transition-colors">Send credentials to email</span>
                    </label>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-4 flex items-center justify-end gap-3 pt-4">
          <button 
            onClick={() => setIsCreating(false)}
            className="px-5 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button className="px-5 py-2.5 text-[13px] font-semibold text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-sm">
            Save as Draft
          </button>
          <button className="px-6 py-2.5 text-[13px] font-semibold text-white bg-[#0A6C54] hover:bg-[#085a46] rounded-lg transition-colors shadow-sm">
            Create Employee
          </button>
        </div>

      </div>
    );
  }

  // --- Table View ---
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
              <option>All Designations</option>
              <option>Assistant Professor</option>
              <option>Associate Professor</option>
              <option>HOD</option>
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

        <button 
          onClick={() => setIsCreating(true)}
          className="w-full md:w-auto bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Teacher
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
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[18%]">Designation</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%]">Department</th>
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
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.designation}</td>
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
          Showing 1 to 5 of 156 entries
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
            32
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Teachers;
