import React, { useState, useEffect } from 'react';
import { Download, FileText, Video, HelpCircle } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const StudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await axiosInstance.get('/student-portal/study-materials');
      setMaterials(res.data);
    } catch (error) {
      toast.error('Failed to fetch study materials');
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
        <h2 className="text-[16px] font-bold text-gray-800">My Study Materials Library</h2>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Download faculty-curated notes, lecture slides, previous year test papers, and lab manual books</p>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {materials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map(item => (
              <div key={item._id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative bg-white group">
                <div className="flex items-start gap-4 mb-5">
                  <div className={`p-3 rounded-xl transition-colors duration-300 ${
                    (item.type || '').includes('Video') 
                      ? 'bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white' 
                      : 'bg-[#0A6C54]/10 text-[#0A6C54] group-hover:bg-[#0A6C54] group-hover:text-white'
                  }`}>
                    {(item.type || '').includes('Video') ? <Video size={24} /> : <FileText size={24} />}
                  </div>
                  <div className="flex-1">
                    <span className="inline-block px-2 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-md mb-2">{item.subject}</span>
                    <h4 className="font-bold text-gray-800 text-[15px] leading-tight line-clamp-2">{item.title}</h4>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-gray-400 font-medium">Material Type</span>
                    <span className="text-gray-700 font-semibold">{item.type}</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-gray-400 font-medium">File Size</span>
                    <span className="text-gray-700 font-semibold">{item.size || 'Unknown'}</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if(item.fileUrl) {
                      window.open(item.fileUrl, '_blank');
                    } else {
                      toast.error('File link not available');
                    }
                  }} 
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-[#0A6C54] hover:text-white text-gray-700 rounded-xl text-[13px] font-bold transition-colors duration-300 group-hover:bg-[#0A6C54]/10 group-hover:text-[#0A6C54]"
                >
                  {(item.type || '').includes('Video') ? 'Watch Video' : 'Download File'} 
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
            <div className="bg-gray-50 p-6 rounded-full">
              <HelpCircle size={48} className="text-gray-300" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-gray-800">No Study Materials Found</h3>
              <p className="text-[13px] text-gray-500 mt-1 max-w-sm">
                There are currently no study materials uploaded for your enrolled courses. Check back later!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyMaterials;
