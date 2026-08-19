import { useState, useEffect } from 'react';
import { Download, Plus, AlertTriangle, ShieldAlert, Flag, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import * as XLSX from 'xlsx';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import SkeletonLoader from '../../components/SkeletonLoader';

const Incidents = () => {
  if (!checkPermission('Log Security Incident')) {
    return <AccessDenied />;
  }
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newIncident, setNewIncident] = useState({
    type: 'Property Damage',
    desc: '',
    priority: 'Medium',
  });

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/security/incidents');
      setIncidents(res.data);
    } catch (error) {
      toast.error('Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    if (!newIncident.desc.trim()) return toast.error('Please provide a description.');

    try {
      setSubmitting(true);
      await axiosInstance.post('/security/incidents', {
        type: newIncident.type,
        description: newIncident.desc,
        priority: newIncident.priority
      });
      setShowAddModal(false);
      toast.success('Incident logged and forwarded to Discipline Officer.');
      setNewIncident({ type: 'Property Damage', desc: '', priority: 'Medium' });
      fetchIncidents();
    } catch (error) {
      toast.error('Failed to file incident');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    if (incidents.length === 0) return toast.error('No incident records to export');
    
    const exportData = incidents.map(item => ({
      'Log ID': item._id,
      'Incident Category': item.type,
      'Priority Level': item.priority,
      'Detailed Description': item.description,
      'Forwarding Status': item.status,
      'Date Logged': new Date(item.createdAt).toLocaleString('en-IN')
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Security Incidents');
    XLSX.writeFile(wb, `Security_Incidents_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Security Incidents & Misconduct Logs</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium font-semibold">Log property damages, rule violations, and forward tickets to HOD/Discipline Office</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Registry
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors shadow-sm">
            <Plus size={16} /> File Incident Ticket
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={5} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Incident Category</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Detailed Description</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Priority Level</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Date Logged</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Forwarding Status</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold flex items-center gap-2">
                    <ShieldAlert size={14} className="text-gray-400" />
                    {item.type}
                  </td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium max-w-[300px] truncate" title={item.description}>
                    {item.description}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                      item.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-100' : 
                      item.priority === 'Medium' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                      'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                      <Flag size={12} />
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[12px] text-gray-500 font-semibold text-center">
                    {new Date(item.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                      <CheckCircle2 size={13} />
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {incidents.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <AlertTriangle size={40} className="mb-4 text-gray-200" />
                      <p className="text-[14px] font-medium text-gray-500">No Incidents Logged</p>
                      <p className="text-[12px] mt-1">Campus is safe and clear of any reported misconduct.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Incident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px] flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-500" />
                Create Incident Ticket
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleCreateIncident} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Incident Category</label>
                  <select 
                    value={newIncident.type} 
                    onChange={(e) => setNewIncident({...newIncident, type: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Property Damage">Property Damage</option>
                    <option value="Lost Item">Lost Item</option>
                    <option value="Rule Violation">Rule Violation</option>
                    <option value="Theft / Misplacement">Theft / Misplacement</option>
                    <option value="Medical Emergency">Medical Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Priority Level</label>
                  <select 
                    value={newIncident.priority} 
                    onChange={(e) => setNewIncident({...newIncident, priority: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Detailed Description *</label>
                <textarea 
                  required
                  placeholder="Describe the incident, involved parties, location, etc."
                  value={newIncident.desc}
                  onChange={(e) => setNewIncident({...newIncident, desc: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-lg text-[13px] h-28 resize-none focus:outline-none focus:ring-1 focus:ring-primary bg-gray-50/50"
                />
              </div>

              <div className="bg-yellow-50 text-yellow-700 text-[11px] p-3 rounded-lg border border-yellow-100 flex items-start gap-2">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <p>This incident report will be immediately forwarded to the Chief Security Officer and Disciplinary Committee.</p>
              </div>

              <div className="flex gap-3 pt-2">
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
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-lg text-[13px] font-semibold shadow-sm transition-colors"
                >
                  {submitting ? 'Logging...' : 'File Incident Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;
