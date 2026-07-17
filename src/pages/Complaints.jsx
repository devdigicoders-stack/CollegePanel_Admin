import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Search, Filter } from 'lucide-react';

const Complaints = () => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const complaints = [
    { id: 'CMP-1001', subject: 'Wifi not working in Boys Hostel block A', category: 'Hostel', submittedBy: 'Aarav Singh', date: '21-05-2024', status: 'Pending', statusColor: 'text-orange-600 bg-orange-50 border border-orange-100', description: 'The internet connection in Boys Hostel block A has been down since yesterday evening. Need urgent fix.' },
    { id: 'CMP-1002', subject: 'Water leakage in classroom 204', category: 'Maintenance', submittedBy: 'Faculty (Dr. Ritu)', date: '20-05-2024', status: 'In Progress', statusColor: 'text-blue-600 bg-blue-50 border border-blue-100', description: 'There is a continuous water leakage from the AC unit in classroom 204.' },
    { id: 'CMP-1003', subject: 'Incorrect marks in mid-sem results', category: 'Academics', submittedBy: 'Neha Verma', date: '19-05-2024', status: 'Resolved', statusColor: 'text-green-700 bg-green-50 border border-green-100', description: 'My marks for Engineering Mechanics are updated incorrectly on the portal. Please re-verify.' },
    { id: 'CMP-1004', subject: 'Library book return issue', category: 'Library', submittedBy: 'Rohit Kumar', date: '15-05-2024', status: 'Rejected', statusColor: 'text-red-600 bg-red-50 border border-red-100', description: 'I am being fined for a book that I already returned last week.' },
  ];

  return (
    <div className="flex flex-col h-full font-['Inter']">
      
      {/* Title Area */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-[20px] font-bold text-[#022A36] font-['Outfit']">
            {selectedComplaint ? 'Complaint Details' : 'Complaints'}
          </h2>
          <p className="text-[13px] text-gray-500 mt-1">
            {selectedComplaint ? 'Complaints > View Details' : 'Complaints > All Complaints'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col flex-1 overflow-hidden">
        
        {!selectedComplaint ? (
          <>
            {/* Top Bar Filter */}
            <div className="p-6 border-b border-gray-50 flex items-center justify-between gap-4">
              <div className="relative w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search complaints..." 
                  className="w-full bg-white border border-gray-200 text-gray-700 py-2 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] shadow-sm"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-[13px] font-semibold hover:bg-gray-50 transition-colors">
                <Filter size={16} />
                Filters
              </button>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-x-auto p-6 pt-2">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[#F9FAFB] border-y border-gray-100">
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%] rounded-tl-xl">ID</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[25%]">Subject</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Category</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Submitted By</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Date</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%]">Status</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%] text-center rounded-tr-xl">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((comp) => (
                    <tr key={comp.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 text-[13px] font-bold text-[#0A6C54]">{comp.id}</td>
                      <td className="py-4 px-6 text-[13px] font-medium text-[#022A36]">{comp.subject}</td>
                      <td className="py-4 px-6 text-[13px] font-medium text-gray-600">{comp.category}</td>
                      <td className="py-4 px-6 text-[13px] font-medium text-gray-600">{comp.submittedBy}</td>
                      <td className="py-4 px-6 text-[13px] font-medium text-gray-600">{comp.date}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide ${comp.statusColor}`}>
                          {comp.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => setSelectedComplaint(comp)}
                          className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-[#0A6C54] rounded-md transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-gray-100 bg-gray-50/30 mt-auto">
              <div className="text-[13px] text-gray-500 font-medium">
                Showing 1 to 4 of 4 entries
              </div>
              <div className="flex items-center gap-1 mt-4 sm:mt-0">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0A6C54] text-white font-semibold text-[13px] transition-colors">
                  1
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-[18px] font-bold text-[#022A36]">{selectedComplaint.subject}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[13px] text-gray-500 font-medium">Ticket: <span className="text-[#0A6C54] font-bold">{selectedComplaint.id}</span></span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="text-[13px] text-gray-500 font-medium">Date: {selectedComplaint.date}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${selectedComplaint.statusColor}`}>
                      {selectedComplaint.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-6 mb-8">
                <div className="grid grid-cols-2 gap-y-6">
                  <div>
                    <div className="text-[12px] font-semibold text-gray-400 mb-1">Submitted By</div>
                    <div className="text-[14px] font-medium text-[#022A36]">{selectedComplaint.submittedBy}</div>
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-gray-400 mb-1">Category</div>
                    <div className="text-[14px] font-medium text-[#022A36]">{selectedComplaint.category}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[12px] font-semibold text-gray-400 mb-1">Description</div>
                    <div className="text-[14px] font-medium text-gray-700 leading-relaxed bg-white p-4 border border-gray-100 rounded-lg mt-2">
                      {selectedComplaint.description}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                  Update Status
                </label>
                <select className="w-full sm:w-[300px] bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] shadow-sm">
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Rejected</option>
                </select>
              </div>

              <div className="mb-8">
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                  Admin Reply / Resolution Notes
                </label>
                <textarea 
                  placeholder="Write your response here..." 
                  className="w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] shadow-sm min-h-[120px] resize-none"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                <button 
                  onClick={() => setSelectedComplaint(null)}
                  className="px-6 py-2.5 text-[13px] font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                  Back to List
                </button>
                <button className="px-8 py-2.5 text-[13px] font-semibold text-white bg-[#0A6C54] hover:bg-[#085a46] rounded-lg transition-colors shadow-sm">
                  Submit Update
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Complaints;
