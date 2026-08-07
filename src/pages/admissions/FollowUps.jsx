import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Eye, ChevronDown, Calendar, X, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const callStatusColors = {
  'Interested': 'bg-green-100 text-green-700',
  'Call Later': 'bg-orange-100 text-orange-700',
  'Visit Scheduled': 'bg-blue-100 text-blue-700',
  'Application Started': 'bg-purple-100 text-purple-700',
  'Not Interested': 'bg-red-100 text-red-700',
  'No Response': 'bg-gray-100 text-gray-700',
};

const interestColors = {
  'Very High': 'bg-emerald-100 text-emerald-700',
  'High': 'bg-green-100 text-green-700',
  'Medium': 'bg-yellow-100 text-yellow-700',
  'Low': 'bg-orange-100 text-orange-700',
  'Not Interested': 'bg-red-100 text-red-700',
};

const FollowUps = () => {
  if (!checkPermission('View Admissions') && !checkPermission('Edit Admission')) {
    return <AccessDenied />;
  }
  const [followUps, setFollowUps] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    enquiryNo: '', followUpDate: new Date().toISOString().split('T')[0],
    nextFollowUpDate: '', callStatus: 'Call Later', interestLevel: 'Medium', counsellorNotes: ''
  });

  const fetchFollowUps = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/followups`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: filterStatus }
      });
      setFollowUps(res.data);
    } catch (error) {
      console.error('Error fetching follow-ups', error);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [filterStatus]);

  const filtered = followUps.filter(f => {
    const studentName = f.enquiryId?.studentName || '';
    const mobile = f.enquiryId?.mobileNumber || '';
    return studentName.toLowerCase().includes(search.toLowerCase()) || mobile.includes(search);
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (f) => {
    setEditingId(f._id);
    setFormData({
      enquiryNo: f.enquiryId?.enquiryNo || '',
      followUpDate: f.followUpDate ? new Date(f.followUpDate).toISOString().split('T')[0] : '',
      nextFollowUpDate: f.nextFollowUpDate ? new Date(f.nextFollowUpDate).toISOString().split('T')[0] : '',
      callStatus: f.callStatus || 'Call Later',
      interestLevel: f.studentInterestLevel || 'Medium',
      counsellorNotes: f.counsellorNotes || ''
    });
    setShowModal(true);
  };

  const handleView = (f) => {
    setSelectedFollowUp(f);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure you want to delete this follow-up?')) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/followups/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Follow-up deleted successfully');
      fetchFollowUps();
    } catch(error) {
      toast.error('Failed to delete follow-up');
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/followups/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Follow-up updated successfully');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/followups`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Follow-up created successfully');
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({
        enquiryNo: '', followUpDate: new Date().toISOString().split('T')[0],
        nextFollowUpDate: '', callStatus: 'Call Later', interestLevel: 'Medium', counsellorNotes: ''
      });
      fetchFollowUps();
    } catch (error) {
      console.error('Error saving follow-up', error);
      toast.error(error.response?.data?.message || 'Error saving follow-up');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      enquiryNo: '', followUpDate: new Date().toISOString().split('T')[0],
      nextFollowUpDate: '', callStatus: 'Call Later', interestLevel: 'Medium', counsellorNotes: ''
    });
    setShowModal(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Follow-ups</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Track and manage student follow-ups</p>
        </div>
        <button onClick={openAddModal} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2">
          <Plus size={16} /> Add Follow-up
        </button>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search student name, mobile..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
        <div className="relative">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
            <option value="All">All Status</option>
            {Object.keys(callStatusColors).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              {['Follow-up No.','Student Name','Course','Follow-up Date','Call Status','Interest Level','Counsellor Notes','Next Follow-up','Actions'].map(h => (
                <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(f => (
              <tr key={f._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{f.followUpNo}</td>
                <td className="py-3 px-4">
                  <p className="text-[13px] font-medium text-gray-800">{f.enquiryId?.studentName || 'N/A'}</p>
                  <p className="text-[11px] text-gray-500">{f.enquiryId?.mobileNumber || 'N/A'}</p>
                </td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{f.enquiryId?.courseInterested || 'N/A'}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{new Date(f.followUpDate).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${callStatusColors[f.callStatus] || 'bg-gray-100 text-gray-700'}`}>{f.callStatus}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${interestColors[f.studentInterestLevel] || 'bg-gray-100 text-gray-700'}`}>{f.studentInterestLevel}</span>
                </td>
                <td className="py-3 px-4 text-[13px] text-gray-600 max-w-xs truncate" title={f.counsellorNotes}>{f.counsellorNotes}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">
                  {f.nextFollowUpDate ? <span className="flex items-center gap-1"><Calendar size={13} className="text-gray-400" />{new Date(f.nextFollowUpDate).toLocaleDateString()}</span> : <span className="text-gray-400">-</span>}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <button onClick={() => handleView(f)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={15} className="text-gray-500" /></button>
                    <button onClick={() => handleEdit(f)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit2 size={15} className="text-gray-500" /></button>
                    <button onClick={() => handleDelete(f._id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={15} className="text-red-500" /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="9" className="py-8 text-center text-gray-500 text-[13px]">No follow-ups found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-[12px] text-gray-500">Showing {filtered.length} follow-ups</p>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">{editingId ? 'Edit Follow-up' : 'Add Follow-up'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Enquiry No.</label>
                <input type="text" name="enquiryNo" value={formData.enquiryNo} onChange={handleChange} placeholder="e.g. ENQ/2024/001" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]" disabled={!!editingId} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Follow-up Date</label>
                <input type="date" name="followUpDate" value={formData.followUpDate} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Next Follow-up Date</label>
                <input type="date" name="nextFollowUpDate" value={formData.nextFollowUpDate} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Call Status</label>
                <select name="callStatus" value={formData.callStatus} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]">
                  {Object.keys(callStatusColors).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Interest Level</label>
                <select name="interestLevel" value={formData.interestLevel} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]">
                  {Object.keys(interestColors).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Counsellor Notes</label>
                <textarea name="counsellorNotes" value={formData.counsellorNotes} onChange={handleChange} rows={3} placeholder="Add notes..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold">
                {editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedFollowUp && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-gray-800">Follow-up Details</h3>
                <p className="text-[12px] text-gray-500 mt-1">{selectedFollowUp.followUpNo}</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Student Name</p>
                  <p className="text-[13px] text-gray-800 font-medium">{selectedFollowUp.enquiryId?.studentName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Mobile</p>
                  <p className="text-[13px] text-gray-800 font-medium">{selectedFollowUp.enquiryId?.mobileNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Follow-up Date</p>
                  <p className="text-[13px] text-gray-800 font-medium">{new Date(selectedFollowUp.followUpDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Next Follow-up Date</p>
                  <p className="text-[13px] text-gray-800 font-medium">{selectedFollowUp.nextFollowUpDate ? new Date(selectedFollowUp.nextFollowUpDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Call Status</p>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold inline-block ${callStatusColors[selectedFollowUp.callStatus] || 'bg-gray-100 text-gray-700'}`}>{selectedFollowUp.callStatus}</span>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Interest Level</p>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold inline-block ${interestColors[selectedFollowUp.studentInterestLevel] || 'bg-gray-100 text-gray-700'}`}>{selectedFollowUp.studentInterestLevel}</span>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Counsellor Notes</p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[13px] text-gray-700">{selectedFollowUp.counsellorNotes || 'No notes provided.'}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowViewModal(false)} className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-[13px] font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUps;
