import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, X, UserCheck, Users, ClipboardList, BookOpen } from 'lucide-react';
import axios from 'axios';
import SkeletonLoader from '../../components/SkeletonLoader';

const StudentRegistration = () => {
  const [admissions, setAdmissions] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [registering, setRegistering] = useState(false);

  const [regForm, setRegForm] = useState({
    enrollNo: '', studentId: '', rollNo: '', semester: '1st', section: 'A'
  });

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      // Get admitted students only
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admissions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { stage: 'Admitted', limit: 100 }
      });
      setAdmissions(res.data.admissions || res.data);
    } catch (error) {
      console.error('Error fetching admissions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const openRegisterModal = (admission) => {
    setSelectedAdmission(admission);
    // Pre-fill if already partially registered
    setRegForm({
      enrollNo: admission.enrollNo || '',
      studentId: admission.studentId || '',
      rollNo: admission.rollNo || '',
      semester: admission.semester || '1st',
      section: admission.section || 'A'
    });
    setShowModal(true);
  };

  const handleRegister = async () => {
    if (!selectedAdmission) return;
    try {
      setRegistering(true);
      const token = localStorage.getItem('admin_token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admissions/${selectedAdmission._id}/register`,
        regForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setSelectedAdmission(null);
      fetchAdmissions();
    } catch (error) {
      console.error('Error registering student', error);
      alert(error.response?.data?.message || 'Error registering student');
    } finally {
      setRegistering(false);
    }
  };

  const filtered = admissions.filter(r => {
    const matchSearch = r.name?.toLowerCase().includes(search.toLowerCase()) || r.appNo?.includes(search);
    const matchStatus = filterStatus === 'All' || r.registrationStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  // Summary stats
  const totalAdmitted = admissions.length;
  const registered = admissions.filter(a => a.registrationStatus === 'Registered').length;
  const pending = admissions.filter(a => a.registrationStatus !== 'Registered').length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[18px] font-bold text-gray-800">Student Registration</h2>
        <p className="text-[12px] text-gray-500 mt-0.5">Generate student IDs and enrollment numbers after admission approval</p>
      </div>

      {/* Summary Cards */}
      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-3 gap-4">
        {[
          { label: 'Total Admitted', value: totalAdmitted, icon: Users, color: 'bg-blue-50 text-blue-700' },
          { label: 'Registered', value: registered, icon: UserCheck, color: 'bg-green-50 text-green-700' },
          { label: 'Pending Registration', value: pending, icon: ClipboardList, color: 'bg-orange-50 text-orange-700' },
        ].map(card => (
          <div key={card.label} className={`${card.color} rounded-xl p-4 flex items-center gap-3`}>
            <card.icon size={22} />
            <div>
              <p className="text-[11px] font-medium">{card.label}</p>
              <p className="text-[22px] font-bold leading-tight">{loading ? '...' : card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name or app no..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
        <div className="flex gap-2">
          {['All', 'Pending Registration', 'Registered'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors ${filterStatus === s ? 'bg-[#0A6C54] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={11} />
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-[13px]">
              {admissions.length === 0 
                ? 'No admitted students found. Approve admissions first.' 
                : 'No students match the current filter.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                {['App No.','Student Name','Course','Session','Semester','Section','Enrollment No.','Student ID','Roll No.','Status','Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{r.appNo}</td>
                  <td className="py-3 px-4">
                    <p className="text-[13px] font-medium text-gray-800">{r.name}</p>
                    <p className="text-[11px] text-gray-500">{r.mobile}</p>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{r.course}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{r.academicSession || '-'}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{r.semester || '-'}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{r.section || '-'}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">
                    {r.enrollNo ? <span className="font-semibold text-indigo-600">{r.enrollNo}</span> : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">
                    {r.studentId ? <span className="font-semibold text-purple-600">{r.studentId}</span> : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">
                    {r.rollNo ? <span className="font-semibold text-gray-700">{r.rollNo}</span> : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      r.registrationStatus === 'Registered' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {r.registrationStatus || 'Pending Registration'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {r.registrationStatus !== 'Registered' ? (
                      <button
                        onClick={() => openRegisterModal(r)}
                        className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-3 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1"
                      >
                        <CheckCircle size={13} /> Register
                      </button>
                    ) : (
                      <button
                        onClick={() => openRegisterModal(r)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg"
                        title="View / Edit"
                      >
                        <Eye size={15} className="text-gray-500" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Registration Modal */}
      {showModal && selectedAdmission && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-gray-800">Register Student</h3>
                <p className="text-[12px] text-gray-500 mt-0.5">{selectedAdmission.name} • {selectedAdmission.course}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>

            {/* Student Info Preview */}
            <div className="px-6 pt-4 pb-2">
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3">
                {[
                  { label: 'App No.', value: selectedAdmission.appNo },
                  { label: 'Mobile', value: selectedAdmission.mobile },
                  { label: 'Category', value: selectedAdmission.category || '-' },
                  { label: 'Session', value: selectedAdmission.academicSession || '-' },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-[11px] text-gray-500">{item.label}</p>
                    <p className="text-[13px] font-semibold text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <p className="text-[11px] text-gray-500 mb-3">Leave fields empty to auto-generate IDs</p>
              </div>
              {[
                { label: 'Enrollment No.', name: 'enrollNo', placeholder: 'e.g. ENR/2024/001 (auto)' },
                { label: 'Student ID', name: 'studentId', placeholder: 'e.g. STU2024001 (auto)' },
                { label: 'Roll No.', name: 'rollNo', placeholder: 'e.g. 101 (auto)' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{f.label}</label>
                  <input
                    type="text"
                    value={regForm[f.name]}
                    onChange={e => setRegForm({ ...regForm, [f.name]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Semester</label>
                <select
                  value={regForm.semester}
                  onChange={e => setRegForm({ ...regForm, semester: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                >
                  {['1st','2nd','3rd','4th','5th','6th'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Section</label>
                <select
                  value={regForm.section}
                  onChange={e => setRegForm({ ...regForm, section: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                >
                  {['A','B','C','D'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleRegister}
                disabled={registering}
                className="bg-[#0A6C54] hover:bg-[#085a46] disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2"
              >
                <CheckCircle size={15} />
                {registering ? 'Registering...' : 'Confirm Registration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRegistration;
