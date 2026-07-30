import React, { useState } from 'react';
import { Search, Download, Plus, Calendar, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const initialInterviews = [
  { id: 1, studentName: 'Amit Sharma', company: 'Tata Consultancy Services', round: 'Technical Interview', time: '18-Feb 10:00 AM', mode: 'Online', link: 'https://teams.microsoft.com/l/meetup-join/19...', status: 'Scheduled' },
  { id: 2, studentName: 'Vikram Patel', company: 'Tata Consultancy Services', round: 'HR Interview', time: '18-Feb 11:30 AM', mode: 'Offline', room: 'Placement Cabin 2', status: 'Scheduled' },
  { id: 3, studentName: 'Aditi Rao', company: 'Cognizant Technology Solutions', round: 'Technical Interview', time: '22-Feb 02:00 PM', mode: 'Online', link: 'https://zoom.us/j/981273912', status: 'Scheduled' },
];

const Interviews = () => {
  const [search, setSearch] = useState('');
  const [interviews, setInterviews] = useState(initialInterviews);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInterview, setNewInterview] = useState({
    studentName: '',
    company: 'Tata Consultancy Services',
    round: 'Technical Interview',
    time: '',
    mode: 'Online',
    link: '',
  });

  const filtered = interviews.filter(i => {
    return i.studentName.toLowerCase().includes(search.toLowerCase()) || 
           i.company.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddInterview = (e) => {
    e.preventDefault();
    const itemToAdd = {
      id: interviews.length + 1,
      studentName: newInterview.studentName,
      company: newInterview.company,
      round: newInterview.round,
      time: newInterview.time,
      mode: newInterview.mode,
      link: newInterview.mode === 'Online' ? newInterview.link : '',
      room: newInterview.mode === 'Offline' ? newInterview.link : '',
      status: 'Scheduled'
    };
    setInterviews([...interviews, itemToAdd]);
    setShowAddModal(false);
    toast.success(`Interview scheduled for ${newInterview.studentName}!`);
    setNewInterview({
      studentName: '',
      company: 'Tata Consultancy Services',
      round: 'Technical Interview',
      time: '',
      mode: 'Online',
      link: '',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Interview Rounds Schedule</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Create online meeting links, log technical rounds, and coordinate GD rooms</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Plus size={16} /> Schedule Interview
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by student name or company name..." 
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
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Candidate Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Company</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Interview Round</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Date & Time</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Mode</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Location / Meeting Link</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.studentName}</td>
                <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.company}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.round}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{item.time}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{item.mode}</td>
                <td className="py-4 px-6 text-[13px]">
                  {item.mode === 'Online' ? (
                    <a href={item.link} target="_blank" rel="noreferrer" className="text-blue-600 flex items-center gap-1 hover:underline font-mono text-[11px]">
                      Join Link <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="font-semibold text-gray-700">{item.room}</span>
                  )}
                </td>
                <td className="py-4 px-6 text-[13px]">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Interview Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Schedule Interview Round</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddInterview} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Student Name</label>
                <input 
                  type="text" 
                  required
                  value={newInterview.studentName}
                  onChange={(e) => setNewInterview({...newInterview, studentName: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Company</label>
                  <select 
                    value={newInterview.company} 
                    onChange={(e) => setNewInterview({...newInterview, company: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Tata Consultancy Services">Tata Consultancy Services</option>
                    <option value="Cognizant Technology Solutions">Cognizant Technology Solutions</option>
                    <option value="Larsen & Toubro">Larsen & Toubro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Round Type</label>
                  <select 
                    value={newInterview.round} 
                    onChange={(e) => setNewInterview({...newInterview, round: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Aptitude Test">Aptitude Test</option>
                    <option value="Group Discussion">Group Discussion</option>
                    <option value="Technical Interview">Technical Interview</option>
                    <option value="HR Interview">HR Interview</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Date & Time</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 18-Feb 10:00 AM"
                    value={newInterview.time}
                    onChange={(e) => setNewInterview({...newInterview, time: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Mode</label>
                  <select 
                    value={newInterview.mode} 
                    onChange={(e) => setNewInterview({...newInterview, mode: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Online link / Room Location</label>
                <input 
                  type="text" 
                  required
                  value={newInterview.link}
                  onChange={(e) => setNewInterview({...newInterview, link: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
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
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interviews;
