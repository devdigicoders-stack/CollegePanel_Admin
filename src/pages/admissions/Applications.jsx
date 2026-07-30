import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Eye, MoreVertical, ChevronDown, Download, X, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import SkeletonLoader from '../../components/SkeletonLoader';

const statusColors = {
  'Incomplete': 'bg-gray-100 text-gray-700',
  'Pending Verification': 'bg-orange-100 text-orange-700',
  'Verified': 'bg-blue-100 text-blue-700',
  'Approved': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700',
  'On Hold': 'bg-yellow-100 text-yellow-700',
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '', parentName: '',
    course: 'Diploma in CE', category: 'General',
    academicSession: '2024-25', admissionType: 'Regular'
  });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admissions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { stage: 'Application' }
      });
      setApplications(res.data.admissions || res.data);
    } catch (error) {
      console.error('Error fetching applications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filtered = applications.filter(a => {
    const matchSearch = a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.appNo?.includes(search) || a.mobile?.includes(search);
    const matchStatus = filterStatus === 'All' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const generateAppNo = () => `APP/${new Date().getFullYear()}/${Math.floor(Math.random() * 900 + 100)}`;

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${import.meta.env.VITE_API_URL}/admissions`, {
        ...formData,
        appNo: generateAppNo(),
        stage: 'Application',
        status: 'Pending Verification'
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowModal(false);
      setFormData({ name: '', mobile: '', email: '', parentName: '', course: 'Diploma in CE', category: 'General', academicSession: '2024-25', admissionType: 'Regular' });
      fetchApplications();
    } catch (error) {
      console.error('Error creating application', error);
      alert(error.response?.data?.message || 'Error creating application');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Applications</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Manage student applications</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">
            <Download size={15} /> Export
          </button>
          <button onClick={() => setShowModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2">
            <Plus size={16} /> New Application
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by app no., name, mobile..." value={search} onChange={e => setSearch(e.target.value)}
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
      </div>

      <div className="flex-1 overflow-auto p-6">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              {['App No.','Student Name','Course','Category','Applied On','Documents','Status','Actions'].map(h => (
                <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="py-8"><SkeletonLoader type="table" rows={3} cols={8} /></td></tr>
            ) : filtered.length > 0 ? filtered.map(a => {
              const totalDocs = a.documents?.length || 0;
              const verifiedDocs = a.documents?.filter(d => d.status === 'Verified').length || 0;
              return (
                <tr key={a._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{a.appNo}</td>
                  <td className="py-3 px-4">
                    <p className="text-[13px] font-medium text-gray-800">{a.name}</p>
                    <p className="text-[11px] text-gray-500">{a.mobile}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-[13px] text-gray-700">{a.course}</p>
                    <p className="text-[11px] text-gray-500">{a.academicSession}</p>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{a.category || '-'}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{verifiedDocs}/{totalDocs}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[a.status] || 'bg-gray-100 text-gray-700'}`}>{a.status || 'Pending'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={15} className="text-gray-500" /></button>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit2 size={15} className="text-gray-500" /></button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-500 text-[13px]">No applications found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-[12px] text-gray-500">Showing {filtered.length} applications</p>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">New Application</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
              {[
                { label: 'Student Name', name: 'name' },
                { label: 'Mobile Number', name: 'mobile' },
                { label: 'Email', name: 'email' },
                { label: 'Parent Name', name: 'parentName' }
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{f.label}</label>
                  <input type="text" name={f.name} value={formData[f.name]} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]" />
                </div>
              ))}
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Course</label>
                <select name="course" value={formData.course} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]">
                  {['Diploma in CE', 'Diploma in IT', 'Diploma in ME', 'Diploma in EE'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]">
                  {['General', 'OBC', 'SC', 'ST', 'EWS'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Academic Session</label>
                <select name="academicSession" value={formData.academicSession} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]">
                  {['2024-25', '2025-26'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Admission Type</label>
                <select name="admissionType" value={formData.admissionType} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px]">
                  {['Regular', 'Lateral Entry', 'Management Quota'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 mt-auto">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold">Save Application</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
