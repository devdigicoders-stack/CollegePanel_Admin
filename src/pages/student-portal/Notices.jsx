import React, { useState, useEffect } from 'react';
import { Bell, FileText, Image as ImageIcon, Link as LinkIcon, Download, Search, AlertCircle, Calendar } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const StudentNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/notices?status=Published&limit=50');
      const data = res.data.data || res.data;
      setNotices(data);
    } catch (error) {
      toast.error('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  const filteredNotices = notices.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <SkeletonLoader type="card" rows={3} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-['Inter']">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-6 pb-0">
        <div>
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <Bell className="text-[#0A6C54]" size={28} />
            Notice Board
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Stay updated with the latest announcements</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search notices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all shadow-sm"
          />
          <Search className="absolute left-3.5 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto px-6 pb-6">
        {filteredNotices.length > 0 ? filteredNotices.map((notice) => (
          <div key={notice._id} className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-lg transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0A6C54] group-hover:bg-[#085a46] transition-colors"></div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider rounded-lg border border-blue-100 flex items-center gap-1.5">
                    <AlertCircle size={12} />
                    {notice.postedByRole || 'Admin'}
                  </span>
                  <span className="text-[12px] text-gray-500 font-medium flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(notice.dateOfPublishing)}
                  </span>
                </div>
                <h3 className="text-[18px] sm:text-[20px] font-black text-gray-800 leading-tight">{notice.title}</h3>
              </div>
            </div>
            
            <p className="text-[14px] text-gray-600 leading-relaxed mb-5 whitespace-pre-wrap">
              {notice.details}
            </p>

            {(notice.pdfs?.length > 0 || notice.link || (notice.images && notice.images.length > 0)) && (
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Attachments & Links</h4>
                
                <div className="flex flex-wrap gap-3">
                  {notice.pdfs && notice.pdfs.length > 0 && notice.pdfs.map((pdf, idx) => (
                    <a
                      key={idx}
                      href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${pdf}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors border border-red-100 text-[13px] font-semibold"
                    >
                      <FileText size={16} />
                      Document {idx + 1}
                      <Download size={14} className="ml-1 opacity-70" />
                    </a>
                  ))}

                  {notice.link && (
                    <a
                      href={notice.link.startsWith('http') ? notice.link : `https://${notice.link}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100 text-[13px] font-semibold max-w-full overflow-hidden"
                    >
                      <LinkIcon size={16} className="shrink-0" />
                      <span className="truncate">External Link</span>
                    </a>
                  )}
                </div>

                {notice.images && notice.images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-[12px] font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-gray-400" />
                      Image Gallery
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {notice.images.map((img, i) => (
                        <a 
                          key={i} 
                          href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${img}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="block rounded-xl overflow-hidden border border-gray-200 hover:border-[#0A6C54] hover:shadow-lg transition-all group/img relative aspect-video sm:aspect-square"
                        >
                          <img 
                            src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${img}`} 
                            alt={`Notice attachment ${i+1}`}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                            <Search className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity" size={20} />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )) : (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="text-gray-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">No Notices Found</h3>
            <p className="text-gray-500 text-sm">There are no new notices on the board right now.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotices;
