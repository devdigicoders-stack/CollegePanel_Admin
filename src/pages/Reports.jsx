import React, { useState } from 'react';
import { 
  FileText, ClipboardCheck, Wallet, UserSquare2, 
  Users, Building2, Library, UserPlus, Headset
} from 'lucide-react';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('All Reports');

  const tabs = [
    'All Reports', 'Students', 'Academics', 'Attendance', 
    'Fees', 'Examination', 'Library', 'Hostel', 'Employees'
  ];

  const reportCards = [
    { title: 'Student Report', icon: UserSquare2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Attendance Report', icon: ClipboardCheck, color: 'text-[#0A6C54]', bg: 'bg-[#0A6C54]/10' },
    { title: 'Fees Collection Report', icon: Wallet, color: 'text-[#0A6C54]', bg: 'bg-[#0A6C54]/10' },
    { title: 'Exam Result Report', icon: FileText, color: 'text-[#0A6C54]', bg: 'bg-[#0A6C54]/10' },
    { title: 'Employee Report', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Staff Report', icon: Headset, color: 'text-[#0A6C54]', bg: 'bg-[#0A6C54]/10' },
    { title: 'Hostel Report', icon: Building2, color: 'text-[#0A6C54]', bg: 'bg-[#0A6C54]/10' },
    { title: 'Library Report', icon: Library, color: 'text-[#0A6C54]', bg: 'bg-[#0A6C54]/10' },
    { title: 'Admission Report', icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="flex flex-col h-full font-['Inter']">
      
      {/* Title Area */}
      <div className="mb-4">
        <h2 className="text-[20px] font-bold text-[#022A36] font-['Outfit']">Reports</h2>
        <p className="text-[13px] text-gray-500 mt-1">Reports &gt; All Reports</p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col flex-1 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex px-6 border-b border-gray-100 flex-shrink-0 overflow-x-auto custom-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-4 text-[13px] font-semibold whitespace-nowrap transition-colors relative ${
                activeTab === tab 
                  ? 'text-[#0A6C54]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-md"></div>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {activeTab === 'All Reports' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              
              {reportCards.map((report, index) => {
                const Icon = report.icon;
                return (
                  <button 
                    key={index}
                    className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-4 group h-[160px]"
                  >
                    <div className={`w-14 h-14 rounded-2xl ${report.bg} ${report.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon size={28} strokeWidth={2} />
                    </div>
                    <span className="text-[13px] font-bold text-[#022A36] text-center px-2">
                      {report.title}
                    </span>
                  </button>
                );
              })}

            </div>
          )}

          {activeTab !== 'All Reports' && (
            <div className="flex items-center justify-center h-full text-gray-500 font-medium">
              {activeTab} reports are currently under development.
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Reports;
