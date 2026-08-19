import React, { useState, useEffect } from 'react';
import { Search, Plus, Bell, Edit3, Trash2, Calendar, Users, Eye, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import Swal from 'sweetalert2';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import SkeletonLoader from '../../components/SkeletonLoader';

const Notices = () => {
  if (!checkPermission('View Hostels')) {
    return <AccessDenied />;
  }
  const [search, setSearch] = useState('');
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNotice, setCurrentNotice] = useState({
    _id: null,
    title: '',
    details: '',
  });

  const [viewNotice, setViewNotice] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/notices');
      // Only keep notices targeted to Hostel Residents
      const hostelNotices = (res.data.data || []).filter(n => n.targetAudience === 'Hostel Residents');
      setNotices(hostelNotices);
    } catch (error) {
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const filtered = notices.filter(n => {
    return n.title.toLowerCase().includes(search.toLowerCase()) || 
           n.details.toLowerCase().includes(search.toLowerCase());
  });

  // ── Create or Update Notice ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentNotice.title.trim() || !currentNotice.details.trim()) return toast.error('Title and Details are required');
    try {
      setSubmitting(true);
      if (isEditing) {
        const payload = { title: currentNotice.title, details: currentNotice.details };
        const res = await axiosInstance.put(`/notices/${currentNotice._id}`, payload);
        const updated = res.data.notice || res.data;
        setNotices(prev => prev.map(n => n._id === currentNotice._id ? { ...n, ...updated } : n));
        toast.success('Notice updated successfully!');
      } else {
        const payload = {
          noticeId: `NT-HST-${Math.floor(1000 + Math.random() * 9000)}`,
          title: currentNotice.title,
          details: currentNotice.details,
          targetAudience: 'Hostel Residents',
          postedBy: 'Hostel Warden',
          postedByRole: 'Warden',
          dateOfPublishing: new Date(),
          status: 'Published'
        };
        const res = await axiosInstance.post('/notices', payload);
        const created = res.data.notice || res.data;
        setNotices(prev => [created, ...prev]);
        toast.success('Notice broadcasted successfully!');
      }
      setShowModal(false);
      setCurrentNotice({ _id: null, title: '', details: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving notice');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete Notice ───────────────────────────────────────────────────
  const handleDelete = async (e, notice) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: 'Delete Notice?',
      html: `Are you sure you want to delete <strong>"${notice.title}"</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    });
    if (!result.isConfirmed) return;
    try {
      await axiosInstance.delete(`/notices/${notice._id}`);
      setNotices(prev => prev.filter(n => n._id !== notice._id));
      toast.success('Notice deleted');
      if (viewNotice && viewNotice._id === notice._id) setViewNotice(null);
    } catch {
      toast.error('Failed to delete notice');
    }
  };

  // ── Open Edit Modal ─────────────────────────────────────────────────
  const openEdit = (e, notice) => {
    e.stopPropagation();
    setIsEditing(true);
    setCurrentNotice({ _id: notice._id, title: notice.title, details: notice.details });
    setShowModal(true);
  };

  const openAdd = () => {
    setIsEditing(false);
    setCurrentNotice({ _id: null, title: '', details: '' });
    setShowModal(true);
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800 flex items-center gap-2">
            <Bell size={18} className="text-primary" /> Hostel Notice Board
          </h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Broadcast mess updates, curfew logs, or maintenance alerts to residents</p>
        </div>
        <button onClick={openAdd} className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors shadow-sm shadow-primary/20">
          <Plus size={16} /> Broadcast Notice
        </button>
      </div>

      {/* Stats/Filters */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search notices by content or title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="text-[12px] font-semibold text-gray-500 bg-white px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm">
          Total Broadcasts: <span className="text-primary">{notices.length}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Notice List Feed */}
        <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${viewNotice ? 'hidden md:block md:border-r md:border-gray-100' : 'block'}`}>
          {loading ? (
            <SkeletonLoader type="table" rows={5} cols={5} />
          ) : filtered.length > 0 ? (
            filtered.map(notice => (
              <div 
                key={notice._id} 
                onClick={() => setViewNotice(notice)}
                className={`p-5 border rounded-xl cursor-pointer transition-all duration-200 ${viewNotice?._id === notice._id ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-gray-100 hover:border-primary/50 hover:shadow-md bg-gradient-to-br from-white to-gray-50/50'}`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider bg-blue-50 text-blue-600 border-blue-200 flex items-center gap-1">
                        <Users size={10} /> {notice.targetAudience}
                      </span>
                      {notice.status === 'Published' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider bg-green-50 text-green-600 border-green-200 flex items-center gap-1">
                          <CheckCircle size={10} /> Live
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider bg-gray-100 text-gray-600 border-gray-200 flex items-center gap-1">
                          Draft
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-800 text-[15px] group-hover:text-primary transition-colors">{notice.title}</h3>
                    <p className="text-[12px] text-gray-500 font-medium flex items-center gap-1.5 mt-2">
                      <Calendar size={12} /> {fmtDate(notice.dateOfPublishing)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={(e) => openEdit(e, notice)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Notice">
                      <Edit3 size={15} />
                    </button>
                    <button onClick={(e) => handleDelete(e, notice)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Notice">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400 text-[13px]">
              {notices.length === 0 ? 'No notices broadcasted yet. Click "Broadcast Notice" to create one.' : 'No notices match your search.'}
            </div>
          )}
        </div>

        {/* Notice Preview Pane */}
        {viewNotice && (
          <div className="flex-1 flex flex-col bg-gray-50/30 overflow-hidden relative animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-5 border-b border-gray-100 bg-white flex justify-between items-center shrink-0">
              <h3 className="font-bold text-gray-800 text-[14px] flex items-center gap-2"><Eye size={16} className="text-primary" /> Reading Notice</h3>
              <button onClick={() => setViewNotice(null)} className="md:hidden text-gray-500 text-[12px] font-semibold bg-gray-100 px-3 py-1.5 rounded-lg">Close</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="mb-6">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{viewNotice.title}</h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-medium text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={13} /> {fmtDate(viewNotice.dateOfPublishing)}</span>
                    <span className="flex items-center gap-1"><Users size={13} /> Audience: {viewNotice.targetAudience}</span>
                    <span className="flex items-center gap-1"><Bell size={13} /> By: {viewNotice.postedBy}</span>
                  </div>
                </div>
                <div className="w-full h-px bg-gray-100 mb-6"></div>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                  {viewNotice.details}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal ───────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px] flex items-center gap-2">
                {isEditing ? <Edit3 size={16} className="text-blue-600" /> : <Bell size={16} className="text-primary" />}
                {isEditing ? 'Edit Notice' : 'Broadcast Hostel Notice'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Notice Title *</label>
                <input 
                  type="text" required placeholder="e.g. Curfew Timing Change during Exams"
                  value={currentNotice.title}
                  onChange={(e) => setCurrentNotice({...currentNotice, title: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Notice Content / Details *</label>
                <textarea 
                  required rows={6} placeholder="Type your notice content here..."
                  value={currentNotice.details}
                  onChange={(e) => setCurrentNotice({...currentNotice, details: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-lg text-[13px] resize-none focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={submitting}
                  className={`flex-1 py-2.5 text-white rounded-lg text-[13px] font-semibold transition-colors shadow-sm ${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary hover:bg-primary-hover'}`}
                >
                  {submitting ? 'Saving...' : (isEditing ? 'Update Notice' : 'Post Broadcast')}
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
