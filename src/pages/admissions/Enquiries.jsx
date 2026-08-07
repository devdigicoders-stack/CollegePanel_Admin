import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Eye, ChevronDown, Download, X, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import SkeletonLoader from '../../components/SkeletonLoader';

const statusColors = {
  'New': 'bg-blue-100 text-blue-700',
  'Contacted': 'bg-purple-100 text-purple-700',
  'Interested': 'bg-green-100 text-green-700',
  'Follow-up': 'bg-orange-100 text-orange-700',
  'Not Interested': 'bg-red-100 text-red-700',
  'Converted': 'bg-emerald-100 text-emerald-700',
  'Closed': 'bg-gray-100 text-gray-700',
};

const sourceColors = {
  'Website': 'bg-blue-50 text-blue-700',
  'Phone Call': 'bg-purple-50 text-purple-700',
  'Walk-in': 'bg-green-50 text-green-700',
  'Social Media': 'bg-pink-50 text-pink-700',
  'Referral': 'bg-orange-50 text-orange-700',
  'Education Fair': 'bg-indigo-50 text-indigo-700',
  'Advertisement': 'bg-yellow-50 text-yellow-700',
};

const Enquiries = () => {
  if (!checkPermission('View Admissions')) {
    return <AccessDenied />;
  }
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    studentName: '', mobileNumber: '', email: '', parentName: '', city: '', 
    previousQualification: '', courseInterested: 'Diploma in CE', 
    enquirySource: 'Website', status: 'New', remarks: ''
  });

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/enquiries`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search, status: filterStatus, source: filterSource }
      });
      setEnquiries(res.data);
    } catch (error) {
      console.error('Error fetching enquiries', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEnquiries();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, filterStatus, filterSource]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (enquiry) => {
    setEditingId(enquiry._id);
    setFormData({
      studentName: enquiry.studentName || '',
      mobileNumber: enquiry.mobileNumber || '',
      email: enquiry.email || '',
      parentName: enquiry.parentName || '',
      city: enquiry.city || '',
      previousQualification: enquiry.previousQualification || '',
      courseInterested: enquiry.courseInterested || 'Diploma in CE',
      enquirySource: enquiry.enquirySource || 'Website',
      status: enquiry.status || 'New',
      remarks: enquiry.remarks || ''
    });
    setShowModal(true);
  };

  const handleView = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/enquiries/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Enquiry deleted successfully');
      fetchEnquiries();
    } catch(error) {
      toast.error('Failed to delete enquiry');
    }
  }

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/enquiries/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Enquiry updated successfully');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/enquiries`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Enquiry added successfully');
      }
      
      setShowModal(false);
      setEditingId(null);
      setFormData({
        studentName: '', mobileNumber: '', email: '', parentName: '', city: '', 
        previousQualification: '', courseInterested: 'Diploma in CE', 
        enquirySource: 'Website', status: 'New', remarks: ''
      });
      fetchEnquiries();
    } catch (error) {
      console.error('Error saving enquiry', error);
      toast.error('Error saving enquiry');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      studentName: '', mobileNumber: '', email: '', parentName: '', city: '', 
      previousQualification: '', courseInterested: 'Diploma in CE', 
      enquirySource: 'Website', status: 'New', remarks: ''
    });
    setShowModal(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Enquiries</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Manage prospective student enquiries</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">
            <Download size={15} /> Export
          </button>
          <button onClick={openAddModal} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2">
            <Plus size={16} /> Add Enquiry
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search name, mobile, enquiry no..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
        <div className="relative">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
            <option value="All">All Status</option>
            {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
        <div className="relative">
          <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
            <option value="All">All Sources</option>
            {Object.keys(sourceColors).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              {['Enquiry No.','Student Name','Mobile','Course','Source','Date','Status','Actions'].map(h => (
                <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonLoader type="table" rows={6} cols={8} />
            ) : enquiries.length > 0 ? enquiries.map(e => (
              <tr key={e._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{e.enquiryNo}</td>
                <td className="py-3 px-4">
                  <p className="text-[13px] font-medium text-gray-800">{e.studentName}</p>
                  <p className="text-[11px] text-gray-500">{e.email}</p>
                </td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{e.mobileNumber}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{e.courseInterested}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${sourceColors[e.enquirySource] || 'bg-gray-100 text-gray-700'}`}>{e.enquirySource}</span>
                </td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{new Date(e.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[e.status] || 'bg-gray-100 text-gray-700'}`}>{e.status}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <button onClick={() => handleView(e)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={15} className="text-gray-500" /></button>
                    <button onClick={() => handleEdit(e)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit2 size={15} className="text-gray-500" /></button>
                    <button onClick={() => handleDelete(e._id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={15} className="text-red-500" /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-500 text-[13px]">No enquiries found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-[12px] text-gray-500">Showing {enquiries.length} enquiries</p>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">{editingId ? 'Edit Enquiry' : 'Add New Enquiry'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Student Name</label>
                <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Mobile Number</label>
                <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Parent Name</label>
                <input type="text" name="parentName" value={formData.parentName} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Previous Qualification</label>
                <input type="text" name="previousQualification" value={formData.previousQualification} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]" />
              </div>
              
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Course Interested</label>
                <select name="courseInterested" value={formData.courseInterested} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]">
                  {['Diploma in CE', 'Diploma in IT', 'Diploma in ME', 'Diploma in EE', 'B.Tech CSE', 'B.Tech ECE', 'B.Tech ME', 'MBA'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Enquiry Source</label>
                <select name="enquirySource" value={formData.enquirySource} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]">
                  {Object.keys(sourceColors).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]">
                  {Object.keys(statusColors).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Remarks</label>
                <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 mt-auto">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold">
                {editingId ? 'Update Enquiry' : 'Save Enquiry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-gray-800">Enquiry Details</h3>
                <p className="text-[12px] text-gray-500 mt-1">{selectedEnquiry.enquiryNo}</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Student Name</p>
                  <p className="text-[13px] text-gray-800 font-medium">{selectedEnquiry.studentName}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Mobile</p>
                  <p className="text-[13px] text-gray-800 font-medium">{selectedEnquiry.mobileNumber}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Email</p>
                  <p className="text-[13px] text-gray-800 font-medium">{selectedEnquiry.email}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Parent Name</p>
                  <p className="text-[13px] text-gray-800 font-medium">{selectedEnquiry.parentName}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Course</p>
                  <p className="text-[13px] text-[#0A6C54] font-bold">{selectedEnquiry.courseInterested}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1">City</p>
                  <p className="text-[13px] text-gray-800 font-medium">{selectedEnquiry.city}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Status</p>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold inline-block ${statusColors[selectedEnquiry.status] || 'bg-gray-100 text-gray-700'}`}>{selectedEnquiry.status}</span>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Source</p>
                  <p className="text-[13px] text-gray-800 font-medium">{selectedEnquiry.enquirySource}</p>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Remarks</p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[13px] text-gray-700">{selectedEnquiry.remarks || 'No remarks provided.'}</p>
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

export default Enquiries;
