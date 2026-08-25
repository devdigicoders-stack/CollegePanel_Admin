import { useState, useEffect } from 'react';
import { Search, Eye, Trash2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import StudentDetailsModal from '../../components/StudentDetailsModal';

const RejectedApplications = () => {
  if (!checkPermission('View Admissions')) {
    return <AccessDenied />;
  }
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/admissions/${appToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Application deleted successfully');
      setShowDeleteModal(false);
      setAppToDelete(null);
      fetchApplications();
    } catch (error) {
      console.error('Error deleting application', error);
      toast.error('Failed to delete application');
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admissions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 1000 }
      });
      // Filter strictly for rejected ones
      const rejectedApps = (res.data.admissions || res.data).filter(a => a.status === 'Rejected' || a.stage === 'Cancelled');
      setApplications(rejectedApps);
    } catch (error) {
      console.error('Error fetching applications', error);
      toast.error('Failed to load rejected applications');
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

  return (
    <div className="space-y-6 font-['Inter']">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Rejected Students</h1>
          <p className="text-[13px] text-gray-500 font-medium mt-1">List of all applications that were rejected during verification.</p>
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
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-100 text-red-700">
                        Rejected
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedApp(app); setShowViewModal(true); }}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => { setAppToDelete(app); setShowDeleteModal(true); }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                          title="Delete Application"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500 text-[13px]">
                      No rejected applications found.
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
        type="rejected"
        actions={
          <button 
            onClick={() => setShowViewModal(false)}
            className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        }
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-red-50">
              <AlertTriangle size={24} className="text-red-600" />
              <h3 className="text-lg font-bold text-gray-800">Delete Application</h3>
            </div>
            
            <div className="px-6 py-6">
              <p className="text-gray-600 text-[14px]">
                Are you sure you want to permanently delete the rejected application for 
                <span className="font-bold text-gray-800"> {appToDelete?.name}</span>? 
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl hover:bg-red-600 transition-colors font-semibold text-[13px] shadow-sm shadow-red-500/20"
              >
                Delete Permanently
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); setAppToDelete(null); }}
                className="flex-1 border border-gray-200 text-gray-600 bg-white py-2.5 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-[13px]"
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

export default RejectedApplications;
