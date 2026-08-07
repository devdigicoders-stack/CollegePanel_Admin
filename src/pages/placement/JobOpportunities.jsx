import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import SkeletonLoader from '../../components/SkeletonLoader';

const JobOpportunities = () => {
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newJob, setNewJob] = useState({
    title: '',
    companyId: '',
    eligibleCourses: '',
    minCgpa: '',
    deadline: '',
    salaryPkg: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, compRes] = await Promise.all([
        axiosInstance.get('/placement/jobs'),
        axiosInstance.get('/placement/companies')
      ]);
      setJobs(jobsRes.data);
      setCompanies(compRes.data);
      if (compRes.data.length > 0) {
        setNewJob(prev => ({ ...prev, companyId: compRes.data[0]._id }));
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = jobs.filter(j => {
    return j.title.toLowerCase().includes(search.toLowerCase()) || 
           j.companyId?.name?.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        ...newJob,
        eligibleCourses: newJob.eligibleCourses.split(',').map(s => s.trim())
      };
      await axiosInstance.post('/placement/jobs', payload);
      toast.success(`Job Opening for ${newJob.title} posted successfully!`);
      setShowAddModal(false);
      setNewJob({
        title: '', companyId: companies[0]?._id || '', eligibleCourses: '', minCgpa: '', deadline: '', salaryPkg: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await axiosInstance.delete(`/placement/jobs/${id}`);
        toast.success('Job deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Error deleting job');
      }
    }
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
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={8} />
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-[13px]">No job opportunities found.</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Job Title</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Company</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Eligible Courses</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Min CGPA</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Deadline</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Salary Package</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.title}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.companyId?.name}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{item.eligibleCourses?.join(', ') || '-'}</td>
                  <td className="py-4 px-6 text-[13px] text-center font-bold text-gray-900">{item.minCgpa || '-'}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{item.deadline ? new Date(item.deadline).toLocaleDateString() : '-'}</td>
                  <td className="py-4 px-6 text-[13px] text-[#0A6C54] font-bold">{item.salaryPkg || '-'}</td>
                  <td className="py-4 px-6 text-[13px]">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-100`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[13px] flex gap-2">
                    <button className="p-1.5 bg-gray-50 rounded hover:bg-gray-100 text-gray-600"><Edit2 size={14}/></button>
                    <button onClick={() => handleDelete(item._id)} className="p-1.5 bg-red-50 rounded hover:bg-red-100 text-red-600"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
                    value={newJob.companyId} 
                    onChange={(e) => setNewJob({...newJob, companyId: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Eligible Courses</label>
                  <input 
                    type="text" 
                    required
                    value={newJob.eligibleCourses}
                    onChange={(e) => setNewJob({...newJob, eligibleCourses: e.target.value})}
                    placeholder="e.g. B.Tech, MCA"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Min CGPA</label>
                  <input 
                    type="text" 
                    value={newJob.minCgpa}
                    onChange={(e) => setNewJob({...newJob, minCgpa: e.target.value})}
                    placeholder="e.g. 6.5"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Salary Package</label>
                  <input 
                    type="text" 
                    required
                    value={newJob.salaryPkg}
                    onChange={(e) => setNewJob({...newJob, salaryPkg: e.target.value})}
                    placeholder="e.g. ₹4.5 - ₹6.0 LPA"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
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
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] disabled:opacity-50 text-white rounded-lg text-[13px] font-semibold"
                >
                  {isSubmitting ? 'Posting...' : 'Post Opportunity'}
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
