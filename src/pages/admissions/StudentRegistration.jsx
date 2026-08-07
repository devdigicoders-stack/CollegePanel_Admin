import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, X, UserCheck, Users, ClipboardList, BookOpen } from 'lucide-react';
import axios from 'axios';
import SkeletonLoader from '../../components/SkeletonLoader';
import toast from 'react-hot-toast';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const StudentRegistration = () => {
  if (!checkPermission('Add Admission') && !checkPermission('Edit Admission')) {
    return <AccessDenied />;
  }
  const [admissions, setAdmissions] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [registering, setRegistering] = useState(false);

  // Dynamic dropdowns
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);

  const [regForm, setRegForm] = useState({
    enrollNo: '', studentId: '', rollNo: '', semester: '', section: ''
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

  const fetchAcademics = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const [semRes, secRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/academics/semesters`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/academics/sections`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setSemesters(semRes.data.data || semRes.data || []);
      setSections(secRes.data.data || secRes.data || []);
    } catch (error) {
      console.error('Error fetching academics', error);
    }
  };

  useEffect(() => {
    fetchAdmissions();
    fetchAcademics();
  }, []);

  const openRegisterModal = (admission) => {
    setSelectedAdmission(admission);
    // Pre-fill if already partially registered
    setRegForm({
      enrollNo: admission.enrollNo || '',
      studentId: admission.studentId || '',
      rollNo: admission.rollNo || '',
      semester: admission.semester || (semesters.length > 0 ? semesters[0].semesterNumber : ''),
      section: admission.section || (sections.length > 0 ? sections[0].name : '')
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
      toast.success('Student Registered Successfully!');
      setShowModal(false);
      setSelectedAdmission(null);
      fetchAdmissions();
    } catch (error) {
      console.error('Error registering student', error);
      toast.error(error.response?.data?.message || 'Error registering student');
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
      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Admitted', value: totalAdmitted, icon: Users, color: 'bg-blue-50 text-blue-700' },
          { label: 'Registered', value: registered, icon: UserCheck, color: 'bg-green-50 text-green-700' },
          { label: 'Pending Registration', value: pending, icon: ClipboardList, color: 'bg-orange-50 text-orange-700' },
        ].map(card => (
          <div key={card.label} className={`${card.color} rounded-xl p-3 flex items-center gap-3 border border-gray-100 shadow-sm`}>
            <div className="p-2 bg-white/50 rounded-lg"><card.icon size={22} /></div>
            <div>
              <p className="text-[11px] font-semibold opacity-90">{card.label}</p>
              <p className="text-[22px] font-bold leading-tight">{loading ? '...' : card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name or app no..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
        <div className="flex gap-2">
          {['All', 'Pending Registration', 'Registered'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2.5 rounded-lg text-[12px] font-semibold transition-colors ${filterStatus === s ? 'bg-[#0A6C54] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50/30">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-6"><SkeletonLoader type="table" rows={5} cols={11} /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-[13px] font-medium">
                {admissions.length === 0 
                  ? 'No admitted students found. Approve admissions first.' 
                  : 'No students match the current filter.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['App No.','Student Name','Course','Session','Sem','Sec','Enroll No.','Student ID','Roll No.','Status','Actions'].map(h => (
                      <th key={h} className="py-2.5 px-3 text-[12px] font-bold text-gray-700 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                      <td className="py-2 px-3 text-[12px] font-bold text-[#0A6C54] whitespace-nowrap">{r.appNo}</td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[11px]">
                            {r.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-gray-800">{r.name}</p>
                            <p className="text-[10px] font-medium text-gray-500">{r.mobile}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-[12px] font-medium text-gray-700 whitespace-nowrap">{r.course}</td>
                      <td className="py-2 px-3 text-[11px] text-gray-600 whitespace-nowrap">{r.academicSession || '-'}</td>
                      <td className="py-2 px-3 text-[11px] text-gray-600 whitespace-nowrap">{r.semester || '-'}</td>
                      <td className="py-2 px-3 text-[11px] text-gray-600 whitespace-nowrap">{r.section || '-'}</td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {r.enrollNo ? <span className="text-[12px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{r.enrollNo}</span> : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {r.studentId ? <span className="text-[12px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{r.studentId}</span> : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {r.rollNo ? <span className="text-[12px] font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{r.rollNo}</span> : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                          r.registrationStatus === 'Registered' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {r.registrationStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {r.registrationStatus !== 'Registered' ? (
                          <button
                            onClick={() => openRegisterModal(r)}
                            className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <CheckCircle size={12} /> Register
                          </button>
                        ) : (
                          <button
                            onClick={() => openRegisterModal(r)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg text-[11px] font-bold transition-colors"
                            title="View / Edit"
                          >
                            <Eye size={12} /> Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      {showModal && selectedAdmission && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl flex-shrink-0">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[14px]">
                    {selectedAdmission.name?.charAt(0).toUpperCase()}
                 </div>
                 <div>
                  <h3 className="text-[16px] font-bold text-gray-800">Register Student</h3>
                  <p className="text-[12px] font-medium text-gray-500 mt-0.5">{selectedAdmission.name} • {selectedAdmission.course}</p>
                 </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={18} className="text-gray-500" /></button>
            </div>

            <div className="overflow-y-auto flex-1">
              {/* Student Info Preview */}
              <div className="px-6 pt-5 pb-2">
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 grid grid-cols-2 gap-4">
                  {[
                    { label: 'App No.', value: selectedAdmission.appNo },
                    { label: 'Mobile', value: selectedAdmission.mobile },
                    { label: 'Category', value: selectedAdmission.category || 'General' },
                    { label: 'Session', value: selectedAdmission.academicSession || '-' },
                  ].map(item => (
                    <div key={item.label}>
                      <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">{item.label}</p>
                      <p className="text-[13px] font-semibold text-gray-800">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                <div className="md:col-span-2">
                  <p className="text-[12px] font-medium text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <span className="font-bold text-gray-700">Note:</span> Leave fields empty to auto-generate IDs based on college configuration.
                  </p>
                </div>
                {[
                  { label: 'Enrollment No.', name: 'enrollNo', placeholder: 'e.g. ENR/2024/001' },
                  { label: 'Student ID', name: 'studentId', placeholder: 'e.g. STU2024001' },
                  { label: 'Roll No.', name: 'rollNo', placeholder: 'e.g. 101' },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1.5">{f.label}</label>
                    <input
                      type="text"
                      value={regForm[f.name]}
                      onChange={e => setRegForm({ ...regForm, [f.name]: e.target.value })}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] transition-shadow placeholder:text-gray-300"
                    />
                  </div>
                ))}
                
                {/* Dynamic Semesters Dropdown */}
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Semester</label>
                  <select
                    value={regForm.semester}
                    onChange={e => setRegForm({ ...regForm, semester: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(s => <option key={s._id || s.semesterNumber} value={s.semesterNumber}>Semester {s.semesterNumber}</option>)}
                  </select>
                </div>

                {/* Dynamic Sections Dropdown */}
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Section</label>
                  <select
                    value={regForm.section}
                    onChange={e => setRegForm({ ...regForm, section: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="">Select Section</option>
                    {sections.map(s => <option key={s._id || s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl flex-shrink-0">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleRegister}
                disabled={registering}
                className="bg-[#0A6C54] hover:bg-[#085a46] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                <CheckCircle size={16} />
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
