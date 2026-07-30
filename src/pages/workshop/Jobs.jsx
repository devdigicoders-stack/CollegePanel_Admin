import React, { useState } from 'react';
import { Search, Download, Plus, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialJobs = [
  { id: 1, jobNo: 'JOB-ME-01', title: 'T-Lap Joint Carpentry', trade: 'Carpentry Shop', tools: 'Hand Saw, Jack Plane, Try Square, Wood Chisel', status: 'Active', deadline: '2024-02-20' },
  { id: 2, jobNo: 'JOB-ME-02', title: 'V-Butt Joint Arc Welding', trade: 'Welding Shop', tools: 'Welding Transformer, Electrodes, Chipping Hammer', status: 'Active', deadline: '2024-02-22' },
  { id: 3, jobNo: 'JOB-ME-03', title: 'Mild Steel Fitting Square Job', trade: 'Fitting Shop', tools: 'Bench Vice, Flat Rough File, Hack Saw Frame', status: 'Completed', deadline: '2024-02-12' },
];

const Jobs = () => {
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState(initialJobs);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    trade: 'Fitting Shop',
    tools: '',
    deadline: '',
  });

  const filtered = jobs.filter(j => {
    return j.title.toLowerCase().includes(search.toLowerCase()) || 
           j.trade.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddJob = (e) => {
    e.preventDefault();
    const jobToAdd = {
      id: jobs.length + 1,
      jobNo: `JOB-ME-${Math.floor(10 + Math.random() * 90)}`,
      title: newJob.title,
      trade: newJob.trade,
      tools: newJob.tools,
      status: 'Active',
      deadline: newJob.deadline
    };
    setJobs([...jobs, jobToAdd]);
    setShowAddModal(false);
    toast.success(`Workshop job "${newJob.title}" assigned successfully!`);
    setNewJob({
      title: '',
      trade: 'Fitting Shop',
      tools: '',
      deadline: '',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Workshop Exercises & Job Cards</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium font-semibold">Assign new carpentry, welding, or turning jobs, and track submissions</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Plus size={16} /> Assign Job Card
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by job title or trade section..." 
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
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Job No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Exercise Title</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Trade Section</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Required Tools List</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Deadline</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.jobNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.title}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{item.trade}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500 font-medium">{item.tools}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{item.deadline}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Assign Workshop Job Card</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddJob} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Exercise / Job Title</label>
                <input 
                  type="text" 
                  required
                  value={newJob.title}
                  onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Trade Section</label>
                  <select 
                    value={newJob.trade} 
                    onChange={(e) => setNewJob({...newJob, trade: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Fitting Shop">Fitting Shop</option>
                    <option value="Welding Shop">Welding Shop</option>
                    <option value="Carpentry Shop">Carpentry Shop</option>
                    <option value="Machine Shop">Machine Shop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Deadline Date</label>
                  <input 
                    type="date" 
                    required
                    value={newJob.deadline}
                    onChange={(e) => setNewJob({...newJob, deadline: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Required Hand Tools (comma-separated)</label>
                <textarea 
                  required
                  value={newJob.tools}
                  onChange={(e) => setNewJob({...newJob, tools: e.target.value})}
                  placeholder="e.g. Try Square, Flat File, Bench Vice"
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
                  Assign Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
