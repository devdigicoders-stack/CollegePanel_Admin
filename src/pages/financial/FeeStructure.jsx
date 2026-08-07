import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Eye, ChevronDown, Trash2, X } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const FeeStructure = () => {
  if (!checkPermission('Manage Fee Structure') && !checkPermission('View Fees')) {
    return <AccessDenied />;
  }
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  
  const [coursesList, setCoursesList] = useState([]);
  const [semestersList, setSemestersList] = useState([]);

  const [formData, setFormData] = useState({
    courseName: '', semester: '', admissionFee: '', tuitionFee: '', registrationFee: '', examFee: '', labFee: '', installments: '', dueDate: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCourse !== 'All') params.course = filterCourse;
      if (searchTerm) params.search = searchTerm;
      const res = await axiosInstance.get('/fees/fee-structures', { params });
      setData(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch fee structures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [courseRes, semRes] = await Promise.all([
          axiosInstance.get('/academics/courses'),
          axiosInstance.get('/academics/semesters')
        ]);
        setCoursesList(courseRes.data || []);
        setSemestersList(semRes.data || []);
      } catch (error) {
        console.error('Failed to fetch courses/semesters', error);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filterCourse, searchTerm]);

  const openAddModal = () => {
    setEditingItem(null);
    setIsViewOnly(false);
    setFormData({
      courseName: '', semester: '', admissionFee: '', tuitionFee: '', registrationFee: '', examFee: '', labFee: '', installments: '', dueDate: ''
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsViewOnly(false);
    setFormData({
      courseName: item.courseName,
      semester: item.semester,
      admissionFee: item.admissionFee,
      tuitionFee: item.tuitionFee,
      registrationFee: item.registrationFee,
      examFee: item.examFee,
      labFee: item.labFee,
      installments: item.installments,
      dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleView = (item) => {
    setEditingItem(item);
    setIsViewOnly(true);
    setFormData({
      courseName: item.courseName,
      semester: item.semester,
      admissionFee: item.admissionFee,
      tuitionFee: item.tuitionFee,
      registrationFee: item.registrationFee,
      examFee: item.examFee,
      labFee: item.labFee,
      installments: item.installments,
      dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fee structure?')) return;
    try {
      await axiosInstance.delete(`/fees/fee-structures/${id}`);
      toast.success('Fee structure deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete fee structure');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.courseName || !formData.semester) {
      return toast.error('Course and Semester are required');
    }

    try {
      const payload = {
        ...formData,
        total: (Number(formData.admissionFee) || 0) + 
               (Number(formData.tuitionFee) || 0) + 
               (Number(formData.registrationFee) || 0) + 
               (Number(formData.examFee) || 0) + 
               (Number(formData.labFee) || 0)
      };

      if (editingItem) {
        await axiosInstance.put(`/fees/fee-structures/${editingItem._id || editingItem.id}`, payload);
        toast.success('Fee structure updated successfully');
      } else {
        await axiosInstance.post('/fees/fee-structures', payload);
        toast.success('Fee structure created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Fee Structure Configuration</h2>
          <p className="text-[12px] text-gray-600 mt-1">Manage course-wise fee structure and components</p>
        </div>
        <button onClick={openAddModal} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Plus size={18} /> Add Fee Structure
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by course, semester..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>

        <div className="relative">
          <select 
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option value="All">All Courses</option>
            {coursesList.map(c => (
              <option key={c._id || c.name || c} value={c.name || c.courseName || c.title || c}>{c.name || c.courseName || c.title || c}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto p-6">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={9} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 whitespace-nowrap">Course</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 whitespace-nowrap">Semester</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-right whitespace-nowrap">Admission Fee</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-right whitespace-nowrap">Tuition Fee</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-right whitespace-nowrap">Reg. Fee</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-right whitespace-nowrap">Exam Fee</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-right whitespace-nowrap">Lab Fee</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-right whitespace-nowrap">Total</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center whitespace-nowrap">Installments</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center whitespace-nowrap">Due Date</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(fee => (
                <tr key={fee._id || fee.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-[13px] font-medium text-gray-800 whitespace-nowrap">{fee.courseName}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 whitespace-nowrap">{fee.semester}</td>
                  <td className="py-3 px-4 text-[13px] text-right text-gray-600 whitespace-nowrap">₹{(fee.admissionFee || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] text-right text-gray-600 whitespace-nowrap">₹{(fee.tuitionFee || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] text-right text-gray-600 whitespace-nowrap">₹{(fee.registrationFee || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] text-right text-gray-600 whitespace-nowrap">₹{(fee.examFee || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] text-right text-gray-600 whitespace-nowrap">₹{(fee.labFee || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] font-bold text-gray-800 text-right whitespace-nowrap">₹{((fee.admissionFee || 0) + (fee.tuitionFee || 0) + (fee.registrationFee || 0) + (fee.examFee || 0) + (fee.labFee || 0)).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 text-center whitespace-nowrap">{fee.installments || '-'}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 text-center whitespace-nowrap">{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : '-'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleView(fee)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View"><Eye size={16} className="text-gray-600" /></button>
                      <button onClick={() => handleEdit(fee)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit"><Edit2 size={16} className="text-gray-600" /></button>
                      <button onClick={() => handleDelete(fee._id || fee.id)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Delete"><Trash2 size={16} className="text-red-600" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && data.length === 0 && (
                <tr><td colSpan={10} className="py-8 text-center text-gray-500 text-[13px]">No fee structures found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-[12px] text-gray-600">Showing {data.length} fee structures</p>
        <div className="flex gap-2">
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50">Previous</button>
          <button className="px-3 py-2 bg-[#0A6C54] text-white rounded-lg text-[12px] font-medium">1</button>
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50">2</button>
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50">Next</button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">{isViewOnly ? 'View Fee Structure' : editingItem ? 'Edit Fee Structure' : 'New Fee Structure'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Course</label>
                <select disabled={isViewOnly} value={formData.courseName} onChange={e => setFormData({ ...formData, courseName: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] disabled:opacity-70 disabled:bg-gray-50">
                  <option value="">Select Course</option>
                  {coursesList.map(c => (
                    <option key={c._id || c.name || c} value={c.name || c.courseName || c.title || c}>{c.name || c.courseName || c.title || c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Semester</label>
                <select disabled={isViewOnly} value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] disabled:opacity-70 disabled:bg-gray-50">
                  <option value="">Select Semester</option>
                  {semestersList.map(s => (
                    <option key={s._id || s.semesterNumber || s} value={s.semesterNumber?.toString() || s.name || s.semesterName || s}>{s.semesterNumber?.toString() || s.name || s.semesterName || s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Admission Fee</label>
                <input disabled={isViewOnly} type="number" placeholder="0" value={formData.admissionFee} onChange={e => setFormData({ ...formData, admissionFee: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] disabled:opacity-70 disabled:bg-gray-50" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Tuition Fee</label>
                <input disabled={isViewOnly} type="number" placeholder="0" value={formData.tuitionFee} onChange={e => setFormData({ ...formData, tuitionFee: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] disabled:opacity-70 disabled:bg-gray-50" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Registration Fee</label>
                <input disabled={isViewOnly} type="number" placeholder="0" value={formData.registrationFee} onChange={e => setFormData({ ...formData, registrationFee: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] disabled:opacity-70 disabled:bg-gray-50" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Exam Fee</label>
                <input disabled={isViewOnly} type="number" placeholder="0" value={formData.examFee} onChange={e => setFormData({ ...formData, examFee: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] disabled:opacity-70 disabled:bg-gray-50" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Lab Fee</label>
                <input disabled={isViewOnly} type="number" placeholder="0" value={formData.labFee} onChange={e => setFormData({ ...formData, labFee: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] disabled:opacity-70 disabled:bg-gray-50" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Installments</label>
                <input disabled={isViewOnly} type="number" placeholder="1" value={formData.installments} onChange={e => setFormData({ ...formData, installments: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] disabled:opacity-70 disabled:bg-gray-50" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Due Date</label>
                <input disabled={isViewOnly} type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] disabled:opacity-70 disabled:bg-gray-50" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">{isViewOnly ? 'Close' : 'Cancel'}</button>
                {!isViewOnly && (
                  <button type="submit" className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold">Save</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeStructure;


