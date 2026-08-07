const fs = require('fs');
const path = require('path');

const filepath = path.join('d:', 'Desktop', 'DCT_CLG_CRM', 'admin', 'src', 'pages', 'hostel-warden', 'Notices.jsx');

const content = `import React, { useState, useEffect } from 'react';
import { Search, Plus, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../../utils/axiosInstance';

const Notices = () => {
  const [search, setSearch] = useState('');
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    details: '',
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/notices');
      const hostelNotices = (res.data || []).filter(n => n.targetAudience === 'Hostel Residents');
      setNotices(hostelNotices);
    } catch (error) {
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const filtered = notices.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.details.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        noticeId: \`NT-HST-\${Math.floor(1000 + Math.random() * 9000)}\`,
        title: newNotice.title,
        details: newNotice.details,
        targetAudience: 'Hostel Residents',
        postedBy: 'Hostel Warden',
        postedByRole: 'Warden',
        dateOfPublishing: new Date(),
        status: 'Published'
      };
      await axiosInstance.post('/notices', payload);
      toast.success('Notice published and broadcasted successfully!');
      setShowAddModal(false);
      setNewNotice({ title: '', details: '' });
      fetchNotices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error publishing notice');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Hostel Notice Board</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium font-semibold">Broadcast mess updates, curfew logs, or maintenance alerts to hostel residents</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Plus size={16} /> Broadcast Notice
        </button>
      </div>

      <div className="p-6 border-b border-gray-100 bg-gray-50/30">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search notices by content keywords..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
      </div>

      <div className="p-6 space-y-4 flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading notices...</div>
        ) : filtered.length > 0 ? (
          filtered.map(notice => (
            <div key={notice._id} className="p-5 border border-gray-100 rounded-xl shadow-sm space-y-3 bg-gradient-to-br from-white to-gray-50/50">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider bg-blue-50 text-blue-600 border-blue-200">
                    Hostel Residents
                  </span>
                  <h3 className="font-bold text-gray-800 text-[15px] mt-2">{notice.title}</h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Posted by: <strong className="text-[#0A6C54]">{notice.postedBy}</strong> | 
                    Date: {new Date(notice.dateOfPublishing).toLocaleDateString()}
                  </p>
                </div>
                <Bell className="text-[#0A6C54]" size={18} />
              </div>
              <p className="text-[13px] text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">{notice.details}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500 text-[13px]">No notices found.</div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Broadcast Hostel Notice</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleCreateNotice} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Notice Title</label>
                <input 
                  type="text" 
                  required
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Notice Message Content</label>
                <textarea 
                  required
                  value={newNotice.details}
                  onChange={(e) => setNewNotice({...newNotice, details: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-28 resize-none focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
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
                  Post Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;
`;

fs.writeFileSync(filepath, content, 'utf-8');
console.log("Rewrote Notices.jsx");
