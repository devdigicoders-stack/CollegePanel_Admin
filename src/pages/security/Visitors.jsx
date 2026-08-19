import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, Camera, Barcode, CheckCircle, LogOut, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import SkeletonLoader from '../../components/SkeletonLoader';

const Visitors = () => {
  if (!checkPermission('View Security Dashboard')) {
    return <AccessDenied />;
  }
  const [search, setSearch] = useState('');
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newVisitor, setNewVisitor] = useState({
    name: '',
    mobile: '',
    idProof: 'Aadhaar Card',
    meetPerson: '',
    purpose: '',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/security/logs?logType=Visitor');
      setVisitors(res.data);
    } catch (error) {
      toast.error('Failed to load visitors');
    } finally {
      setLoading(false);
    }
  };

  const filtered = visitors.filter(v => {
    const s = search.toLowerCase();
    return (v.visitorName?.toLowerCase() || '').includes(s) || 
           (v.purpose?.toLowerCase() || '').includes(s) ||
           (v.contactNumber?.toLowerCase() || '').includes(s);
  });

  const handleAddVisitor = async (e) => {
    e.preventDefault();
    if (!newVisitor.name.trim() || !newVisitor.mobile.trim()) {
      return toast.error('Name and Mobile are required');
    }
    
    try {
      setSubmitting(true);
      
      let photoUrl = '';
      if (photo) {
        const formData = new FormData();
        formData.append('file', photo);
        const uploadRes = await axiosInstance.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        photoUrl = uploadRes.data.url;
      }

      await axiosInstance.post('/security/logs', {
        logType: 'Visitor',
        visitorName: newVisitor.name,
        contactNumber: newVisitor.mobile,
        remarks: newVisitor.idProof, // store idProof in remarks
        purpose: newVisitor.meetPerson, // meet person mapped to purpose
        photoUrl: photoUrl
      });
      setShowAddModal(false);
      toast.success(`Visitor Pass generated for ${newVisitor.name}!`);
      setNewVisitor({ name: '', mobile: '', idProof: 'Aadhaar Card', meetPerson: '', purpose: '' });
      setPhoto(null);
      setPhotoPreview(null);
      fetchVisitors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register visitor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async (id, visitorName) => {
    const result = await Swal.fire({
      title: 'Checkout Visitor?',
      text: `Confirm exit for ${visitorName} from the campus.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-primary)',
      cancelButtonColor: '#e5e7eb',
      confirmButtonText: 'Yes, Checkout',
      cancelButtonText: '<span style="color: black">Cancel</span>'
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.put(`/security/logs/${id}`);
        toast.success(`${visitorName} has checked out successfully.`);
        fetchVisitors();
      } catch (error) {
        toast.error('Failed to checkout visitor');
      }
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) return toast.error('No visitors to export');
    
    const exportData = filtered.map(item => ({
      'Visitor Name': item.visitorName,
      'Contact Number': item.contactNumber,
      'ID Proof Provided': item.remarks || 'None',
      'Staff/Person to Meet': item.purpose || 'N/A',
      'Entry Time': new Date(item.entryTime).toLocaleString('en-IN'),
      'Exit Time': item.exitTime ? new Date(item.exitTime).toLocaleString('en-IN') : 'Inside Campus',
      'Status': item.exitTime ? 'Checked Out' : 'Active'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Visitor Logs');
    XLSX.writeFile(wb, `Campus_Visitors_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const userRole = adminInfo.role || 'college_admin';
  const canEdit = userRole === 'college_admin' || userRole === 'Security Guard' || userRole === 'Principal';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Campus Visitor Registration</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Record visitor details, print security badges, and manage exit checkouts</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Registry
          </button>
          {canEdit && (
            <button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
              <Plus size={16} /> Register Visitor
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by visitor name, mobile or purpose..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="text-[12px] font-semibold text-gray-500 bg-white px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm">
          Total Visitors Found: <span className="text-primary">{filtered.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={5} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Visitor Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Contact / ID Proof</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Staff to Meet</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Entry Timestamp</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Exit Timestamp</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold flex items-center gap-3">
                    {item.photoUrl ? (
                      <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${item.photoUrl}`} alt={item.visitorName} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[11px] border border-blue-100">
                        {item.visitorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {item.visitorName || 'Unknown'}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-[13px] text-gray-700 font-semibold">{item.contactNumber || 'N/A'}</div>
                    <div className="text-[11px] text-gray-500 font-medium">{item.remarks || 'No ID Logged'}</div>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.purpose || 'General Inquiry'}</td>
                  <td className="py-4 px-6 text-center">
                    <div className="text-[13px] text-gray-800 font-bold">{new Date(item.entryTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                    <div className="text-[11px] text-gray-500 font-medium">{new Date(item.entryTime).toLocaleDateString('en-IN')}</div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {item.exitTime ? (
                      <>
                        <div className="text-[13px] text-gray-800 font-bold">{new Date(item.exitTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                        <div className="text-[11px] text-gray-500 font-medium">{new Date(item.exitTime).toLocaleDateString('en-IN')}</div>
                      </>
                    ) : (
                      <span className="text-[12px] text-gray-400 italic">-- : --</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${
                      item.exitTime ? 'bg-gray-100 text-gray-600' : 'bg-green-50 text-green-700 border border-green-100'
                    }`}>
                      {item.exitTime ? <CheckCircle size={13} /> : <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>}
                      {item.exitTime ? 'Checked Out' : 'Inside Campus'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {canEdit && !item.exitTime ? (
                      <button 
                        onClick={() => handleCheckout(item._id, item.visitorName)} 
                        className="px-3 py-1.5 text-[12px] font-bold bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center gap-1.5 mx-auto"
                      >
                        <LogOut size={14} /> Checkout
                      </button>
                    ) : (
                      <span className="text-[12px] text-gray-400 italic font-medium px-3 py-1.5">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Users size={40} className="mb-4 text-gray-200" />
                      <p className="text-[14px] font-medium text-gray-500">No Visitor Logs Found</p>
                      <p className="text-[12px] mt-1">Try adjusting your search criteria or register a new visitor.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Visitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Register New Visitor</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddVisitor} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Visitor Full Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newVisitor.name}
                    onChange={(e) => setNewVisitor({...newVisitor, name: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Mobile No *</label>
                  <input 
                    type="text" 
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={newVisitor.mobile}
                    onChange={(e) => setNewVisitor({...newVisitor, mobile: e.target.value.replace(/\D/g, '')})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">ID Proof Document</label>
                  <select 
                    value={newVisitor.idProof} 
                    onChange={(e) => setNewVisitor({...newVisitor, idProof: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Driving License">Driving License</option>
                    <option value="PAN Card">PAN Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Staff / Department to Meet</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Admission Cell, Mr. Sharma"
                    value={newVisitor.meetPerson}
                    onChange={(e) => setNewVisitor({...newVisitor, meetPerson: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div 
                className="flex flex-col gap-2 p-3 border border-dashed border-gray-300 rounded-lg justify-center items-center text-[13px] font-medium text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors relative"
                onClick={() => document.getElementById('visitorPhoto').click()}
              >
                <input 
                  type="file" 
                  id="visitorPhoto"
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setPhoto(file);
                      setPhotoPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                {photoPreview ? (
                  <div className="relative">
                    <img src={photoPreview} alt="Preview" className="h-20 rounded-lg object-cover shadow-sm" />
                    <div 
                      className="absolute -top-2 -right-2 bg-red-100 text-red-600 w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-200 transition-colors"
                      onClick={(e) => { e.stopPropagation(); setPhoto(null); setPhotoPreview(null); }}
                    >
                      &times;
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera size={18} className="text-gray-400" /> 
                    <span>Capture Visitor Photo (Optional)</span>
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Barcode size={16} /> {submitting ? 'Registering...' : 'Register & Print Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visitors;
