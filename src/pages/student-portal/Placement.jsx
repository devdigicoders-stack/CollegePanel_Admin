import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, Upload, CheckCircle } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const Placement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    try {
      const res = await axiosInstance.get('/student-portal/placements');
      setJobs(res.data);
    } catch (error) {
      toast.error('Failed to fetch placements');
    } finally { setLoading(false); }
  };

  const handleApply = async (id) => {
    try {
      await axiosInstance.post('/student-portal/placements/apply', { jobId: id });
      setJobs(jobs.map(j => j._id === id ? { ...j, status: 'Applied' } : j));
      toast.success('Job application files logged with college Placement Cell!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply for job');
    } finally { setLoading(false); }
  };

  const handleResumeUpload = (e) => {
    e.preventDefault();
    toast.success('Your Placement Resume PDF uploaded and shared with HR coordinator.');
  };

  
  if (loading) {
    return (
      <div className="p-6">
        <SkeletonLoader type="table" rows={6} cols={5} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[16px] font-bold text-gray-800">Campus Placement Drives</h2>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Upload your verified resume PDF, check backlog eligibility cutoffs, and apply for corporate drives</p>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {/* Resume Box */}
        <div className="p-5 border border-dashed border-gray-200 rounded-xl space-y-3 bg-gray-50/50">
          <h4 className="font-bold text-gray-800 text-[13px]">My Verification Placement Resume</h4>
          <form onSubmit={handleResumeUpload} className="flex gap-2">
            <input type="file" required className="flex-1 text-[12px] bg-white border border-gray-200 p-2 rounded-lg" />
            <button type="submit" className="bg-[#0A6C54] text-white px-4 py-2 rounded-lg text-[12px] font-bold">Upload Resume</button>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 text-[14px]">Active Placement Openings</h3>
          {jobs.length > 0 ? jobs.map(item => (
            <div key={item._id} className="p-4 border border-gray-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/20 shadow-sm text-[13px]">
              <div>
                <h4 className="font-bold text-gray-800">{item.title}</h4>
                <p className="text-[12px] text-gray-700 font-semibold mt-0.5">{item.company} | <span className="text-[#0A6C54]">{item.reward}</span></p>
                <p className="text-[11px] text-gray-500 mt-2 font-medium">Criteria: {item.eligibility}</p>
                <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1"><Calendar size={13} /> Last Date: {new Date(item.deadline).toLocaleDateString()}</p>
              </div>

              <div className="md:self-center self-start">
                {(item.status || 'Apply').includes('Apply') ? (
                  <button onClick={() => handleApply(item._id)} className="px-3 py-1.5 text-[12px] font-bold bg-[#0A6C54] text-white rounded hover:bg-[#085a46]">Apply Now</button>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-100">{item.status}</span>
                )}
              </div>
            </div>
          )) : (
            <div className="text-gray-500 text-[13px] p-4 bg-gray-50 rounded-xl border border-gray-100">
              No active placement drives found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Placement;
