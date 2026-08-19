import React, { useState, useEffect } from 'react';
import { Search, Eye, Check, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import StudentDetailsModal from '../../components/StudentDetailsModal';
import Swal from 'sweetalert2';

const Applications = () => {
  if (!checkPermission('View Admissions')) {
    return <AccessDenied />;
  }
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admissions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 1000 } 
      });
      // Filter strictly for pending ones
      const pendingApps = (res.data.admissions || res.data).filter(a => a.stage === 'Application' || a.status === 'Pending' || a.status === 'New');
      setApplications(pendingApps);
    } catch (error) {
      console.error('Error fetching applications', error);
      toast.error('Failed to load pending applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApps = applications.filter(a => {
    return a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.appNo?.includes(search) || a.mobile?.includes(search);
  });

  const handleApprove = async (appId) => {
    const result = await Swal.fire({
      title: 'Approve Application?',
      text: 'Are you sure you want to approve this application? This will register the student.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-primary)',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Approve'
    });
    if (!result.isConfirmed) return;
    try {
      setActionLoading(true);
      const token = localStorage.getItem('admin_token');
      
      // Step 1: Update stage to Admitted
      await axios.put(`${import.meta.env.VITE_API_URL}/admissions/${appId}`, {
        stage: 'Admitted',
        status: 'Approved'
      }, { headers: { Authorization: `Bearer ${token}` } });

      // Step 2: Register student
      await axios.put(`${import.meta.env.VITE_API_URL}/admissions/${appId}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Application approved and student registered successfully!');
      setShowViewModal(false);
      fetchApplications(); // Refresh list to remove approved one
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to approve application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (appId) => {
    const result = await Swal.fire({
      title: 'Reject Application?',
      text: 'Are you sure you want to reject this application?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Reject'
    });
    if (!result.isConfirmed) return;
    try {
      setActionLoading(true);
      const token = localStorage.getItem('admin_token');
      
      await axios.put(`${import.meta.env.VITE_API_URL}/admissions/${appId}`, {
        stage: 'Cancelled',
        status: 'Rejected'
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success('Application rejected');
      setShowViewModal(false);
      fetchApplications(); // Refresh list to remove rejected one
    } catch (error) {
      console.error(error);
      toast.error('Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-['Inter']">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Pending Applications</h1>
          <p className="text-[13px] text-gray-500 font-medium mt-1">Review new student registrations waiting for approval.</p>
        </div>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search name, phone, App No..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6"><SkeletonLoader type="table" rows={5} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Application</th>
                  <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Student Info</th>
                  <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Course Details</th>
                  <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApps.length > 0 ? filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="text-[13px] font-black text-primary">{app.appNo}</p>
                      <p className="text-[11px] text-gray-400 font-medium">{new Date(app.createdAt).toLocaleDateString('en-IN')}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-[12px]">
                          {app.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-gray-800">{app.name}</p>
                          <p className="text-[11px] text-gray-500 font-medium">{app.mobile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-[13px] font-bold text-gray-800">{app.course}</p>
                      <p className="text-[11px] text-gray-500 font-medium">{app.admissionType || 'Regular'}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-700">
                        Pending Review
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => { setSelectedApp(app); setShowViewModal(true); }}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500 text-[13px]">
                      No pending applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      <StudentDetailsModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        student={selectedApp}
        type="pending"
        actions={
          <>
            <button 
              onClick={() => setShowViewModal(false)}
              className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              disabled={actionLoading}
            >
              Close
            </button>
            <button 
              onClick={() => handleReject(selectedApp._id)}
              className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors flex items-center gap-2"
              disabled={actionLoading}
            >
              <X size={16} /> Reject
            </button>
            <button 
              onClick={() => handleApprove(selectedApp._id)}
              className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : (
                <><Check size={16} strokeWidth={3} /> Approve & Register</>
              )}
            </button>
          </>
        }
      />

    </div>
  );
};

export default Applications;
