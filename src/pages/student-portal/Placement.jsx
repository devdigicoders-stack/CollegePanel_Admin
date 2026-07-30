import React, { useState } from 'react';
import { Briefcase, Calendar, Upload, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialJobs = [
  { id: 1, title: 'Systems Engineer', company: 'Tata Consultancy Services', eligibility: 'CGPA > 6.5, CSE/ECE/IT', reward: '₹3.6 - ₹7.0 LPA', deadline: '2024-02-18', status: 'Eligible - Apply Now' },
  { id: 2, title: 'Associate Software Engineer', company: 'Cognizant Technology Solutions', eligibility: 'CGPA > 7.0, CSE/IT', reward: '₹4.0 LPA', deadline: '2024-02-22', status: 'Applied' },
];

const Placement = () => {
  const [jobs, setJobs] = useState(initialJobs);

  const handleApply = (id) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status: 'Applied' } : j));
    toast.success('Job application files logged with college Placement Cell!');
  };

  const handleResumeUpload = (e) => {
    e.preventDefault();
    toast.success('Your Placement Resume PDF uploaded and shared with HR coordinator.');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[16px] font-bold text-gray-800">Campus Placement Drives</h2>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Upload your verified resume PDF, check backlog eligibility cutoffs, and apply for corporate drives</p>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto max-w-3xl">
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
          {jobs.map(item => (
            <div key={item.id} className="p-4 border border-gray-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/20 shadow-sm text-[13px]">
              <div>
                <h4 className="font-bold text-gray-800">{item.title}</h4>
                <p className="text-[12px] text-gray-700 font-semibold mt-0.5">{item.company} | <span className="text-[#0A6C54]">{item.reward}</span></p>
                <p className="text-[11px] text-gray-500 mt-2 font-medium">Criteria: {item.eligibility}</p>
                <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1"><Calendar size={13} /> Last Date: {item.deadline}</p>
              </div>

              <div className="md:self-center self-start">
                {item.status.includes('Apply') ? (
                  <button onClick={() => handleApply(item.id)} className="px-3 py-1.5 text-[12px] font-bold bg-[#0A6C54] text-white rounded hover:bg-[#085a46]">Apply Now</button>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-100">{item.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Placement;
