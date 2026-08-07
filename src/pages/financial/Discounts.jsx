import { useState, useEffect } from 'react';
import { Search, Plus, Eye, ChevronDown, CheckCircle, XCircle, X, Download } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const statusColors = {
  'Approved': 'bg-green-100 text-green-700',
  'Pending': 'bg-orange-100 text-orange-700',
  'Under Review': 'bg-blue-100 text-blue-700',
  'Rejected': 'bg-red-100 text-red-700',
};

const discountTypes = ['Sibling Discount', 'Staff Ward Discount', 'Merit Discount', 'Sports Concession', 'Financial Assistance', 'Special Approval', 'Early Payment Discount'];

const Discounts = () => {
  if (!checkPermission('Manage Fee Structure') && !checkPermission('View Fees')) {
    return <AccessDenied />;
  }
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '', enrollNo: '', name: '', course: '', type: 'Merit Discount', amount: '', appliedTo: 'Tuition Fee', remarks: ''
  });
  const [studentSearch, setStudentSearch] = useState('');
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewDiscount, setViewDiscount] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus !== 'All') params.status = filterStatus;
      const res = await axiosInstance.get('/fees/discounts', { params });
      setData(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch discounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterStatus]);

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
    if (!formData.amount) return toast.error('Amount is required');
    try {
      await axiosInstance.post('/fees/discounts', formData);
      toast.success('Discount request submitted successfully');
      setShowModal(false);
      setFormData({ studentId: '', enrollNo: '', name: '', course: '', type: 'Merit Discount', amount: '', appliedTo: 'Tuition Fee', remarks: '' });
      setSelectedStudent(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit discount request');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/fees/discounts/${id}`, { status });
      toast.success(`Discount ${status.toLowerCase()} successfully`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update discount status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discount?')) return;
    try {
      await axiosInstance.delete(`/fees/discounts/${id}`);
      toast.success('Discount deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete discount');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Discounts & Concessions</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Manage student fee discounts and concessions</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => toast.success('Exporting...')} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">
            <Download size={15} /> Export
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold">
            <Plus size={15} /> New Discount Request
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Approved', value: `₹${data.filter(d => d.status === 'Approved').reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}`, color: 'bg-green-50 text-green-700' },
          { label: 'Pending Requests', value: data.filter(d => d.status === 'Pending').length, color: 'bg-orange-50 text-orange-700' },
          { label: 'Under Review', value: data.filter(d => d.status === 'Under Review').length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Total Requests', value: data.length, color: 'bg-purple-50 text-purple-700' },
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
          <SkeletonLoader type="table" rows={5} cols={10} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                {['Enroll No.', 'Student Name', 'Course', 'Discount Type', 'Amount', 'Applied To', 'Request Date', 'Approved By', 'Status', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-700 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(d => (
                <tr key={d._id || d.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54] whitespace-nowrap">{d.enrollNo}</td>
                  <td className="py-3 px-4 text-[13px] font-medium text-gray-800 whitespace-nowrap">{d.name}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 whitespace-nowrap">{d.course}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-700 whitespace-nowrap">{d.type}</td>
                  <td className="py-3 px-4 text-[13px] font-semibold text-blue-700 whitespace-nowrap">₹{(d.amount || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 whitespace-nowrap">{d.appliedTo}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 whitespace-nowrap">
                    {d.requestDate ? new Date(d.requestDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                  </td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 whitespace-nowrap">{d.approvedBy || <span className="text-gray-400">-</span>}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${statusColors[d.status]}`}>{d.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setViewDiscount(d)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="View Details"><Eye size={15} className="text-gray-500" /></button>
                      {d.status === 'Pending' && (
                        <>
                          <button onClick={() => handleUpdateStatus(d._id || d.id, 'Approved')} className="p-1.5 hover:bg-green-100 rounded-lg" title="Approve"><CheckCircle size={15} className="text-green-600" /></button>
                          <button onClick={() => handleUpdateStatus(d._id || d.id, 'Rejected')} className="p-1.5 hover:bg-red-100 rounded-lg" title="Reject"><XCircle size={15} className="text-red-600" /></button>
                        </>
                      )}
                      <button onClick={() => handleDelete(d._id || d.id)} className="p-1.5 hover:bg-red-100 rounded-lg" title="Delete"><X size={15} className="text-red-600" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && data.length === 0 && (
                <tr><td colSpan={10} className="py-8 text-center text-gray-500 text-[13px]">No discounts found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">New Discount Request</h3>
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
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Discount Type</label>
                  <div className="relative">
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value})} className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {discountTypes.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Discount Amount (₹)</label>
                <input type="number" placeholder="Enter amount" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Apply To</label>
                <div className="relative">
                  <select value={formData.appliedTo} onChange={e => setFormData({ ...formData, appliedTo: e.target.value})} className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {['Tuition Fee', 'Total Fee', 'Admission Fee', 'Exam Fee'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Reason / Remarks</label>
                <textarea rows={3} placeholder="Explain reason for discount..." value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setSelectedStudent(null); setStudentsList([]); setStudentSearch(''); }} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewDiscount && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">Discount Details</h3>
              <button onClick={() => setViewDiscount(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[11px] text-gray-500">Student Name</p><p className="text-[13px] font-semibold">{viewDiscount.name}</p></div>
                <div><p className="text-[11px] text-gray-500">Enrollment No</p><p className="text-[13px] font-semibold">{viewDiscount.enrollNo}</p></div>
                <div><p className="text-[11px] text-gray-500">Course</p><p className="text-[13px] font-semibold">{viewDiscount.course}</p></div>
                <div><p className="text-[11px] text-gray-500">Discount Type</p><p className="text-[13px] font-semibold">{viewDiscount.type}</p></div>
                <div><p className="text-[11px] text-gray-500">Amount</p><p className="text-[13px] font-semibold text-blue-700">₹{(viewDiscount.amount || 0).toLocaleString()}</p></div>
                <div><p className="text-[11px] text-gray-500">Applied To</p><p className="text-[13px] font-semibold">{viewDiscount.appliedTo}</p></div>
                <div><p className="text-[11px] text-gray-500">Status</p>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[viewDiscount.status]}`}>{viewDiscount.status}</span>
                </div>
                <div><p className="text-[11px] text-gray-500">Request Date</p><p className="text-[13px] font-semibold">{viewDiscount.requestDate ? new Date(viewDiscount.requestDate).toLocaleDateString('en-GB') : '-'}</p></div>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Remarks</p>
                <p className="text-[13px] p-3 bg-gray-50 rounded-lg">{viewDiscount.remarks || 'No remarks provided.'}</p>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setViewDiscount(null)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-[13px] font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discounts;


