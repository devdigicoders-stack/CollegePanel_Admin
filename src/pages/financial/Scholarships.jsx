import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, ChevronDown, Download, X ,CheckCircle,XCircle  } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const statusColors = {
  'Sanctioned': 'bg-green-100 text-green-700',
  'Approved': 'bg-blue-100 text-blue-700',
  'Partial': 'bg-orange-100 text-orange-700',
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Under Review': 'bg-purple-100 text-purple-700',
  'Rejected': 'bg-red-100 text-red-700',
};

const Scholarships = () => {
  if (!checkPermission('Manage Fee Structure') && !checkPermission('View Fees')) {
    return <AccessDenied />;
  }
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '', enrollNo: '', name: '', course: '', scheme: '', type: 'Government', category: 'General', income: '', amount: '', sanctionStatus: 'Pending'
  });
  const [studentSearch, setStudentSearch] = useState('');
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewScholarship, setViewScholarship] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus !== 'All') params.sanctionStatus = filterStatus;
      if (filterType !== 'All') params.category = filterType;
      const res = await axiosInstance.get('/fees/scholarships', { params });
      setData(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch scholarships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterType, filterStatus]);

  const searchStudents = async () => {
    if (!studentSearch) return;
    setLoadingStudents(true);
    try {
      const res = await axiosInstance.get('/fees/student-fees', { params: { search: studentSearch } });
      setStudentsList(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to search students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setFormData({
      ...formData,
      studentId: student._id || student.id,
      enrollNo: student.enrollNo,
      name: student.studentName || student.name,
      course: student.course || student.courseName || ''
    });
    setStudentsList([]);
    setStudentSearch('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId) return toast.error('Please select a student');
    if (!formData.scheme || !formData.amount) return toast.error('Scheme and amount are required');
    
    try {
      await axiosInstance.post('/fees/scholarships', formData);
      toast.success('Scholarship added successfully');
      setShowModal(false);
      setFormData({ studentId: '', enrollNo: '', name: '', course: '', scheme: '', type: 'Government', category: 'General', income: '', amount: '', sanctionStatus: 'Pending' });
      setSelectedStudent(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add scholarship');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/fees/scholarships/${id}`, { sanctionStatus: status });
      toast.success(`Scholarship ${status.toLowerCase()} successfully`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update scholarship status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scholarship?')) return;
    try {
      await axiosInstance.delete(`/fees/scholarships/${id}`);
      toast.success('Scholarship deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete scholarship');
    }
  };

  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const userRole = adminInfo.role || 'college_admin';
  const canEdit = userRole === 'college_admin' || userRole === 'Accountant' || userRole === 'Principal';

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 pt-4 pb-4 border-b border-gray-100 gap-3">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Scholarships</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Track government and college scholarships</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => toast.success('Exporting...')} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">
            <Download size={15} /> Export
          </button>
          {canEdit && (
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold">
              <Plus size={15} /> Add Scholarship
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-3 gap-4">
        {[
          { label: 'Total Scholarship Amount', value: `₹${data.reduce((sum, s) => sum + (s.amount || 0), 0).toLocaleString()}`, color: 'bg-blue-50 text-blue-700' },
          { label: 'Amount Received', value: `₹${data.reduce((sum, s) => sum + (s.received || 0), 0).toLocaleString()}`, color: 'bg-green-50 text-green-700' },
          { label: 'Amount Pending', value: `₹${data.reduce((sum, s) => sum + (s.pending || 0), 0).toLocaleString()}`, color: 'bg-orange-50 text-orange-700' },
        ].map(card => (
          <div key={card.label} className={`${card.color} rounded-xl p-4`}>
            <p className="text-[11px] font-medium mb-1 opacity-80">{card.label}</p>
            <p className="text-[20px] font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name or enrollment no..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
        <div className="relative">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
            <option>All</option>
            <option>Government</option>
            <option>College</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
        <div className="relative">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
            <option>All</option>
            {Object.keys(statusColors).map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={11} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                {['Enroll No.', 'Student Name', 'Course', 'Scheme', 'Type', 'Category', 'Amount', 'Received', 'Pending', 'Sanction Status', 'Ledger Adj.', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(s => (
                <tr key={s._id || s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{s.enrollNo}</td>
                  <td className="py-3 px-4 text-[13px] font-medium text-gray-800">{s.name}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{s.course}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-700">{s.scheme}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.type === 'Government' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>{s.type}</span>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{s.category}</td>
                  <td className="py-3 px-4 text-[13px] font-semibold text-gray-800">₹{(s.amount || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] font-semibold text-green-700">₹{(s.received || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] font-semibold text-orange-600">₹{(s.pending || 0).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[s.sanctionStatus]}`}>{s.sanctionStatus}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.ledgerAdjusted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {s.ledgerAdjusted ? 'Done' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5">
                      <button onClick={() => setViewScholarship(s)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="View Details"><Eye size={15} className="text-gray-500" /></button>
                      {canEdit && (
                        <>
                          <button onClick={() => handleUpdateStatus(s._id || s.id, 'Approved')} className="p-1.5 hover:bg-green-100 rounded-lg" title="Approve"><CheckCircle size={15} className="text-green-600" /></button>
                          <button onClick={() => handleDelete(s._id || s.id)} className="p-1.5 hover:bg-red-100 rounded-lg" title="Delete"><X size={15} className="text-red-600" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && data.length === 0 && (
                <tr><td colSpan={12} className="py-8 text-center text-gray-500 text-[13px]">No scholarships found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">Add Scholarship</h3>
              <button onClick={() => { setShowModal(false); setSelectedStudent(null); setStudentsList([]); setStudentSearch(''); }} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {!selectedStudent ? (
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Search Student</label>
                  <div className="relative flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search by name, enroll no..." 
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchStudents())}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                      />
                    </div>
                    <button type="button" onClick={searchStudents} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-[13px] font-semibold transition-colors">
                      {loadingStudents ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                  {studentsList.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                      {studentsList.map(s => (
                        <div key={s._id || s.id} onClick={() => handleSelectStudent(s)} className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex flex-col">
                          <span className="text-[13px] font-semibold text-gray-800">{s.studentName || s.name}</span>
                          <span className="text-[11px] text-gray-500">{s.enrollNo} • {s.course || s.courseName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">{selectedStudent.studentName || selectedStudent.name}</p>
                    <p className="text-[11px] text-gray-600">{selectedStudent.enrollNo} • {selectedStudent.course || selectedStudent.courseName}</p>
                  </div>
                  <button type="button" onClick={() => { setSelectedStudent(null); setFormData({ ...formData, studentId: '', name: '', enrollNo: '', course: '' }); }} className="text-[12px] text-red-600 font-medium hover:underline">Change</button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Scholarship Scheme Name', placeholder: 'Enter scheme name', key: 'scheme' },
                  { label: 'Scholarship Amount (₹)', placeholder: 'Enter amount', key: 'amount', type: 'number' },
                  { label: 'Annual Family Income', placeholder: 'Enter income', key: 'income', type: 'number' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{f.label}</label>
                    <input type={f.type || 'text'} placeholder={f.placeholder} value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
                  </div>
                ))}
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Scholarship Type</label>
                  <div className="relative">
                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value})} className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                      {['Government', 'College', 'Merit', 'Sports', 'Other'].map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Category</label>
                  <div className="relative">
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value})} className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                      {['General', 'OBC', 'SC', 'ST', 'Minority', 'Other'].map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Sanction Status</label>
                  <div className="relative">
                    <select value={formData.sanctionStatus} onChange={e => setFormData({ ...formData, sanctionStatus: e.target.value})} className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                      {['Pending', 'Sanctioned', 'Rejected'].map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setSelectedStudent(null); setStudentsList([]); setStudentSearch(''); }} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold">Save Scholarship</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewScholarship && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">Scholarship Details</h3>
              <button onClick={() => setViewScholarship(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[11px] text-gray-500">Student Name</p><p className="text-[13px] font-semibold">{viewScholarship.name}</p></div>
                <div><p className="text-[11px] text-gray-500">Enrollment No</p><p className="text-[13px] font-semibold">{viewScholarship.enrollNo}</p></div>
                <div><p className="text-[11px] text-gray-500">Course</p><p className="text-[13px] font-semibold">{viewScholarship.course}</p></div>
                <div><p className="text-[11px] text-gray-500">Scheme</p><p className="text-[13px] font-semibold">{viewScholarship.scheme}</p></div>
                <div><p className="text-[11px] text-gray-500">Type</p><p className="text-[13px] font-semibold">{viewScholarship.type}</p></div>
                <div><p className="text-[11px] text-gray-500">Category</p><p className="text-[13px] font-semibold">{viewScholarship.category}</p></div>
                <div><p className="text-[11px] text-gray-500">Amount</p><p className="text-[13px] font-semibold text-blue-700">₹{(viewScholarship.amount || 0).toLocaleString()}</p></div>
                <div><p className="text-[11px] text-gray-500">Received</p><p className="text-[13px] font-semibold text-green-700">₹{(viewScholarship.received || 0).toLocaleString()}</p></div>
                <div><p className="text-[11px] text-gray-500">Pending</p><p className="text-[13px] font-semibold text-orange-600">₹{(viewScholarship.pending || 0).toLocaleString()}</p></div>
                <div><p className="text-[11px] text-gray-500">Sanction Status</p>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[viewScholarship.sanctionStatus]}`}>{viewScholarship.sanctionStatus}</span>
                </div>
                <div><p className="text-[11px] text-gray-500">Ledger Adjusted</p>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${viewScholarship.ledgerAdjusted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {viewScholarship.ledgerAdjusted ? 'Done' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setViewScholarship(null)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-[13px] font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scholarships;


