import React, { useState, useEffect } from 'react';
import { Bell, Plus, X, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import ClassSelector from './components/ClassSelector';

const Notices = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [noticeForm, setNoticeForm] = useState({ title: '', details: '', targetAudience: 'Specific Course', department: '', dateOfPublishing: '', link: '', pdfs: [], images: [] });

  useEffect(() => {
    if (selectedClass) {
      fetchNotices(selectedClass);
    }
  }, [selectedClass]);

  const fetchNotices = async (classId) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/teacher-portal/class/${classId}/notices`);
      setNotices(res.data || []);
    } catch (error) {
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', noticeForm.title);
      formData.append('details', noticeForm.details);
      formData.append('targetAudience', noticeForm.targetAudience);
      if (noticeForm.department) formData.append('department', noticeForm.department);
      if (noticeForm.link) formData.append('link', noticeForm.link);
      if (noticeForm.dateOfPublishing) formData.append('dateOfPublishing', noticeForm.dateOfPublishing);

      if (noticeForm.pdfs && noticeForm.pdfs.length > 0) {
        noticeForm.pdfs.forEach(file => formData.append('pdfs', file));
      }
      if (noticeForm.images && noticeForm.images.length > 0) {
        noticeForm.images.forEach(file => formData.append('images', file));
      }

      await axiosInstance.post(`/teacher-portal/class/${selectedClass}/notices`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Notice published successfully');
      setShowModal(false);
      setNoticeForm({ title: '', details: '', targetAudience: 'Specific Course', department: '', dateOfPublishing: '', link: '', pdfs: [], images: [] });
      fetchNotices(selectedClass);
    } catch (error) {
      toast.error('Failed to publish notice');
    }
  };

  const handleDelete = async (noticeId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/teacher-portal/class/${selectedClass}/notices/${noticeId}`);
        toast.success('Notice deleted successfully');
        fetchNotices(selectedClass);
      } catch (error) {
        toast.error('Failed to delete notice');
      }
    }
  };

  return (
    <div className="font-['Inter'] space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight font-['Outfit'] flex items-center gap-2">
            <Bell size={24} className="text-primary" />
            Class Notices
          </h1>
          <p className="text-[13px] text-gray-500 font-medium mt-1">Manage announcements for your selected class.</p>
        </div>
        <ClassSelector selectedClass={selectedClass} setSelectedClass={setSelectedClass} />
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 min-h-[400px]">
        <div className="flex justify-end mb-6">
          <button 
            onClick={() => setShowModal(true)}
            disabled={!selectedClass}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Plus size={16} /> Publish Notice
          </button>
        </div>

        {loading ? (
          <SkeletonLoader type="card" count={3} />
        ) : !selectedClass ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
            <Bell size={48} className="mb-4 opacity-20" />
            <p>Please select a class to view notices.</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No notices published yet.</div>
        ) : (
          <div className="space-y-4">
            {notices.map(n => (
              <div key={n._id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow relative">
                <button 
                  onClick={() => handleDelete(n._id)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Notice"
                >
                  <Trash2 size={18} />
                </button>
                <div className="flex justify-between items-start mb-2 pr-10">
                  <h4 className="font-bold text-gray-800 text-lg">{n.title}</h4>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="mb-3 text-xs font-semibold text-gray-500 flex items-center gap-2">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-md">By: {n.postedBy} ({n.postedByRole})</span>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap mt-2 leading-relaxed">{n.details}</p>
                
                {/* Attachments */}
                {(n.link || (n.pdfs && n.pdfs.length > 0) || (n.images && n.images.length > 0)) && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                    {n.link && (
                      <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-[13px] font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                        View Link
                      </a>
                    )}
                    {n.pdfs?.map((pdf, idx) => (
                      <a key={idx} href={`${import.meta.env.VITE_API_URL.replace('/api', '')}${pdf}`} target="_blank" rel="noopener noreferrer" className="text-[13px] font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                        PDF Document {idx + 1}
                      </a>
                    ))}
                    {n.images?.map((img, idx) => (
                      <a key={idx} href={`${import.meta.env.VITE_API_URL.replace('/api', '')}${img}`} target="_blank" rel="noopener noreferrer" className="text-[13px] font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
                        Attached Image {idx + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-lg">Publish Notice</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateNotice} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Notice Title</label>
                <input type="text" required value={noticeForm.title} onChange={e => setNoticeForm({...noticeForm, title: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-primary outline-none" placeholder="E.g., Tomorrow's Test" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Target Audience</label>
                <select value={noticeForm.targetAudience} onChange={e => setNoticeForm({...noticeForm, targetAudience: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-primary outline-none">
                  <option value="All Students">All Students</option>
                  <option value="Specific Course">Specific Course</option>
                  <option value="Specific Department">Specific Department</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Date of Publishing</label>
                  <input type="date" required value={noticeForm.dateOfPublishing} onChange={e => setNoticeForm({...noticeForm, dateOfPublishing: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">External Link (Optional)</label>
                  <input type="url" value={noticeForm.link} onChange={e => setNoticeForm({...noticeForm, link: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-primary outline-none" placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Details</label>
                <textarea required rows={4} value={noticeForm.details} onChange={e => setNoticeForm({...noticeForm, details: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-primary outline-none" placeholder="Write notice content..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Attach PDFs (Optional)</label>
                <input type="file" multiple accept=".pdf" onChange={e => setNoticeForm({...noticeForm, pdfs: Array.from(e.target.files)})} className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-primary outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Attach Images (Optional)</label>
                <input type="file" multiple accept="image/*" onChange={e => setNoticeForm({...noticeForm, images: Array.from(e.target.files)})} className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-primary outline-none text-sm" />
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2">
                  <Bell size={16} /> Publish
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
