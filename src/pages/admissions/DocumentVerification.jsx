import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import axios from 'axios';
import SkeletonLoader from '../../components/SkeletonLoader';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const docStatusColors = {
  'Verified': 'bg-green-100 text-green-700',
  'Pending': 'bg-orange-100 text-orange-700',
  'Rejected': 'bg-red-100 text-red-700',
  'Correction Required': 'bg-yellow-100 text-yellow-700',
  'Not Uploaded': 'bg-gray-100 text-gray-500',
  'Not Applicable': 'bg-blue-100 text-blue-700',
};

const DocumentVerification = () => {
  if (!checkPermission('View Admissions') && !checkPermission('Approve Admission')) {
    return <AccessDenied />;
  }
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
      // Only show those who have documents to verify
      const data = (res.data.admissions || res.data).filter(a => a.documents && a.documents.length > 0);
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

  const handleDocStatus = async (admissionId, docId, newStatus) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admissions/${admissionId}/documents/${docId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Optimistically update the state to prevent full refresh
      setAdmissions(prev => prev.map(a => {
        if (a._id === admissionId) {
          return {
            ...a,
            documents: a.documents.map(d => 
              d._id === docId ? { ...d, status: newStatus } : d
            )
          };
        }
        return a;
      }));
    } catch (error) {
      console.error('Error updating document status', error);
      alert('Failed to update document status');
    }
  };

  const filtered = admissions.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) || a.appNo?.includes(search)
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[18px] font-bold text-gray-800">Document Verification</h2>
        <p className="text-[12px] text-gray-500 mt-0.5">Verify student documents for admission</p>
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
          <SkeletonLoader type="detail" rows={4} cols={3} />
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <AlertCircle size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-[13px]">No applications with documents found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map(student => {
              const verified = student.documents.filter(d => d.status === 'Verified').length;
              const total = student.documents.length;
              return (
                <div key={student._id} className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-[14px] font-bold text-gray-800">{student.name}</h4>
                      <p className="text-[12px] text-gray-500">{student.appNo} • {student.course}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-semibold text-gray-700">{verified}/{total} Verified</p>
                      <div className="w-32 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div className="bg-[#0A6C54] h-1.5 rounded-full" style={{ width: `${total > 0 ? (verified/total)*100 : 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {student.documents.map(doc => (
                      <div key={doc._id} className="border border-gray-100 rounded-lg p-3">
                        <p className="text-[12px] font-medium text-gray-700 mb-2">{doc.name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${docStatusColors[doc.status] || 'bg-gray-100 text-gray-500'}`}>
                          {doc.status}
                        </span>
                        {doc.status !== 'Not Uploaded' && doc.status !== 'Not Applicable' && (
                          <div className="flex gap-1 mt-3">
                            {doc.url && (
                              <a
                                href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${doc.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors" title="View Document"
                              >
                                <Eye size={14} className="text-blue-600" />
                              </a>
                            )}
                            <button
                              onClick={() => handleDocStatus(student._id, doc._id, 'Verified')}
                              disabled={doc.status === 'Verified'}
                              className={`p-1.5 rounded-md transition-colors ${doc.status === 'Verified' ? 'bg-gray-100 cursor-not-allowed' : 'bg-green-50 hover:bg-green-100'}`} title="Verify"
                            >
                              <CheckCircle size={14} className={doc.status === 'Verified' ? 'text-gray-400' : 'text-green-600'} />
                            </button>
                            <button
                              onClick={() => handleDocStatus(student._id, doc._id, 'Rejected')}
                              disabled={doc.status === 'Rejected'}
                              className={`p-1.5 rounded-md transition-colors ${doc.status === 'Rejected' ? 'bg-gray-100 cursor-not-allowed' : 'bg-red-50 hover:bg-red-100'}`} title="Reject"
                            >
                              <XCircle size={14} className={doc.status === 'Rejected' ? 'text-gray-400' : 'text-red-600'} />
                            </button>
                            <button
                              onClick={() => handleDocStatus(student._id, doc._id, 'Correction Required')}
                              disabled={doc.status === 'Correction Required'}
                              className={`p-1.5 rounded-md transition-colors ${doc.status === 'Correction Required' ? 'bg-gray-100 cursor-not-allowed' : 'bg-yellow-50 hover:bg-yellow-100'}`} title="Request Correction"
                            >
                              <AlertCircle size={14} className={doc.status === 'Correction Required' ? 'text-gray-400' : 'text-yellow-600'} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentVerification;
