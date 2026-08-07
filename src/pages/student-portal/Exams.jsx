import { useState, useEffect } from 'react';
import { ShieldAlert, Download } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const Exams = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await axiosInstance.get('/student-portal/exams');
      setSchedule(res.data);
    } catch (error) {
      toast.error('Failed to fetch exam schedules');
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
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">My Exam Schedules & Hall Ticket</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify end-semester seating charts, check theory timetables, and download generated admit cards</p>
        </div>
        <button onClick={() => window.print()} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Download size={15} /> Download Admit Card
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-2.5">
          <ShieldAlert className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-[12px] text-blue-700 leading-normal font-medium">
            <strong>Admit Card Status: Approved.</strong> Please check that your details and subject lists match. Bring a physical printout to the examination gate.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 text-[14px]">Theory Exam Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedule.length > 0 ? schedule.map((item, idx) => (
              <div key={idx} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold font-mono text-[#0A6C54] bg-[#0A6C54]/5 px-2 py-0.5 rounded border border-[#0A6C54]/10">{item.examName}</span>
                  <span className="text-[11px] font-semibold text-gray-400">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-[13px]">{item.subject}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Time: {item.startTime} - {item.endTime}</p>
                </div>
                <div className="text-[11px] font-bold text-gray-700">Status: {item.status}</div>
              </div>
            )) : (
              <div className="col-span-2 text-gray-500 text-[13px] p-4 bg-gray-50 rounded-xl border border-gray-100">
                No upcoming exams scheduled.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exams;
