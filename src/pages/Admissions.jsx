import React, { useState } from 'react';
import { Search, Plus, Edit2, Eye, MoreVertical, ChevronDown, Download, Filter, Phone, MessageSquare, Calendar, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

const Admissions = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Dashboard Stats
  const stats = [
    { label: 'Total Enquiries', value: '1,245', icon: 'Users', color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'New Enquiries Today', value: '23', icon: 'TrendingUp', color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Pending Follow-ups', value: '156', icon: 'Clock', color: 'bg-orange-50', iconColor: 'text-orange-500' },
    { label: 'Total Applications', value: '892', icon: 'FileText', color: 'bg-purple-50', iconColor: 'text-purple-500' },
    { label: 'Pending Applications', value: '234', icon: 'AlertCircle', color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { label: 'Approved Admissions', value: '567', icon: 'CheckCircle', color: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    { label: 'Rejected Applications', value: '45', icon: 'XCircle', color: 'bg-red-50', iconColor: 'text-red-500' },
    { label: 'Document Verification Pending', value: '89', icon: 'FileText', color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    { label: 'Fee Pending Admissions', value: '123', icon: 'DollarSign', color: 'bg-pink-50', iconColor: 'text-pink-500' },
    { label: 'Available Seats', value: '234', icon: 'Zap', color: 'bg-cyan-50', iconColor: 'text-cyan-500' },
    { label: 'Cancelled Admissions', value: '12', icon: 'XCircle', color: 'bg-rose-50', iconColor: 'text-rose-500' },
  ];

  // Enquiries Data
  const enquiries = [
    { id: 1, enquiryNo: 'ENQ/2024/001', name: 'Aarav Singh', mobile: '9876543210', email: 'aarav@email.com', course: 'Diploma in CE', source: 'Website', date: '2024-02-15', counsellor: 'Mr. Sharma', status: 'Interested' },
    { id: 2, enquiryNo: 'ENQ/2024/002', name: 'Neha Verma', mobile: '9876543211', email: 'neha@email.com', course: 'Diploma in IT', source: 'Phone Call', date: '2024-02-14', counsellor: 'Ms. Patel', status: 'Follow-up' },
    { id: 3, enquiryNo: 'ENQ/2024/003', name: 'Vikram Patel', mobile: '9876543212', email: 'vikram@email.com', course: 'Diploma in ME', source: 'Walk-in', date: '2024-02-13', counsellor: 'Mr. Kumar', status: 'New' },
  ];

  // Follow-ups Data
  const followUps = [
    { id: 1, followUpNo: 'FUP/2024/001', studentName: 'Aarav Singh', mobile: '9876543210', course: 'Diploma in CE', followUpDate: '2024-02-15', callStatus: 'Interested', counsellor: 'Mr. Sharma', nextFollowUp: '2024-02-20', interestLevel: 'Very High' },
    { id: 2, followUpNo: 'FUP/2024/002', studentName: 'Neha Verma', mobile: '9876543211', course: 'Diploma in IT', followUpDate: '2024-02-14', callStatus: 'Call Later', counsellor: 'Ms. Patel', nextFollowUp: '2024-02-18', interestLevel: 'High' },
  ];

  // Applications Data
  const applications = [
    { id: 1, appNo: 'APP/2024/001', studentName: 'Aarav Singh', mobile: '9876543210', course: 'Diploma in CE', appDate: '2024-02-15', appFee: 'Paid', status: 'Pending Verification', documents: '8/10' },
    { id: 2, appNo: 'APP/2024/002', studentName: 'Neha Verma', mobile: '9876543211', course: 'Diploma in IT', appDate: '2024-02-14', appFee: 'Paid', status: 'Verified', documents: '10/10' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      'New': 'bg-blue-100 text-blue-700',
      'Contacted': 'bg-purple-100 text-purple-700',
      'Interested': 'bg-green-100 text-green-700',
      'Follow-up': 'bg-orange-100 text-orange-700',
      'Not Interested': 'bg-red-100 text-red-700',
      'Converted': 'bg-emerald-100 text-emerald-700',
      'Pending Verification': 'bg-orange-100 text-orange-700',
      'Verified': 'bg-blue-100 text-blue-700',
      'Approved': 'bg-green-100 text-green-700',
      'Rejected': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const tabs = ['Dashboard', 'Enquiries', 'Follow-ups', 'Applications', 'New Admission', 'Document Verification', 'Student Registration', 'Seat Management', 'Admission Approval', 'Admission Cancellation', 'Reports'];

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Tabs */}
      <div className="flex overflow-x-auto px-6 border-b border-gray-100 pt-2 flex-shrink-0 custom-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 md:px-6 py-4 whitespace-nowrap text-[13px] md:text-[14px] font-semibold transition-colors relative ${
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

      {/* Dashboard Tab */}
      {activeTab === 'Dashboard' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] text-gray-600 font-medium mb-1">{stat.label}</p>
                    <h3 className="text-[24px] font-bold text-gray-800">{stat.value}</h3>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <div className={`${stat.iconColor} text-xl`}>📊</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enquiries Tab */}
      {activeTab === 'Enquiries' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex gap-4">
            <input type="text" placeholder="Search..." className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px]" />
            <button className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2">
              <Plus size={18} /> Add Enquiry
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-100">
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Enquiry No.</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Name</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Mobile</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Course</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Source</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Status</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map(enquiry => (
                  <tr key={enquiry.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{enquiry.enquiryNo}</td>
                    <td className="py-3 px-4 text-[13px] font-medium text-gray-800">{enquiry.name}</td>
                    <td className="py-3 px-4 text-[13px] text-gray-600">{enquiry.mobile}</td>
                    <td className="py-3 px-4 text-[13px] text-gray-600">{enquiry.course}</td>
                    <td className="py-3 px-4 text-[13px] text-gray-600">{enquiry.source}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${getStatusColor(enquiry.status)}`}>
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg"><Eye size={16} className="text-gray-600" /></button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg"><Edit2 size={16} className="text-gray-600" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Follow-ups Tab */}
      {activeTab === 'Follow-ups' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex gap-4">
            <input type="text" placeholder="Search..." className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px]" />
            <button className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2">
              <Plus size={18} /> Add Follow-up
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-100">
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Follow-up No.</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Student Name</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Course</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Call Status</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Interest Level</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Next Follow-up</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {followUps.map(followUp => (
                  <tr key={followUp.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{followUp.followUpNo}</td>
                    <td className="py-3 px-4 text-[13px] font-medium text-gray-800">{followUp.studentName}</td>
                    <td className="py-3 px-4 text-[13px] text-gray-600">{followUp.course}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${getStatusColor(followUp.callStatus)}`}>
                        {followUp.callStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[13px] text-gray-600">{followUp.interestLevel}</td>
                    <td className="py-3 px-4 text-[13px] text-gray-600">{followUp.nextFollowUp}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg"><Eye size={16} className="text-gray-600" /></button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg"><Edit2 size={16} className="text-gray-600" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'Applications' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex gap-4">
            <input type="text" placeholder="Search..." className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px]" />
            <button className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2">
              <Plus size={18} /> New Application
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-100">
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">App No.</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Student Name</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Course</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">App Fee</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Documents</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Status</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{app.appNo}</td>
                    <td className="py-3 px-4 text-[13px] font-medium text-gray-800">{app.studentName}</td>
                    <td className="py-3 px-4 text-[13px] text-gray-600">{app.course}</td>
                    <td className="py-3 px-4 text-[13px] font-semibold text-green-600">{app.appFee}</td>
                    <td className="py-3 px-4 text-[13px] text-gray-600">{app.documents}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg"><Eye size={16} className="text-gray-600" /></button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg"><Edit2 size={16} className="text-gray-600" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Other Tabs - Coming Soon */}
      {['New Admission', 'Document Verification', 'Student Registration', 'Seat Management', 'Admission Approval', 'Admission Cancellation', 'Reports'].includes(activeTab) && (
        <div className="flex-1 flex items-center justify-center text-gray-500 font-medium">
          {activeTab} - Coming Soon
        </div>
      )}
    </div>
  );
};

export default Admissions;
