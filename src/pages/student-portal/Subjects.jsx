import React, { useState, useEffect } from 'react';
import { BookOpen, Award } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const Subjects = () => {
  const [subjectsList, setSubjectsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await axiosInstance.get('/student-portal/subjects');
      setSubjectsList(res.data);
    } catch (error) {
      toast.error('Failed to fetch registered subjects');
    } finally { setLoading(false); }
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
        <h2 className="text-[16px] font-bold text-gray-800">My Registered Subjects</h2>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify course syllabus completion logs, reference credit parameters, and assigned faculties</p>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {subjectsList.length > 0 ? subjectsList.map((sub, idx) => (
          <div key={idx} className="p-5 border border-gray-100 rounded-xl space-y-4 shadow-sm bg-gray-50/30">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold font-mono text-[#0A6C54] bg-[#0A6C54]/5 px-2 py-0.5 rounded border border-[#0A6C54]/10">{sub.code}</span>
                <h4 className="font-bold text-gray-800 text-[14px] mt-2">{sub.name}</h4>
                <p className="text-[12px] text-gray-500 mt-0.5">Semester: {sub.semester}</p>
              </div>
              <span className="text-[12px] font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded">Credits: {sub.credits}</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-gray-500 font-semibold">
                <span>Syllabus Completion</span>
                <span>{sub.syllabusCompletion || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-[#0A6C54] h-1.5 rounded-full" 
                  style={{ width: `${sub.syllabusCompletion || 0}%` }}
                />
              </div>
            </div>
          </div>
        )) : (
          <div className="text-gray-500 text-[13px] p-4 bg-gray-50 rounded-xl border border-gray-100">
            No subjects registered for this semester.
          </div>
        )}
      </div>
    </div>
  );
};

export default Subjects;
