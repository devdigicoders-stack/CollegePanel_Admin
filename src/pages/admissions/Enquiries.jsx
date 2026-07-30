import React, { useState } from 'react';
import { Search, Plus, Edit2, Eye, MoreVertical, ChevronDown, Download, X } from 'lucide-react';

const enquiriesData = [
  { id: 1, enquiryNo: 'ENQ/2024/001', name: 'Aarav Singh', mobile: '9876543210', email: 'aarav@email.com', parentName: 'Ramesh Singh', course: 'Diploma in CE', qualification: '10th Pass', city: 'Ahmedabad', source: 'Website', date: '2024-02-15', counsellor: 'Mr. Sharma', status: 'Interested' },
  { id: 2, enquiryNo: 'ENQ/2024/002', name: 'Neha Verma', mobile: '9876543211', email: 'neha@email.com', parentName: 'Suresh Verma', course: 'Diploma in IT', qualification: '10th Pass', city: 'Surat', source: 'Phone Call', date: '2024-02-14', counsellor: 'Ms. Patel', status: 'Follow-up' },
  { id: 3, enquiryNo: 'ENQ/2024/003', name: 'Vikram Patel', mobile: '9876543212', email: 'vikram@email.com', parentName: 'Dinesh Patel', course: 'Diploma in ME', qualification: '10th Pass', city: 'Vadodara', source: 'Walk-in', date: '2024-02-13', counsellor: 'Mr. Kumar', status: 'New' },
  { id: 4, enquiryNo: 'ENQ/2024/004', name: 'Muskan Jain', mobile: '9876543213', email: 'muskan@email.com', parentName: 'Rajesh Jain', course: 'Diploma in EE', qualification: '10th Pass', city: 'Rajkot', source: 'Social Media', date: '2024-02-12', counsellor: 'Ms. Singh', status: 'Contacted' },
  { id: 5, enquiryNo: 'ENQ/2024/005', name: 'Rohit Sharma', mobile: '9876543214', email: 'rohit@email.com', parentName: 'Mohan Sharma', course: 'Diploma in CE', qualification: '10th Pass', city: 'Gandhinagar', source: 'Referral', date: '2024-02-11', counsellor: 'Mr. Sharma', status: 'Converted' },
  { id: 6, enquiryNo: 'ENQ/2024/006', name: 'Priya Singh', mobile: '9876543215', email: 'priya@email.com', parentName: 'Anil Singh', course: 'Diploma in IT', qualification: '10th Pass', city: 'Anand', source: 'Education Fair', date: '2024-02-10', counsellor: 'Ms. Patel', status: 'Not Interested' },
  { id: 7, enquiryNo: 'ENQ/2024/007', name: 'Arjun Kumar', mobile: '9876543216', email: 'arjun@email.com', parentName: 'Vijay Kumar', course: 'Diploma in ME', qualification: '10th Pass', city: 'Bhavnagar', source: 'Advertisement', date: '2024-02-09', counsellor: 'Mr. Kumar', status: 'Interested' },
  { id: 8, enquiryNo: 'ENQ/2024/008', name: 'Sneha Patel', mobile: '9876543217', email: 'sneha@email.com', parentName: 'Haresh Patel', course: 'Diploma in EE', qualification: '10th Pass', city: 'Jamnagar', source: 'Website', date: '2024-02-08', counsellor: 'Ms. Singh', status: 'Follow-up' },
];

const statusColors = {
  'New': 'bg-blue-100 text-blue-700',
  'Contacted': 'bg-purple-100 text-purple-700',
  'Interested': 'bg-green-100 text-green-700',
  'Follow-up': 'bg-orange-100 text-orange-700',
  'Not Interested': 'bg-red-100 text-red-700',
  'Converted': 'bg-emerald-100 text-emerald-700',
  'Closed': 'bg-gray-100 text-gray-700',
};

const sourceColors = {
  'Website': 'bg-blue-50 text-blue-700',
  'Phone Call': 'bg-purple-50 text-purple-700',
  'Walk-in': 'bg-green-50 text-green-700',
  'Social Media': 'bg-pink-50 text-pink-700',
  'Referral': 'bg-orange-50 text-orange-700',
  'Education Fair': 'bg-indigo-50 text-indigo-700',
  'Advertisement': 'bg-yellow-50 text-yellow-700',
};

const Enquiries = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const filtered = enquiriesData.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.mobile.includes(search) || e.enquiryNo.includes(search);
    const matchStatus = filterStatus === 'All' || e.status === filterStatus;
    const matchSource = filterSource === 'All' || e.source === filterSource;
    return matchSearch && matchStatus && matchSource;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Enquiries</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Manage prospective student enquiries</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">
            <Download size={15} /> Export
          </button>
          <button onClick={() => setShowModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2">
            <Plus size={16} /> Add Enquiry
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search name, mobile, enquiry no..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
        <div className="relative">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
            <option>All</option>
            {Object.keys(statusColors).map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
        <div className="relative">
          <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
            <option>All</option>
            {Object.keys(sourceColors).map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              {['Enquiry No.','Student Name','Mobile','Course','Source','Counsellor','Date','Status','Actions'].map(h => (
                <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{e.enquiryNo}</td>
                <td className="py-3 px-4">
                  <p className="text-[13px] font-medium text-gray-800">{e.name}</p>
                  <p className="text-[11px] text-gray-500">{e.email}</p>
                </td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{e.mobile}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{e.course}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${sourceColors[e.source] || 'bg-gray-100 text-gray-700'}`}>{e.source}</span>
                </td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{e.counsellor}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{e.date}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[e.status] || 'bg-gray-100 text-gray-700'}`}>{e.status}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={15} className="text-gray-500" /></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit2 size={15} className="text-gray-500" /></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg"><MoreVertical size={15} className="text-gray-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-[12px] text-gray-500">Showing {filtered.length} of 1,245 enquiries</p>
        <div className="flex gap-2">
          {['Prev','1','2','3','Next'].map(p => (
            <button key={p} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium ${p === '1' ? 'bg-[#0A6C54] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* Add Enquiry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">Add New Enquiry</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Student Name', placeholder: 'Enter student name' },
                { label: 'Mobile Number', placeholder: 'Enter mobile number' },
                { label: 'Email', placeholder: 'Enter email address' },
                { label: 'Parent Name', placeholder: 'Enter parent name' },
                { label: 'City', placeholder: 'Enter city' },
                { label: 'Previous Qualification', placeholder: 'e.g. 10th Pass' },
              ].map(field => (
                <div key={field.label}>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{field.label}</label>
                  <input type="text" placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
                </div>
              ))}
              {[
                { label: 'Course Interested', options: ['Diploma in CE', 'Diploma in IT', 'Diploma in ME', 'Diploma in EE'] },
                { label: 'Enquiry Source', options: ['Website', 'Phone Call', 'Walk-in', 'Social Media', 'Referral', 'Education Fair', 'Advertisement', 'Other'] },
                { label: 'Assigned Counsellor', options: ['Mr. Sharma', 'Ms. Patel', 'Mr. Kumar', 'Ms. Singh'] },
                { label: 'Status', options: ['New', 'Contacted', 'Interested', 'Follow-up', 'Not Interested'] },
              ].map(field => (
                <div key={field.label}>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{field.label}</label>
                  <div className="relative">
                    <select className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                      {field.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  </div>
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Remarks</label>
                <textarea rows={3} placeholder="Add any remarks..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold">Save Enquiry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enquiries;
