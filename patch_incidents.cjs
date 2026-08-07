const fs = require('fs');
const path = require('path');

const filepath = path.join('d:', 'Desktop', 'DCT_CLG_CRM', 'admin', 'src', 'pages', 'hostel-warden', 'Incidents.jsx');

const content = `import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, AlertCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../../utils/axiosInstance';

const Incidents = () => {
  const [search, setSearch] = useState('');
  const [incidents, setIncidents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIncident, setNewIncident] = useState({
    studentId: '',
    incidentType: 'Late return',
    description: '',
    actionTaken: 'Under Investigation / Review'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incRes, studentsRes] = await Promise.all([
        axiosInstance.get('/hostel/incidents'),
        axiosInstance.get('/students')
      ]);
      setIncidents(incRes.data || []);
      setStudents(studentsRes.data.students || []);
    } catch (error) {
      toast.error('Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  const filtered = incidents.filter(i => {
    const studentName = i.studentId?.name?.toLowerCase() || '';
    return studentName.includes(search.toLowerCase());
  });

  const handleAddIncident = async (e) => {
    e.preventDefault();
    if (!newIncident.studentId) return toast.error('Select a student');
    try {
      await axiosInstance.post('/hostel/incidents', {
        ...newIncident,
        date: new Date()
      });
      toast.success('Disciplinary incident logged.');
      setShowAddModal(false);
      setNewIncident({
        studentId: '',
        incidentType: 'Late return',
        description: '',
        actionTaken: 'Under Investigation / Review'
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error logging incident');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Discipline & Incident Registry</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Record curfew delays, property damages, or rule violations</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Registry
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Log Incident
          </button>
        </div>
      </div>

      <div className="p-6 border-b border-gray-100 bg-gray-50/30">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by student name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-red-600"
          />
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">Loading incidents...</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Incident Type</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Occurrence Date</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Details / Description</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Action Taken / Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.studentId?.name || 'Unknown'} <span className="text-gray-500 font-normal text-[11px] block">{item.studentId?.rollNumber}</span></td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{item.incidentType}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500">{item.description}</td>
                  <td className="py-4 px-6 text-[13px] font-medium text-gray-700 italic">{item.actionTaken}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500 text-[13px]">No incidents found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Log Disciplinary Incident</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddIncident} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Student</label>
                <select 
                  required
                  value={newIncident.studentId}
                  onChange={(e) => setNewIncident({...newIncident, studentId: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-red-600"
                >
                  <option value="">Select Student...</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Incident Type</label>
                <select 
                  value={newIncident.incidentType} 
                  onChange={(e) => setNewIncident({...newIncident, incidentType: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-red-600"
                >
                  <option value="Late return">Late return</option>
                  <option value="Unauthorized absence">Unauthorized absence</option>
                  <option value="Property damage">Property damage</option>
                  <option value="Rule violation">Rule violation</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Description / Details</label>
                <textarea 
                  required
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-24 resize-none focus:outline-none focus:ring-1 focus:ring-red-600"
                />
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
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[13px] font-semibold"
                >
                  Post Record
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
`;

fs.writeFileSync(filepath, content, 'utf-8');
console.log("Rewrote Incidents.jsx");
