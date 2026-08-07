import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import SkeletonLoader from '../../components/SkeletonLoader';

const SelectionsOffers = () => {
  const [search, setSearch] = useState('');
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/placement/applications');
      // Only show applications with status 'Selected' (Pending Review in UI) or 'Accepted'
      const filteredOffers = res.data.filter(a => a.status === 'Selected' || a.status === 'Accepted');
      setOffers(filteredOffers);
    } catch (error) {
      toast.error('Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const filtered = offers.filter(o => {
    return o.studentId?.name?.toLowerCase().includes(search.toLowerCase()) || 
           o.jobId?.companyId?.name?.toLowerCase().includes(search.toLowerCase());
  });

  const handleVerifyOffer = async (id) => {
    try {
      await axiosInstance.put(`/placement/applications/${id}/status`, { status: 'Accepted' });
      toast.success('Offer letter verification logged and student notification sent.');
      fetchOffers();
    } catch (error) {
      toast.error('Failed to verify offer');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Corporate Offers & Selections</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify joining dates, upload offer letters, and track acceptance status</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export Offer Roster
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by candidate name or recruiting firm..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <SkeletonLoader type="table" rows={4} cols={8} />
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-[13px]">No offers found.</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Enrollment No</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Candidate Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Recruiter</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Designated Role</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">CTC Package</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Date Update</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.studentId?.rollNo || '-'}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.studentId?.name || '-'}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.jobId?.companyId?.name || '-'}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.jobId?.title || '-'}</td>
                  <td className="py-4 px-6 text-[13px] text-right font-bold text-gray-900">{item.jobId?.salaryPkg || '-'}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{new Date(item.updatedAt).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-[13px]">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      item.status === 'Accepted' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                    }`}>
                      {item.status === 'Selected' ? 'Pending Review' : item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="View Offer Letter"><FileText size={15} /></button>
                    {item.status === 'Selected' && (
                      <button onClick={() => handleVerifyOffer(item._id)} className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors" title="Verify Offer"><CheckCircle size={15} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SelectionsOffers;
