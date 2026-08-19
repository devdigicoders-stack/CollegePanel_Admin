import { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, AlertTriangle, X, User, FileText } from 'lucide-react';
import axios from 'axios';
import SkeletonLoader from '../../components/SkeletonLoader';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const AdmissionCancellation = () => {
  if (!checkPermission('Delete Admission')) {
    return <AccessDenied />;
  }
  const [admissions, setAdmissions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  // View Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [activeTab, setActiveTab] = useState('Active'); // 'Active' or 'Cancelled'

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Fetch all admissions so we can split them into active and cancelled
      const data = res.data.admissions || res.data;
      setAdmissions(data);
    } catch (error) {
      console.error('Error fetching admissions', error);
      toast.error('Failed to fetch admissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const handleView = (app) => {
    setSelectedApp(app);
    setShowViewModal(true);
  };

  const handleCancelRequest = (app) => {
    Swal.fire({
      title: 'Cancel Admission?',
      text: `Are you sure you want to cancel the admission for ${app.name}? This action requires administrative approval.`,
      icon: 'warning',
      input: 'textarea',
      inputLabel: 'Reason for cancellation',
      inputPlaceholder: 'Enter the reason here...',
      inputAttributes: {
        'aria-label': 'Reason for cancellation'
      },
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Cancel it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (!result.value) {
          Swal.fire('Error', 'Cancellation reason is required!', 'error');
          return;
        }
        
        try {
          const token = localStorage.getItem('admin_token');
          await axios.put(`${import.meta.env.VITE_API_URL}/admissions/${app._id}`,
            { stage: 'Cancelled', status: 'Pending', remarks: result.value },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          Swal.fire(
            'Cancelled!',
            'The admission has been successfully cancelled.',
            'success'
          );
          fetchAdmissions();
        } catch (error) {
          console.error('Error cancelling admission', error);
          Swal.fire('Error', 'Failed to cancel admission.', 'error');
        }
      }
    });
  };

  const activeAdmissions = admissions.filter(a => a.stage === 'Admitted' || a.stage === 'Application');
  const cancelledAdmissions = admissions.filter(a => a.stage === 'Cancelled');

  const displayData = activeTab === 'Active' ? activeAdmissions : cancelledAdmissions;

  const filtered = displayData.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) || a.appNo?.includes(search)
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Admission Cancellation</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Manage and view cancelled admission requests</p>
        </div>
        
        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setActiveTab('Active')}
            className={`px-4 py-2 text-[12px] font-bold rounded-md transition-all ${
              activeTab === 'Active' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Active Admissions
          </button>
          <button
            onClick={() => setActiveTab('Cancelled')}
            className={`px-4 py-2 text-[12px] font-bold rounded-md transition-all ${
              activeTab === 'Cancelled' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Cancelled History
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name or app no..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-gray-50/30">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-6"><SkeletonLoader type="table" rows={5} cols={8} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['App No.','Student Name','Course','Category', activeTab === 'Cancelled' ? 'Reason' : 'Session','Stage', activeTab === 'Cancelled' ? 'Cancelled On' : 'Applied On','Actions'].map((h, i) => (
                      <th key={i} className="py-3.5 px-4 text-[12px] font-bold text-gray-700 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? filtered.map(a => (
                    <tr key={a._id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 text-[13px] font-bold text-primary whitespace-nowrap">{a.appNo}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[12px]">
                            {a.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-gray-800">{a.name}</p>
                            <p className="text-[11px] font-medium text-gray-500">{a.mobile}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[13px] font-medium text-gray-700 whitespace-nowrap">{a.course}</td>
                      <td className="py-3 px-4 text-[13px] text-gray-600 whitespace-nowrap">{a.category || '-'}</td>
                      
                      {activeTab === 'Cancelled' ? (
                         <td className="py-3 px-4 text-[12px] text-red-600 font-medium max-w-[200px] truncate" title={a.remarks || 'No reason provided'}>
                           {a.remarks || 'No reason provided'}
                         </td>
                      ) : (
                         <td className="py-3 px-4 text-[12px] text-gray-600 whitespace-nowrap">{a.academicSession || '-'}</td>
                      )}
                      
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold ${
                          a.stage === 'Admitted' ? 'bg-green-100 text-green-700' : 
                          a.stage === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>{a.stage}</span>
                      </td>
                      <td className="py-3 px-4 text-[12px] text-gray-600 whitespace-nowrap">{new Date(a.updatedAt || a.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleView(a)}
                            className="p-1.5 border border-gray-200 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                            title="View Details"
                          >
                            <Eye size={15} />
                          </button>
                          {activeTab === 'Active' && (
                            <button
                              onClick={() => handleCancelRequest(a)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[12px] font-bold transition-colors"
                            >
                              <XCircle size={14} /> Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-500 text-[13px]">
                        <div className="flex flex-col items-center justify-center">
                          <AlertTriangle size={40} className="text-gray-300 mb-3" />
                          <p className="font-medium">
                            {activeTab === 'Active' ? 'No active admissions found for cancellation.' : 'No cancelled admissions found.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {showViewModal && selectedApp && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowViewModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-full overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {selectedApp.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-gray-800">{selectedApp.name}</h3>
                  <p className="text-[12px] font-medium text-gray-500">App No: {selectedApp.appNo}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Details */}
                <div>
                  <h4 className="text-[13px] font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <User size={14} className="text-primary" /> Personal Details
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[12px] text-gray-500 font-medium">Email:</span>
                      <span className="col-span-2 text-[13px] text-gray-800 font-medium">{selectedApp.email || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[12px] text-gray-500 font-medium">Mobile:</span>
                      <span className="col-span-2 text-[13px] text-gray-800 font-medium">{selectedApp.mobile || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[12px] text-gray-500 font-medium">Gender:</span>
                      <span className="col-span-2 text-[13px] text-gray-800 font-medium">{selectedApp.gender || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[12px] text-gray-500 font-medium">Category:</span>
                      <span className="col-span-2 text-[13px] text-gray-800 font-medium">{selectedApp.category || 'General'}</span>
                    </div>
                  </div>
                </div>

                {/* Academic Details */}
                <div>
                  <h4 className="text-[13px] font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <FileText size={14} className="text-primary" /> Academic Details
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[12px] text-gray-500 font-medium">Course:</span>
                      <span className="col-span-2 text-[13px] text-gray-800 font-medium">{selectedApp.course || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[12px] text-gray-500 font-medium">Department:</span>
                      <span className="col-span-2 text-[13px] text-gray-800 font-medium">{selectedApp.department || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[12px] text-gray-500 font-medium">Semester:</span>
                      <span className="col-span-2 text-[13px] text-gray-800 font-medium">{selectedApp.semester || '1st'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[12px] text-gray-500 font-medium">Session:</span>
                      <span className="col-span-2 text-[13px] text-gray-800 font-medium">{selectedApp.academicSession || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
               <button onClick={() => setShowViewModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                 Close
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdmissionCancellation;
