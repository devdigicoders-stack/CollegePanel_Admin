import React, { useState } from 'react';
import { Search, Download, Plus, Edit2, CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const initialEnquiries = [
  { id: 1, name: 'Sanjay Dutt', mobile: '9988776655', course: 'Diploma in Civil Engineering', source: 'Google Search', date: '2024-02-15', status: 'Pending Assignment' },
  { id: 2, name: 'Rita Roy', mobile: '9988776656', course: 'Diploma in Computer Science', source: 'Newspaper Ad', date: '2024-02-14', status: 'Assigned to Officer' },
];

const Enquiries = () => {
  const [search, setSearch] = useState('');
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEnquiry, setNewEnquiry] = useState({
    name: '',
    mobile: '',
    course: 'Diploma in Computer Science',
    source: 'Google Search',
    remarks: '',
  });

  const filtered = enquiries.filter(e => {
    return e.name.toLowerCase().includes(search.toLowerCase()) || 
           e.course.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddEnquiry = (e) => {
    e.preventDefault();
    const itemToAdd = {
      id: enquiries.length + 1,
      name: newEnquiry.name,
      mobile: newEnquiry.mobile,
      course: newEnquiry.course,
      source: newEnquiry.source,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending Assignment'
    };
    setEnquiries([...enquiries, itemToAdd]);
    setShowAddModal(false);
    toast.success(`Enquiry logged for ${newEnquiry.name}!`);
    setNewEnquiry({
      name: '',
      mobile: '',
      course: 'Diploma in Computer Science',
      source: 'Google Search',
      remarks: '',
    });
  };

  const handleAssignOfficer = (id) => {
    setEnquiries(enquiries.map(e => e.id === id ? { ...e, status: 'Assigned to Officer' } : e));
    toast.success('Enquiry ticket assigned to Admissions Office team!');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Admission & General Enquiries</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Record course enquiries, log lead sources, and assign tickets to admissions officer</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Enquiries
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Log Enquiry
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by student name or course..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Prospect Student</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Mobile No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 font-semibold">Course Preference</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Lead Source</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Date Logged</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 font-bold">Assign Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-mono">{item.mobile}</td>
                <td className="py-4 px-6 text-[13px] text-[#0A6C54] font-semibold">{item.course}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.source}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{item.date}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status.includes('Assigned') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {item.status === 'Pending Assignment' ? (
                    <button onClick={() => handleAssignOfficer(item.id)} className="px-2 py-1 text-[11px] font-bold bg-[#0A6C54] text-white rounded hover:bg-[#085a46] flex items-center gap-1">
                      Assign <ArrowRight size={12} />
                    </button>
                  ) : (
                    <span className="text-[12px] text-gray-400 font-medium italic">Dispatched</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Enquiry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Record Course Enquiry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddEnquiry} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Student Name</label>
                <input 
                  type="text" 
                  required
                  value={newEnquiry.name}
                  onChange={(e) => setNewEnquiry({...newEnquiry, name: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Mobile No</label>
                  <input 
                    type="text" 
                    required
                    value={newEnquiry.mobile}
                    onChange={(e) => setNewEnquiry({...newEnquiry, mobile: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Enquiry Source</label>
                  <select 
                    value={newEnquiry.source} 
                    onChange={(e) => setNewEnquiry({...newEnquiry, source: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Google Search">Google Search</option>
                    <option value="Newspaper Ad">Newspaper Ad</option>
                    <option value="Walk-In">Walk-In</option>
                    <option value="Reference">Reference</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Course Preference</label>
                <select 
                  value={newEnquiry.course} 
                  onChange={(e) => setNewEnquiry({...newEnquiry, course: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                >
                  <option value="Diploma in Computer Science">Diploma in Computer Science</option>
                  <option value="Diploma in Civil Engineering">Diploma in Civil Engineering</option>
                  <option value="Diploma in Mechanical Engineering">Diploma in Mechanical Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Remarks</label>
                <textarea 
                  value={newEnquiry.remarks}
                  onChange={(e) => setNewEnquiry({...newEnquiry, remarks: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
                >
                  Post Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enquiries;
