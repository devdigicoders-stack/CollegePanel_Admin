import React, { useState, useEffect } from 'react';
import { Search, Eye, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import StudentDetailsModal from '../../components/StudentDetailsModal';

const ApprovedApplications = () => {
  if (!checkPermission('View Admissions')) {
    return <AccessDenied />;
  }
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [filterBranch, setFilterBranch] = useState('All Branches');
  const [filterSession, setFilterSession] = useState('All Sessions');
  const [filterYear, setFilterYear] = useState('All Years');
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admissions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 1000 }
      });
      // Filter strictly for approved/registered ones
      const approvedApps = (res.data.admissions || res.data).filter(a => a.stage === 'Admitted' || a.status === 'Approved' || a.registrationStatus === 'Registered');
      setApplications(approvedApps);
    } catch (error) {
      console.error('Error fetching applications', error);
      toast.error('Failed to load approved applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const branches = ['All Branches', ...new Set(applications.map(a => a.branch).filter(Boolean))];
  const sessions = ['All Sessions', ...new Set(applications.map(a => a.session || a.academicSession).filter(Boolean))];
  const years = ['All Years', ...new Set(applications.map(a => a.year).filter(Boolean))];

  const filteredApps = applications.filter(a => {
    const matchSearch = a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.appNo?.includes(search) || a.mobile?.includes(search);
      
    const matchBranch = filterBranch === 'All Branches' || a.branch === filterBranch;
    const matchSession = filterSession === 'All Sessions' || (a.session || a.academicSession) === filterSession;
    const matchYear = filterYear === 'All Years' || a.year === filterYear;
    
    return matchSearch && matchBranch && matchSession && matchYear;
  });

  return (
    <div className="space-y-6 font-['Inter']">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Approved Students</h1>
          <p className="text-[13px] text-gray-500 font-medium mt-1">List of all students whose registrations have been approved.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Filters */}
          <select 
            value={filterBranch} 
            onChange={(e) => setFilterBranch(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select 
            value={filterSession} 
            onChange={(e) => setFilterSession(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {sessions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <div className="relative w-full sm:w-64">
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
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-700">
                        Approved
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
                      No approved students found.
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
        type="approved"
        actions={
          <button 
            onClick={() => setShowViewModal(false)}
            className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        }
      />

    </div>
  );
};

export default ApprovedApplications;
