import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, Car, CheckCircle, LogOut, CarFront } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import SkeletonLoader from '../../components/SkeletonLoader';

const Vehicles = () => {
  if (!checkPermission('Log Vehicle Registry')) {
    return <AccessDenied />;
  }
  const [search, setSearch] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    plateNo: '',
    ownerName: '',
    type: 'Staff 4-Wheeler',
    parkingZone: 'Staff Parking Area B',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/security/vehicles');
      setVehicles(res.data);
    } catch (error) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const filtered = vehicles.filter(v => {
    const s = search.toLowerCase();
    return (v.plateNo?.toLowerCase() || '').includes(s) || 
           (v.ownerName?.toLowerCase() || '').includes(s);
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!newVehicle.plateNo.trim() || !newVehicle.ownerName.trim()) {
      return toast.error('License Plate and Owner Name are required');
    }

    try {
      setSubmitting(true);
      await axiosInstance.post('/security/vehicles', {
        plateNo: newVehicle.plateNo.toUpperCase(),
        ownerName: newVehicle.ownerName,
        vehicleType: newVehicle.type,
        parkingZone: newVehicle.parkingZone
      });
      setShowAddModal(false);
      toast.success(`Vehicle entry recorded for ${newVehicle.plateNo.toUpperCase()}`);
      setNewVehicle({ plateNo: '', ownerName: '', type: 'Staff 4-Wheeler', parkingZone: 'Staff Parking Area B' });
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async (id, plateNo) => {
    const result = await Swal.fire({
      title: 'Checkout Vehicle?',
      text: `Confirm exit for vehicle ${plateNo} from the campus.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0A6C54',
      cancelButtonColor: '#e5e7eb',
      confirmButtonText: 'Yes, Checkout',
      cancelButtonText: '<span style="color: black">Cancel</span>'
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.put(`/security/vehicles/${id}/checkout`);
        toast.success(`Vehicle ${plateNo} has checked out successfully.`);
        fetchVehicles();
      } catch (error) {
        toast.error('Failed to checkout vehicle');
      }
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) return toast.error('No logs to export');
    
    const exportData = filtered.map(item => ({
      'License Plate No': item.plateNo,
      'Owner Name': item.ownerName,
      'Vehicle Category': item.vehicleType,
      'Parking Zone': item.parkingZone,
      'Check-In Date': new Date(item.checkInTime).toLocaleDateString('en-IN'),
      'Check-In Time': new Date(item.checkInTime).toLocaleTimeString('en-IN'),
      'Check-Out Date': item.checkOutTime ? new Date(item.checkOutTime).toLocaleDateString('en-IN') : 'N/A',
      'Check-Out Time': item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString('en-IN') : 'Inside Campus',
      'Status': item.checkOutTime ? 'Checked Out' : 'Active'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicle Logs');
    XLSX.writeFile(wb, `Campus_Vehicle_Logs_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Campus Vehicle Registry</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Record staff/student vehicle entries, assign designated parking zones, and track logouts</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Vehicle Logs
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors shadow-sm">
            <Plus size={16} /> Log Vehicle Entry
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by license plate or owner identity..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
        <div className="text-[12px] font-semibold text-gray-500 bg-white px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm">
          Total Vehicles Logged: <span className="text-[#0A6C54]">{filtered.length}</span>
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
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">License Plate No</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Owner Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Vehicle Category</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Assigned Parking Zone</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Entry/Exit Timestamp</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-bold font-mono text-[#0A6C54] tracking-wide">
                    <div className="inline-flex items-center gap-2 bg-green-50/50 border border-green-200 px-3 py-1 rounded-md">
                      {item.plateNo}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.ownerName || 'Unknown'}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{item.vehicleType}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{item.parkingZone}</td>
                  <td className="py-4 px-6 text-center">
                    <div className="text-[13px] text-gray-800 font-bold">{new Date(item.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                    <div className="text-[11px] text-gray-500 font-medium">
                      Out: {item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-- : --'}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${
                      item.checkOutTime ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                      {item.checkOutTime ? <CheckCircle size={13} /> : <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>}
                      {item.checkOutTime ? 'Checked Out' : 'Inside Campus'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {!item.checkOutTime ? (
                      <button 
                        onClick={() => handleCheckout(item._id, item.plateNo)} 
                        className="px-3 py-1.5 text-[12px] font-bold bg-[#0A6C54]/10 text-[#0A6C54] rounded-lg hover:bg-[#0A6C54] hover:text-white transition-colors flex items-center gap-1.5 mx-auto"
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
                      <CarFront size={40} className="mb-4 text-gray-200" />
                      <p className="text-[14px] font-medium text-gray-500">No Vehicle Logs Found</p>
                      <p className="text-[12px] mt-1">Try adjusting your search criteria or register a new vehicle entry.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Record Vehicle Entry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleRegister} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">License Plate No *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. DL-3C-AS-9921"
                  value={newVehicle.plateNo}
                  onChange={(e) => setNewVehicle({...newVehicle, plateNo: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] font-mono tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Owner Identity / Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Dr. Rakesh Sharma"
                  value={newVehicle.ownerName}
                  onChange={(e) => setNewVehicle({...newVehicle, ownerName: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Vehicle Category</label>
                  <select 
                    value={newVehicle.type} 
                    onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="Staff 4-Wheeler">Staff 4-Wheeler</option>
                    <option value="Staff 2-Wheeler">Staff 2-Wheeler</option>
                    <option value="Student 4-Wheeler">Student 4-Wheeler</option>
                    <option value="Student 2-Wheeler">Student 2-Wheeler</option>
                    <option value="Visitor Vehicle">Visitor Vehicle</option>
                    <option value="Delivery / Vendor">Delivery / Vendor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Parking Zone Allocation</label>
                  <select 
                    value={newVehicle.parkingZone} 
                    onChange={(e) => setNewVehicle({...newVehicle, parkingZone: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="Staff Parking Area B">Staff Parking Area B</option>
                    <option value="Staff Parking Area C">Staff Parking Area C</option>
                    <option value="Student Parking Zone A">Student Parking Zone A</option>
                    <option value="Visitor Slots C">Visitor Slots C</option>
                  </select>
                </div>
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
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] disabled:opacity-50 text-white rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Car size={15} /> {submitting ? 'Logging...' : 'Save Vehicle Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
