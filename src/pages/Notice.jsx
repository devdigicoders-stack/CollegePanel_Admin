import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const Notice = () => {
  const [isCreating, setIsCreating] = useState(false);

  const notices = [
    { id: 1, title: 'Internal Practical Exam Schedule', target: 'All Students', postedBy: 'Admin', postedOn: '20-05-2024', status: 'Published', statusColor: 'text-yellow-700 bg-yellow-50 border border-yellow-100' },
    { id: 2, title: 'Parent Teacher Meeting', target: 'All Parents', postedBy: 'Principal', postedOn: '19-05-2024', status: 'Published', statusColor: 'text-green-700 bg-green-50 border border-green-100' },
    { id: 3, title: 'Workshop on AI & ML', target: 'CE Students', postedBy: 'HOD CSE', postedOn: '18-05-2024', status: 'Published', statusColor: 'text-yellow-700 bg-yellow-50 border border-yellow-100' },
    { id: 4, title: 'College Annual Function', target: 'All Students', postedBy: 'Admin', postedOn: '15-05-2024', status: 'Draft', statusColor: 'text-red-600 bg-red-50 border border-red-100' },
  ];

  return (
    <div className="flex flex-col h-full font-['Inter']">
      
      {/* Title Area & Top Action */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-[20px] font-bold text-[#022A36] font-['Outfit']">
            {isCreating ? 'Create New Notice' : 'Notice Board'}
          </h2>
          <p className="text-[13px] text-gray-500 mt-1">
            {isCreating ? 'Notice Board > Create Notice' : 'Notice Board > All Notices'}
          </p>
        </div>
        
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={18} strokeWidth={2.5} />
            Create Notice
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col flex-1 overflow-hidden">
        
        {!isCreating ? (
          <>
            {/* Table Content */}
            <div className="flex-1 overflow-x-auto p-6">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#F9FAFB] border-y border-gray-100">
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[35%] rounded-tl-xl">Title</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Target Audience</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[20%]">Posted By</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Posted On</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%] rounded-tr-xl">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {notices.map((notice) => (
                    <tr key={notice.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-5 px-6 text-[13px] font-medium text-[#022A36]">{notice.title}</td>
                      <td className="py-5 px-6 text-[13px] font-medium text-gray-600">{notice.target}</td>
                      <td className="py-5 px-6 text-[13px] font-medium text-gray-600">{notice.postedBy}</td>
                      <td className="py-5 px-6 text-[13px] font-medium text-gray-600">{notice.postedOn}</td>
                      <td className="py-5 px-6">
                        <span className={`px-3 py-1 rounded-md text-[11px] font-bold tracking-wide ${notice.statusColor}`}>
                          {notice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-gray-100 bg-gray-50/30">
              <div className="text-[13px] text-gray-500 font-medium">
                Showing 1 to 4 of 8 entries
              </div>
              <div className="flex items-center gap-1 mt-4 sm:mt-0">
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
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            
            <h3 className="text-[16px] font-bold text-[#022A36] mb-6">Notice Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                    Notice Title <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter notice title" 
                    className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                    Target Audience <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm">
                      <option>All Students</option>
                      <option>All Staff</option>
                      <option>All Parents</option>
                      <option>Specific Department</option>
                      <option>Specific Course</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                    Date of Publishing
                  </label>
                  <input 
                    type="date" 
                    className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] shadow-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="h-full flex flex-col">
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                    Notice Details / Message <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    placeholder="Write your notice message here..." 
                    className="w-full flex-1 bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] shadow-sm min-h-[150px] resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
              <button 
                onClick={() => setIsCreating(false)}
                className="px-6 py-2.5 text-[13px] font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                Cancel
              </button>
              <button className="px-6 py-2.5 text-[13px] font-semibold text-[#0A6C54] bg-[#0A6C54]/10 hover:bg-[#0A6C54]/20 rounded-lg transition-colors">
                Save as Draft
              </button>
              <button className="px-8 py-2.5 text-[13px] font-semibold text-white bg-[#0A6C54] hover:bg-[#085a46] rounded-lg transition-colors shadow-sm">
                Publish Notice
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Notice;
