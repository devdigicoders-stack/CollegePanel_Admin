import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronDown, Eye, Check, X as XIcon, Plus,
  ChevronLeft, ChevronRight, FileText, Download, Upload
} from 'lucide-react';
import toast from 'react-hot-toast';

const LessonPlans = () => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [lessonPlans, setLessonPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  
  // Filters
  const [filters, setFilters] = useState({
    department: 'All Departments',
    subject: 'All Subjects',
    search: ''
  });

  const tabs = [
    { name: 'Pending', count: 8 },
    { name: 'Submitted', count: 45 },
    { name: 'Approved', count: 38 },
    { name: 'All', count: 91 }
  ];

  // Static data
  const staticPlans = [
    {
      _id: '1',
      planId: 'LP2024001',
      teacherName: 'Dr. Rajesh Kumar',
      department: 'Computer Science',
      subject: 'Data Structures',
      semester: '3rd',
      section: 'A',
      week: '5',
      month: 'February',
      topic: 'Binary Search Trees',
      status: 'Pending',
      submittedDate: null,
      approvedDate: null
    },
    {
      _id: '2',
      planId: 'LP2024002',
      teacherName: 'Prof. Meena Sharma',
      department: 'Electronics',
      subject: 'Digital Electronics',
      semester: '2nd',
      section: 'B',
      week: '6',
      month: 'February',
      topic: 'Logic Gates and Boolean Algebra',
      status: 'Submitted',
      submittedDate: '2024-02-10',
      approvedDate: null
    },
    {
      _id: '3',
      planId: 'LP2024003',
      teacherName: 'Mr. Anil Verma',
      department: 'Mechanical',
      subject: 'Thermodynamics',
      semester: '4th',
      section: 'A',
      week: '4',
      month: 'February',
      topic: 'Second Law of Thermodynamics',
      status: 'Approved',
      submittedDate: '2024-02-05',
      approvedDate: '2024-02-06'
    }
  ];

  useEffect(() => {
    fetchLessonPlans();
  }, [activeTab, filters]);

  const fetchLessonPlans = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    let filtered = staticPlans;
    if (activeTab !== 'All') {
      filtered = staticPlans.filter(plan => plan.status === activeTab);
    }
    setLessonPlans(filtered);
    setPagination(prev => ({ ...prev, total: filtered.length, pages: Math.ceil(filtered.length / prev.limit) }));
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async (plan) => {
    setSelectedPlan(plan);
    setShowApproveModal(true);
  };

  const handleApproveConfirm = async () => {
    try {
      // TODO: API call
      toast.success('Lesson plan approved successfully');
      setShowApproveModal(false);
      fetchLessonPlans();
    } catch (error) {
      toast.error('Failed to approve lesson plan');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-4 pb-2">
        <h2 className="text-lg font-bold text-gray-800">Lesson Plans</h2>
        <button className="flex items-center gap-2 bg-[#0A6C54] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#085a46] transition-colors">
          <Plus size={16} />
          Add Lesson Plan
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-6 pt-2 border-b border-gray-100 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`whitespace-nowrap px-4 py-4 text-[14px] font-semibold transition-all relative flex items-center gap-2 ${
              activeTab === tab.name ? 'text-[#0A6C54]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.name}
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === tab.name ? 'bg-[#0A6C54] text-white' : 'bg-gray-100 text-gray-600'
            }`}>{tab.count}</span>
            {activeTab === tab.name && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="p-5 flex gap-4 items-center bg-white">
        <div className="relative">
          <select 
            value={filters.department}
            onChange={(e) => setFilters({...filters, department: e.target.value})}
            className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer"
          >
            <option>All Departments</option>
            <option>Computer Science</option>
            <option>Electronics</option>
            <option>Mechanical</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by teacher or subject" 
            className="w-[280px] bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-[#F9FAFB] border-y border-gray-100">
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800">Plan ID</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800">Teacher</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800">Subject</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800">Semester</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800">Week</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800">Topic</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800">Status</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" className="py-8 text-center text-gray-500">Loading...</td></tr>
            ) : lessonPlans.length === 0 ? (
              <tr><td colSpan="9" className="py-8 text-center text-gray-500">No lesson plans found</td></tr>
            ) : (
              lessonPlans.map((plan) => (
                <tr key={plan._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{plan.planId}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-[13px] text-gray-800 font-medium">{plan.teacherName}</span>
                      <span className="text-[11px] text-gray-500">{plan.department}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{plan.subject}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{plan.semester} - Sec {plan.section}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">Week {plan.week}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{plan.topic}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${getStatusColor(plan.status)}`}>
                      {plan.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => { setSelectedPlan(plan); setShowViewModal(true); }}
                        className="w-8 h-8 rounded-full border border-green-100 flex items-center justify-center text-[#0A6C54] hover:bg-green-50 transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      {plan.status === 'Submitted' && (
                        <button 
                          onClick={() => handleApprove(plan)}
                          className="w-8 h-8 rounded-full border border-green-100 flex items-center justify-center text-green-600 hover:bg-green-50"
                          title="Approve"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-gray-100 gap-4">
        <div className="text-[13px] text-gray-500 font-medium">
          Showing {lessonPlans.length} of {pagination.total} entries | Page {pagination.page} of {pagination.pages}
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0A6C54] text-white text-[13px] font-medium">
            {pagination.page}
          </button>
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
            disabled={pagination.page === pagination.pages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* VIEW MODAL */}
      {showViewModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Lesson Plan Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Plan ID" value={selectedPlan.planId} />
                <DetailRow label="Status" value={<span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(selectedPlan.status)}`}>{selectedPlan.status}</span>} />
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Teacher Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Teacher Name" value={selectedPlan.teacherName} />
                  <DetailRow label="Department" value={selectedPlan.department} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Class Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Subject" value={selectedPlan.subject} />
                  <DetailRow label="Semester" value={`${selectedPlan.semester} Semester`} />
                  <DetailRow label="Section" value={`Section ${selectedPlan.section}`} />
                  <DetailRow label="Week & Month" value={`Week ${selectedPlan.week}, ${selectedPlan.month}`} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Topic</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedPlan.topic}</p>
              </div>

              {selectedPlan.submittedDate && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Submission Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailRow label="Submitted Date" value={formatDate(selectedPlan.submittedDate)} />
                    {selectedPlan.approvedDate && <DetailRow label="Approved Date" value={formatDate(selectedPlan.approvedDate)} />}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              {selectedPlan.status === 'Submitted' && (
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    handleApprove(selectedPlan);
                  }}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                >
                  Approve
                </button>
              )}
              <button 
                onClick={() => setShowViewModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE MODAL */}
      {showApproveModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check size={24} className="text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Approve Lesson Plan</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to approve lesson plan by <strong>{selectedPlan.teacherName}</strong> for <strong>{selectedPlan.subject}</strong>?
            </p>

            <div className="flex gap-3">
              <button 
                onClick={handleApproveConfirm}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
              >
                Approve
              </button>
              <button 
                onClick={() => setShowApproveModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Component
const DetailRow = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs font-semibold text-gray-500 mb-1">{label}</span>
    <span className="text-sm text-gray-800 font-medium">{value}</span>
  </div>
);

export default LessonPlans;
