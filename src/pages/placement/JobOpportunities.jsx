import React, { useState } from 'react';
import { Search, Download, Plus, AlertCircle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const initialJobs = [
  { id: 1, title: 'Systems Engineer', company: 'Tata Consultancy Services', branches: 'CSE, ECE, IT', minCgpa: '6.5', backlogs: 0, deadline: '2024-02-18', package: '₹3.6 - ₹7.0 LPA', status: 'Open' },
  { id: 2, title: 'Associate Software Engineer', company: 'Cognizant Technology Solutions', branches: 'CSE, IT', minCgpa: '7.0', backlogs: 1, deadline: '2024-02-22', package: '₹4.0 LPA', status: 'Open' },
  { id: 3, title: 'Graduate Engineer Trainee', company: 'Larsen & Toubro', branches: 'ME, CE', minCgpa: '6.0', backlogs: 0, deadline: '2024-02-25', package: '₹5.5 LPA', status: 'Open' },
];

const JobOpportunities = () => {
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState(initialJobs);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: 'Tata Consultancy Services',
    branches: '',
    minCgpa: '',
    backlogs: '0',
    deadline: '',
    package: '',
  });

  const filtered = jobs.filter(j => {
    return j.title.toLowerCase().includes(search.toLowerCase()) || 
           j.company.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddJob = (e) => {
    e.preventDefault();
    const jobToAdd = {
      id: jobs.length + 1,
      title: newJob.title,
      company: newJob.company,
      branches: newJob.branches,
      minCgpa: newJob.minCgpa,
      backlogs: parseInt(newJob.backlogs) || 0,
      deadline: newJob.deadline,
      package: newJob.package,
      status: 'Open'
    };
    setJobs([...jobs, jobToAdd]);
    setShowAddModal(false);
    toast.success(`Job Opening for ${newJob.title} posted successfully!`);
    setNewJob({
      title: '',
      company: 'Tata Consultancy Services',
      branches: '',
      minCgpa: '',
      backlogs: '0',
      deadline: '',
      package: '',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Campus Job Postings & Openings</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Broadcast job descriptions, check backlog cut-offs, and set application deadlines</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Plus size={16} /> Post Job Opportunity
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by job title or company name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Job Title</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Company</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Eligible Branches</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Min CGPA</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Max Backlogs</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Deadline</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Salary Package</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.title}</td>
                <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.company}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{item.branches}</td>
                <td className="py-4 px-6 text-[13px] text-center font-bold text-gray-900">{item.minCgpa}</td>
                <td className="py-4 px-6 text-[13px] text-center font-bold text-red-500">{item.backlogs}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{item.deadline}</td>
                <td className="py-4 px-6 text-[13px] text-[#0A6C54] font-bold">{item.package}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-100`}>
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
              <h3 className="font-bold text-gray-800 text-[15px]">Create Job Posting</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddJob} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Job Title</label>
                  <input 
                    type="text" 
                    required
                    value={newJob.title}
                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Company</label>
                  <select 
                    value={newJob.company} 
                    onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    {jobs.map(j => <option key={j.id} value={j.company}>{j.company}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Eligible Branches</label>
                  <input 
                    type="text" 
                    required
                    value={newJob.branches}
                    onChange={(e) => setNewJob({...newJob, branches: e.target.value})}
                    placeholder="e.g. CSE, IT, ECE"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Min CGPA</label>
                  <input 
                    type="text" 
                    required
                    value={newJob.minCgpa}
                    onChange={(e) => setNewJob({...newJob, minCgpa: e.target.value})}
                    placeholder="e.g. 6.5"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Max Backlogs Allowed</label>
                  <input 
                    type="number" 
                    required
                    value={newJob.backlogs}
                    onChange={(e) => setNewJob({...newJob, backlogs: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Application Deadline</label>
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
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Salary Package Range</label>
                <input 
                  type="text" 
                  required
                  value={newJob.package}
                  onChange={(e) => setNewJob({...newJob, package: e.target.value})}
                  placeholder="e.g. ₹4.5 - ₹6.0 LPA"
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
                  Post Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobOpportunities;
