import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Clock, Eye, X, FileText, User } from 'lucide-react';
import axios from 'axios';
import SkeletonLoader from '../../components/SkeletonLoader';
import toast from 'react-hot-toast';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const stageColors = {
  'Document Verification': 'bg-orange-100 text-orange-700',
  'Officer Recommendation': 'bg-blue-100 text-blue-700',
  'Head Approval': 'bg-purple-100 text-purple-700',
  'Fee Payment': 'bg-yellow-100 text-yellow-700',
  'Admitted': 'bg-green-100 text-green-700',
  'Application': 'bg-gray-100 text-gray-700',
};

const AdmissionApproval = () => {
  if (!checkPermission('Approve Admission')) {
    return <AccessDenied />;
  }
  const [admissions, setAdmissions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  // View Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Fetch apps that are not yet Admitted or Cancelled
      const data = (res.data.admissions || res.data).filter(
        a => a.stage !== 'Admitted' && a.stage !== 'Cancelled' && a.stage !== 'Enquiry'
      );
      setAdmissions(data);
    } catch (error) {
      console.error('Error fetching admissions', error);
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const updateStage = async (id, stage, status) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(`${import.meta.env.VITE_API_URL}/admissions/${id}`,
        { stage, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Application ${stage === 'Admitted' ? 'Approved' : 'Rejected'} successfully!`);
      setShowViewModal(false);
      fetchAdmissions();
    } catch (error) {
      console.error('Error updating admission', error);
      toast.error('Failed to update status');
    }
  };

  const filtered = admissions.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) || a.appNo?.includes(search)
  );

  const allDocVerified = (a) => {
    if (!a.documents || a.documents.length === 0) return false;
    return a.documents.every(d => d.status === 'Verified' || d.status === 'Not Applicable');
  };

  const handleView = (app) => {
    setSelectedApp(app);
    setShowViewModal(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter'] relative">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[18px] font-bold text-gray-800">Admission Approval</h2>
        <p className="text-[12px] text-gray-500 mt-0.5">Track and manage admission approval workflow</p>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-[12px] font-semibold text-gray-600">Workflow:</span>
          {['Application Submitted','Document Verification','Approval','Admitted'].map((step, idx, arr) => (
            <React.Fragment key={step}>
              <span className="text-[11px] bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium">{step}</span>
              {idx < arr.length - 1 && <span className="text-gray-400 text-[12px]">→</span>}
            </React.Fragment>
          ))}
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name or app no..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={6} />
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <CheckCircle size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-[13px]">No applications pending approval.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-3 px-5 text-[12px] font-bold text-gray-700">App No.</th>
                    <th className="py-3 px-5 text-[12px] font-bold text-gray-700">Applicant Name</th>
                    <th className="py-3 px-5 text-[12px] font-bold text-gray-700">Course & Category</th>
                    <th className="py-3 px-5 text-[12px] font-bold text-gray-700">Current Stage</th>
                    <th className="py-3 px-5 text-[12px] font-bold text-gray-700">Docs Verified</th>
                    <th className="py-3 px-5 text-[12px] font-bold text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(app => {
                    const docsOk = allDocVerified(app);
                    return (
                      <tr key={app._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-5 text-[13px] font-semibold text-gray-800">{app.appNo}</td>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-[12px]">
                              {app.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[13px] font-medium text-gray-800">{app.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <p className="text-[13px] font-medium text-gray-800">{app.course}</p>
                          <p className="text-[11px] text-gray-500">{app.category || 'General'}</p>
                        </td>
                        <td className="py-3 px-5">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${stageColors[app.stage] || 'bg-gray-100 text-gray-700'}`}>
                            {app.stage}
                          </span>
                        </td>
                        <td className="py-3 px-5">
                          {docsOk ? (
                            <span className="flex items-center gap-1.5 text-[12px] font-medium text-green-600">
                              <CheckCircle size={14} /> Yes
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[12px] font-medium text-orange-600">
                              <Clock size={14} /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleView(app)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors" title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            {app.stage !== 'Admitted' && (
                              <>
                                <button
                                  onClick={() => updateStage(app._id, 'Admitted', 'Confirmed')}
                                  disabled={!docsOk}
                                  className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Approve & Admit"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => updateStage(app._id, 'Cancelled', 'Pending')}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors" title="Reject"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
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

              {/* Documents Status */}
              <div className="mt-8">
                 <h4 className="text-[13px] font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <CheckCircle size={14} className="text-primary" /> Uploaded Documents
                  </h4>
                  {selectedApp.documents && selectedApp.documents.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedApp.documents.map(doc => (
                        <div key={doc._id} className="border border-gray-100 bg-gray-50 rounded-lg p-3">
                           <p className="text-[11px] font-semibold text-gray-700 truncate" title={doc.name}>{doc.name}</p>
                           <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold
                             ${doc.status === 'Verified' ? 'bg-green-100 text-green-700' 
                               : doc.status === 'Rejected' ? 'bg-red-100 text-red-700'
                               : 'bg-orange-100 text-orange-700'}`}>
                             {doc.status}
                           </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-gray-500 italic">No documents uploaded.</p>
                  )}
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
               <button onClick={() => setShowViewModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                 Close
               </button>
               {selectedApp.stage !== 'Admitted' && (
                 <>
                  <button 
                    onClick={() => updateStage(selectedApp._id, 'Cancelled', 'Pending')}
                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[13px] font-semibold transition-colors">
                    Reject Application
                  </button>
                  <button 
                    disabled={!allDocVerified(selectedApp)}
                    onClick={() => updateStage(selectedApp._id, 'Admitted', 'Confirmed')}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!allDocVerified(selectedApp) ? 'All documents must be verified first' : 'Approve Application'}>
                    Approve & Admit
                  </button>
                 </>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionApproval;
