import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, X, ShieldAlert } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    category: 'IT',
    description: '',
    priority: 'Medium'
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/teacher-portal/my-complaints`);
      setComplaints(res.data || []);
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(`/teacher-portal/my-complaints`, form);
      toast.success('Complaint submitted to Admin successfully');
      setShowModal(false);
      setForm({ subject: '', category: 'IT', description: '', priority: 'Medium' });
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to submit complaint');
    }
  };

  return (
    <div className="font-['Inter'] space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight font-['Outfit'] flex items-center gap-2">
            <ShieldAlert size={24} className="text-primary" />
            My Complaints (To Admin)
          </h1>
          <p className="text-[13px] text-gray-500 font-medium mt-1">Submit issues to the admin regarding IT, HR, Maintenance, etc.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-sm flex items-center justify-center gap-2 transition-all"
        >
          <Plus size={18} /> New Complaint
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 min-h-[400px]">
        {loading ? (
          <SkeletonLoader type="card" count={3} />
        ) : complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
            <AlertCircle size={48} className="mb-4 opacity-20" />
            <p>You haven't submitted any complaints yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map(c => (
              <div key={c._id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                      {c.subject}
                      <span className="text-[11px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{c.category}</span>
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${
                      c.priority === 'Urgent' || c.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {c.priority} Priority
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${
                      c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 
                      c.status === 'Pending' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{c.description}</p>
                
                {c.adminReply && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <p className="text-xs font-bold text-primary mb-1">Admin Reply:</p>
                    <p className="text-sm text-gray-700">{c.adminReply}</p>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-xs font-medium text-gray-400">
                  <span>Complaint ID: {c.complaintId}</span>
                  <span>Submitted on: {new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Complaint Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-lg text-gray-800">Submit New Complaint</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Subject</label>
                <input 
                  type="text" 
                  required 
                  value={form.subject} 
                  onChange={e => setForm({...form, subject: e.target.value})} 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                  placeholder="E.g., Projector not working in Room 104" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">Category</label>
                  <select 
                    value={form.category} 
                    onChange={e => setForm({...form, category: e.target.value})} 
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  >
                    <option value="IT">IT & Infrastructure</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Library">Library</option>
                    <option value="Transport">Transport</option>
                    <option value="Food">Food / Canteen</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">Priority</label>
                  <select 
                    value={form.priority} 
                    onChange={e => setForm({...form, priority: e.target.value})} 
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Description</label>
                <textarea 
                  required 
                  rows={4} 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none" 
                  placeholder="Explain the issue in detail..."
                ></textarea>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-all">
                  Submit to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
