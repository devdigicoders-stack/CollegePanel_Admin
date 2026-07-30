import React, { useState } from 'react';
import { Search, Plus, Edit2, Eye, MoreVertical, ChevronDown, Trash2 } from 'lucide-react';

const FeeStructure = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');

  const feeStructures = [
    { id: 1, course: 'Diploma in CE', semester: '1st', admissionFee: 5000, tuitionFee: 25000, registrationFee: 2000, examFee: 1500, labFee: 3000, total: 36500, installments: 2, dueDate: '2024-06-30' },
    { id: 2, course: 'Diploma in CE', semester: '2nd', admissionFee: 0, tuitionFee: 25000, registrationFee: 0, examFee: 1500, labFee: 3000, total: 29500, installments: 2, dueDate: '2024-12-31' },
    { id: 3, course: 'Diploma in IT', semester: '1st', admissionFee: 5000, tuitionFee: 28000, registrationFee: 2000, examFee: 1500, labFee: 4000, total: 40500, installments: 2, dueDate: '2024-06-30' },
    { id: 4, course: 'Diploma in IT', semester: '2nd', admissionFee: 0, tuitionFee: 28000, registrationFee: 0, examFee: 1500, labFee: 4000, total: 33500, installments: 2, dueDate: '2024-12-31' },
    { id: 5, course: 'Diploma in ME', semester: '1st', admissionFee: 5000, tuitionFee: 24000, registrationFee: 2000, examFee: 1500, labFee: 2500, total: 35000, installments: 2, dueDate: '2024-06-30' },
    { id: 6, course: 'Diploma in EE', semester: '1st', admissionFee: 5000, tuitionFee: 26000, registrationFee: 2000, examFee: 1500, labFee: 3500, total: 38000, installments: 2, dueDate: '2024-06-30' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Fee Structure Configuration</h2>
          <p className="text-[12px] text-gray-600 mt-1">Manage course-wise fee structure and components</p>
        </div>
        <button className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Plus size={18} /> Add Fee Structure
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by course, semester..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>

        <div className="relative">
          <select 
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option>All Courses</option>
            <option>Diploma in CE</option>
            <option>Diploma in IT</option>
            <option>Diploma in ME</option>
            <option>Diploma in EE</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto p-6">
        <table className="w-full text-left border-collapse min-w-[1400px]">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Course</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Semester</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-right">Admission Fee</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-right">Tuition Fee</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-right">Exam Fee</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-right">Lab Fee</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-right">Total</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Installments</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Due Date</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {feeStructures.map(fee => (
              <tr key={fee.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-[13px] font-medium text-gray-800">{fee.course}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{fee.semester}</td>
                <td className="py-3 px-4 text-[13px] text-right text-gray-600">₹{fee.admissionFee.toLocaleString()}</td>
                <td className="py-3 px-4 text-[13px] text-right text-gray-600">₹{fee.tuitionFee.toLocaleString()}</td>
                <td className="py-3 px-4 text-[13px] text-right text-gray-600">₹{fee.examFee.toLocaleString()}</td>
                <td className="py-3 px-4 text-[13px] text-right text-gray-600">₹{fee.labFee.toLocaleString()}</td>
                <td className="py-3 px-4 text-[13px] font-bold text-gray-800 text-right">₹{fee.total.toLocaleString()}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{fee.installments}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{fee.dueDate}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                      <Eye size={16} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                      <Edit2 size={16} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-[12px] text-gray-600">Showing 1 to 6 of 24 fee structures</p>
        <div className="flex gap-2">
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50">Previous</button>
          <button className="px-3 py-2 bg-[#0A6C54] text-white rounded-lg text-[12px] font-medium">1</button>
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50">2</button>
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default FeeStructure;
