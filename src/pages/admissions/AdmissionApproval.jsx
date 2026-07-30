import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import axios from 'axios';
import SkeletonLoader from '../../components/SkeletonLoader';

const stageColors = {
  'Document Verification': 'bg-orange-100 text-orange-700',
  'Officer Recommendation': 'bg-blue-100 text-blue-700',
  'Head Approval': 'bg-purple-100 text-purple-700',
  'Fee Payment': 'bg-yellow-100 text-yellow-700',
  'Admitted': 'bg-green-100 text-green-700',
  'Application': 'bg-gray-100 text-gray-700',
};

const StepIcon = ({ done }) => done
  ? <CheckCircle size={16} className="text-green-600" />
  : <Clock size={16} className="text-gray-400" />;

const AdmissionApproval = () => {
  const [admissions, setAdmissions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

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
      fetchAdmissions();
    } catch (error) {
      console.error('Error updating admission', error);
    }
  };

  const filtered = admissions.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) || a.appNo?.includes(search)
  );

  const allDocVerified = (a) => a.documents?.every(d => d.status === 'Verified') ?? false;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[18px] font-bold text-gray-800">Admission Approval</h2>
        <p className="text-[12px] text-gray-500 mt-0.5">Track and manage admission approval workflow</p>
      </div>

      {/* Workflow Legend */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-[12px] font-semibold text-gray-600">Workflow:</span>
          {['Application Submitted','Document Verification','Officer Recommendation','Head Approval','Admission Confirmed'].map((step, idx, arr) => (
            <React.Fragment key={step}>
              <span className="text-[11px] bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium">{step}</span>
              {idx < arr.length - 1 && <span className="text-gray-400 text-[12px]">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name or app no..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={4} />
        ) : (
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-[13px]">No applications pending approval.</div>
            ) : filtered.map(app => (
              <div key={app._id} className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-800">{app.name}</h4>
                    <p className="text-[12px] text-gray-500">{app.appNo} • {app.course} • {app.category || 'General'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${stageColors[app.stage] || 'bg-gray-100 text-gray-700'}`}>{app.stage}</span>
                </div>

                {/* Workflow Steps */}
                <div className="flex flex-wrap gap-4 mb-4">
                  {[
                    { label: 'Application', done: true },
                    { label: 'Doc Verified', done: allDocVerified(app) },
                    { label: 'Approved', done: app.stage === 'Admitted' },
                  ].map(step => (
                    <div key={step.label} className="flex items-center gap-1.5">
                      <StepIcon done={step.done} />
                      <span className={`text-[12px] font-medium ${step.done ? 'text-green-700' : 'text-gray-500'}`}>{step.label}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50">
                    <Eye size={13} /> View
                  </button>
                  {app.stage !== 'Admitted' && (
                    <>
                      <button
                        onClick={() => updateStage(app._id, 'Admitted', 'Confirmed')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[12px] font-semibold"
                      >
                        <CheckCircle size={13} /> Approve & Admit
                      </button>
                      <button
                        onClick={() => updateStage(app._id, 'Cancelled', 'Pending')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[12px] font-semibold"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </>
                  )}
                  {app.stage === 'Admitted' && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-[12px] font-semibold">
                      <CheckCircle size={13} /> Admitted
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdmissionApproval;
