import React, { useState } from 'react';
import { Search, Download, Plus, AlertCircle, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const initialNotices = [
  { id: 1, title: 'Water Supply Maintenance Shutdown', target: 'Entire Hostel', content: 'There will be a water shutdown in all blocks on 18-Feb between 10:00 AM to 02:00 PM due to overhead tank cleaning. Please store water accordingly.', date: '2024-02-15', priority: 'High' },
  { id: 2, title: 'Hostel Night Curfew Timings Reminder', target: 'Entire Hostel', content: 'All students are strictly instructed to report back inside their respective blocks by 09:30 PM. Outing cards will be suspended for curfew violations.', date: '2024-02-14', priority: 'Medium' },
  { id: 3, title: 'Block B Fire Safety Drill', target: 'Block B (Boys)', content: 'A mandatory fire escape and safety drill will be conducted by municipal authorities on Saturday at 03:00 PM in the Block B open corridor.', date: '2024-02-12', priority: 'Low' },
];

const Notices = () => {
  const [search, setSearch] = useState('');
  const [notices, setNotices] = useState(initialNotices);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    target: 'Entire Hostel',
    content: '',
    priority: 'Medium',
  });

  const filtered = notices.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.content.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleCreateNotice = (e) => {
    e.preventDefault();
    const noticeToAdd = {
      id: notices.length + 1,
      title: newNotice.title,
      target: newNotice.target,
      content: newNotice.content,
      date: new Date().toISOString().split('T')[0],
      priority: newNotice.priority
    };
    setNotices([noticeToAdd, ...notices]);
    setShowAddModal(false);
    toast.success('Notice published and broadcasted successfully!');
    setNewNotice({
      title: '',
      target: 'Entire Hostel',
      content: '',
      priority: 'Medium',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Hostel Notice Board</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium font-semibold">Broadcast mess updates, curfew logs, or maintenance alerts</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Plus size={16} /> Broadcast Notice
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
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

      {/* List */}
      <div className="p-6 space-y-4 flex-1 overflow-y-auto">
        {filtered.map(notice => (
          <div key={notice.id} className="p-5 border border-gray-100 rounded-xl shadow-sm space-y-3 bg-gradient-to-br from-white to-gray-50/50">
            <div className="flex justify-between items-start">
              <div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                  notice.priority === 'High' ? 'bg-red-50 text-red-600 border-red-200' :
                  notice.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  'bg-blue-50 text-blue-600 border-blue-200'
                }`}>{notice.priority} Priority</span>
                <h3 className="font-bold text-gray-800 text-[15px] mt-2">{notice.title}</h3>
                <p className="text-[11px] text-gray-500 font-medium">Broadcast target: <strong className="text-[#0A6C54]">{notice.target}</strong> | Posted: {notice.date}</p>
              </div>
              <Bell className="text-gray-400" size={18} />
            </div>
            <p className="text-[13px] text-gray-600 leading-relaxed font-medium">{notice.content}</p>
          </div>
        ))}
      </div>

      {/* Broadcast Notice Modal */}
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
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Broadcast Target</label>
                  <select 
                    value={newNotice.target} 
                    onChange={(e) => setNewNotice({...newNotice, target: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Entire Hostel">Entire Hostel</option>
                    <option value="Block A (Boys)">Block A (Boys)</option>
                    <option value="Block B (Boys)">Block B (Boys)</option>
                    <option value="Block C (Girls)">Block C (Girls)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Priority</label>
                  <select 
                    value={newNotice.priority} 
                    onChange={(e) => setNewNotice({...newNotice, priority: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Notice Message Content</label>
                <textarea 
                  required
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-28 resize-none"
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
