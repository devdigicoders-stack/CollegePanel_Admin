import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Search, Download, Plus, Edit2, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import SkeletonLoader from '../../components/SkeletonLoader';

const Companies = () => {
  const [search, setSearch] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: 'IT/Software',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    website: ''
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/placement/companies');
      setCompanies(res.data);
    } catch (error) {
      toast.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filtered = companies.filter(c => {
    return c.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddCompany = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await axiosInstance.post('/placement/companies', newCompany);
      toast.success(`Recruitment firm ${newCompany.name} registered!`);
      setShowAddModal(false);
      setNewCompany({
        name: '', industry: 'IT/Software', contactPerson: '', contactEmail: '', contactPhone: '', website: ''
      });
      fetchCompanies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this company?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, proceed!'
    });
    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/placement/companies/${id}`);
        toast.success('Company deleted successfully');
        fetchCompanies();
      } catch (error) {
        toast.error('Error deleting company');
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Recruiting Corporations Directory</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify HR contact detail listings, previous recruitment drives, and compensation ranges</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Corporate Directory
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Register Company
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search corporate entities by name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={6} />
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-[13px]">No companies found.</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Company Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Sector</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">HR Contact Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">HR Email</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.industry || '-'}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.contactPerson || '-'}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500 font-mono">{item.contactEmail || '-'}</td>
                  <td className="py-4 px-6 text-[13px]">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-100`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[13px] flex gap-2">
                    <button className="p-1.5 bg-gray-50 rounded hover:bg-gray-100 text-gray-600"><Edit2 size={14}/></button>
                    <button onClick={() => handleDelete(item._id)} className="p-1.5 bg-red-50 rounded hover:bg-red-100 text-red-600"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Register Recruitment Company</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddCompany} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Company Name</label>
                <input 
                  type="text" 
                  required
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Industry Sector</label>
                  <select 
                    value={newCompany.industry} 
                    onChange={(e) => setNewCompany({...newCompany, industry: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="IT/Software">IT/Software</option>
                    <option value="Core Engineering">Core Engineering</option>
                    <option value="Finance">Finance</option>
                    <option value="Consulting">Consulting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">HR Contact Person</label>
                  <input 
                    type="text"
                    value={newCompany.contactPerson}
                    onChange={(e) => setNewCompany({...newCompany, contactPerson: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">HR Contact Email</label>
                  <input 
                    type="email"
                    value={newCompany.contactEmail}
                    onChange={(e) => setNewCompany({...newCompany, contactEmail: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Phone Number</label>
                  <input 
                    type="text"
                    value={newCompany.contactPhone}
                    onChange={(e) => setNewCompany({...newCompany, contactPhone: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] disabled:opacity-50 text-white rounded-lg text-[13px] font-semibold"
                >
                  {isSubmitting ? 'Saving...' : 'Save Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
