import { useState, useEffect } from 'react';
import { Search, ChevronDown, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const statusColors = {
  'Paid': 'bg-green-100 text-green-700',
  'Upcoming': 'bg-blue-100 text-blue-700',
  'Overdue': 'bg-red-100 text-red-700',
  'Pending': 'bg-gray-100 text-gray-600',
};

const StatusIcon = ({ status }) => {
  if (status === 'Paid') return <CheckCircle size={14} className="text-green-600" />;
  if (status === 'Overdue') return <AlertCircle size={14} className="text-red-600" />;
  return <Clock size={14} className="text-gray-400" />;
};

const Installments = () => {
  if (!checkPermission('View Fees') && !checkPermission('Collect Fees')) {
    return <AccessDenied />;
  }
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');
  const [showExtModal, setShowExtModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [extForm, setExtForm] = useState({ enrollNo: '', installmentNo: '', newDueDate: '', reason: '' });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axiosInstance.get('/academics/courses');
        const courseList = res.data?.data || res.data || [];
        setCourses(courseList.map(c => c.name || c.courseName).filter(Boolean));
      } catch (error) {
        console.error('Failed to fetch courses', error);
      }
    };
    fetchCourses();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCourse !== 'All') params.course = filterCourse;
      if (search) params.search = search;
      const res = await axiosInstance.get('/fees/installments', { params });
      setData(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch installments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterCourse, search]);

  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const userRole = adminInfo.role || 'college_admin';
  const canEdit = userRole === 'college_admin' || userRole === 'Accountant' || userRole === 'Principal';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Installments</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Track student installment plans and payment status</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowExtModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold">
            Extension Request
          </button>
        )}
      </div>

      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name or enrollment no..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
        <div className="relative">
          <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
            <option>All</option>
            {courses.length > 0 ? courses.map(c => <option key={c}>{c}</option>) : ['Diploma in CE', 'Diploma in IT', 'Diploma in ME', 'Diploma in EE'].map(c => <option key={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <SkeletonLoader type="table" rows={4} cols={7} />
        ) : (
          data.map(student => {
            const paidCount = (student.installments || []).filter(i => i.status === 'Paid').length;
            return (
              <div key={student._id || student.id} className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-800">{student.name}</h4>
                    <p className="text-[12px] text-gray-500">{student.enrollNo} • {student.course}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-gray-500">Installments Paid</p>
                    <p className="text-[16px] font-bold text-gray-800">{paidCount} / {(student.installments || []).length}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-gray-50 border-y border-gray-100">
                        {['#', 'Fee Head', 'Amount', 'Due Date', 'Paid Date', 'Status', 'Action'].map(h => (
                          <th key={h} className="py-2.5 px-4 text-[12px] font-bold text-gray-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(student.installments || []).map(inst => (
                        <tr key={inst._id || inst.no} className="border-b border-gray-50">
                          <td className="py-2.5 px-4 text-[13px] text-gray-600">{inst.no}</td>
                          <td className="py-2.5 px-4 text-[13px] text-gray-700">{inst.head}</td>
                          <td className="py-2.5 px-4 text-[13px] font-semibold text-gray-800">₹{(inst.amount || 0).toLocaleString()}</td>
                          <td className="py-2.5 px-4 text-[13px] text-gray-600">{inst.dueDate ? new Date(inst.dueDate).toLocaleDateString('en-GB') : '-'}</td>
                          <td className="py-2.5 px-4 text-[13px] text-gray-600">{inst.paidDate ? new Date(inst.paidDate).toLocaleDateString('en-GB') : <span className="text-gray-400">-</span>}</td>
                          <td className="py-2.5 px-4">
                            <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[inst.status]}`}>
                              <StatusIcon status={inst.status} />{inst.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            {canEdit && inst.status !== 'Paid' && (
                              <button onClick={() => navigate('/financial/fee-collection', { state: { student, amount: inst.amount, feeHead: inst.head } })} className="text-[12px] font-semibold text-[#0A6C54] hover:underline">Collect</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
        {!loading && data.length === 0 && (
          <div className="py-8 text-center text-gray-500 text-[13px]">No installments found</div>
        )}
      </div>

      {showExtModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">Installment Extension Request</h3>
              <button onClick={() => setShowExtModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Student Enrollment No.</label>
                <input type="text" placeholder="e.g. OP/24/CE/001" value={extForm.enrollNo} onChange={e => setExtForm({ ...extForm, enrollNo: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Installment No.</label>
                <input type="text" placeholder="e.g. 2" value={extForm.installmentNo} onChange={e => setExtForm({ ...extForm, installmentNo: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Requested New Due Date</label>
                <input type="date" value={extForm.newDueDate} onChange={e => setExtForm({ ...extForm, newDueDate: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Reason for Extension</label>
                <textarea rows={3} placeholder="Explain reason..." value={extForm.reason} onChange={e => setExtForm({ ...extForm, reason: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => { setShowExtModal(false); setExtForm({ enrollNo: '', installmentNo: '', newDueDate: '', reason: '' }); }} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={async () => { 
                if(!extForm.enrollNo || !extForm.installmentNo || !extForm.newDueDate) return toast.error('Please fill required fields');
                try {
                  await axiosInstance.post('/fees/installments/extension', extForm);
                  toast.success('Extension applied successfully'); 
                  setShowExtModal(false); 
                  setExtForm({ enrollNo: '', installmentNo: '', newDueDate: '', reason: '' });
                  fetchData(); // refresh data
                } catch(e) {
                  toast.error(e.response?.data?.message || 'Failed to apply extension');
                }
              }} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold">Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Installments;

