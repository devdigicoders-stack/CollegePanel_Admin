import React, { useState, useEffect } from 'react';
import { Download, FileText, BadgeCheck, FileImage } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const Downloads = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      const res = await axiosInstance.get('/student-portal/downloads');
      setDocuments(res.data);
    } catch (error) {
      toast.error('Failed to fetch downloads');
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
        <h2 className="text-[16px] font-bold text-gray-800">My Downloads & Issued Certificates</h2>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Download digital copies of your admit card, paid receipts, ID cards, and semester marksheets</p>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {documents.length > 0 ? documents.map(item => (
          <div key={item._id} className="p-4 border border-gray-100 rounded-xl flex items-center justify-between hover:bg-gray-50/50 transition-colors shadow-sm bg-gray-50/20 text-[13px]">
            <div className="flex items-center gap-3">
              <div className="bg-[#0A6C54]/10 p-2.5 rounded-lg text-[#0A6C54]">
                {item.type === 'ID Card' ? <FileImage size={18} /> : <FileText size={18} />}
              </div>
              <div>
                <span className="text-[11px] font-semibold text-gray-400">{item.type}</span>
                <h4 className="font-bold text-gray-800 mt-0.5">{item.name}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Status: {item.date}</p>
              </div>
            </div>

            <button 
              onClick={() => {
                if(item.fileUrl) window.open(item.fileUrl, '_blank');
                else toast.error('File link not available');
              }} 
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
              title="Download Document"
            >
              <Download size={15} />
            </button>
          </div>
        )) : (
          <div className="text-gray-500 text-[13px] p-4 bg-gray-50 rounded-xl border border-gray-100">
            No downloadable documents found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Downloads;
