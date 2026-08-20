import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyClasses();
  }, []);

  const fetchMyClasses = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/teacher-portal/my-classes');
      
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load your assigned classes');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="font-['Inter'] space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-48 animate-pulse">
               <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
               <div className="space-y-3">
                 <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                 <div className="h-4 bg-gray-200 rounded w-2/3"></div>
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="font-['Inter'] space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight font-['Outfit']">My Assigned Classes</h1>
          <p className="text-[13px] text-gray-500 font-medium mt-1">
            View all the subjects and classes assigned to you for the current academic session.
          </p>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
            <BookOpen size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No Classes Assigned</h3>
          <p className="text-sm text-gray-500 max-w-md">
            You currently do not have any subjects or classes assigned to you. Please contact your HOD or the Administrator if you believe this is a mistake.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div key={cls._id} className="bg-white rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] transition-shadow">
              
              <div className="h-2 w-full bg-gradient-to-r from-primary to-emerald-400"></div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1">{cls.subjectName}</h3>
                    <p className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded inline-block">
                      {cls.subjectCode}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} className="text-blue-600" />
                  </div>
                </div>
                
                <div className="space-y-3 mt-6">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <User size={14} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Branch / Course</p>
                      <p className="text-sm font-semibold text-gray-700">{cls.courseName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <Calendar size={14} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Semester</p>
                      <p className="text-sm font-semibold text-gray-700">Semester {cls.semester}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <Clock size={14} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Status</p>
                      <p className={`text-xs font-bold ${cls.status === 'Active' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {cls.status}
                      </p>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClasses;
