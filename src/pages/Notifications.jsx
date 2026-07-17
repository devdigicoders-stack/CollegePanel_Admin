import React, { useState } from 'react';
import { Plus, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('Announcements');

  const notifications = [
    { id: 1, title: 'Holiday on 20th May 2024', audience: 'All Students', date: '16/05/2024', status: 'Published' },
    { id: 2, title: 'Internal Practical Exam Schedule', audience: 'CE 4th Semester', date: '15/05/2024', status: 'Published' },
    { id: 3, title: 'Fee Payment Reminder', audience: 'All Students', date: '14/05/2024', status: 'Published' },
    { id: 4, title: 'Library Timings Update', audience: 'All Students', date: '13/05/2024', status: 'Draft' },
    { id: 5, title: 'Workshop on AI & ML', audience: 'CE Students', date: '12/05/2024', status: 'Published' },
  ];

  return (
    <div className="font-['Inter'] flex flex-col gap-6">
      
      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-200">
        {['Announcements', 'SMS / Email', 'Notification History'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[14px] font-medium transition-colors relative ${
              activeTab === tab 
                ? 'text-[#0A6C54]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0A6C54] rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col">
        
        {/* Top Actions */}
        <div className="p-6 flex justify-end items-center border-b border-gray-100">
          <button className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors shadow-sm">
            <Plus size={16} />
            New Announcement
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[12px] font-semibold text-gray-600">#</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-gray-600">Title</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-gray-600">Audience</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-gray-600">Published On</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {notifications.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-[13px] text-gray-800 font-medium">{item.id}</td>
                  <td className="px-6 py-4 text-[13px] text-gray-800">{item.title}</td>
                  <td className="px-6 py-4 text-[13px] text-gray-600">{item.audience}</td>
                  <td className="px-6 py-4 text-[13px] text-gray-600">{item.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                      item.status === 'Published' 
                        ? 'bg-green-50 text-green-600 border border-green-100' 
                        : 'bg-orange-50 text-orange-600 border border-orange-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye size={18} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[13px] text-gray-500">Showing 1 to 5 of 25 entries</p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0A6C54] text-white font-medium text-[13px]">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-[13px] font-medium">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-[13px] font-medium">
              3
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-[13px] font-medium">
              4
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-[13px] font-medium">
              5
            </button>
            <span className="text-gray-400 mx-1">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Notifications;
