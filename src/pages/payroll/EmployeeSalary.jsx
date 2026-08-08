import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Plus, Edit2, XCircle } from 'lucide-react';
import SkeletonLoader from '../../components/SkeletonLoader';

const EmployeeSalary = () => {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    salaryStructureId: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    componentOverrides: [],
    grossSalary: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const [salRes, empRes, structRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/payroll/employee-salaries`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/employees`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/payroll/salary-structures`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setSalaries(salRes.data);
      
      // employeeController returns { message, data: [...employees], total, ... }
      const empData = empRes.data.data || empRes.data.employees || empRes.data;
      setEmployees(Array.isArray(empData) ? empData : []);
      
      setStructures(structRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStructureChange = (structureId) => {
    const structure = structures.find(s => s._id === structureId);
    if (!structure) return;
    
    // Initialize overrides based on structure defaults to make it easier to edit
    const overrides = [];
    let gross = 0;
    
    // Simplistic gross calculation for UI preview (backend does actual calculation during payroll)
    structure.earnings.forEach(e => {
      if(e.calculationType === 'fixed') {
        overrides.push({ code: e.code, amount: e.amount });
        gross += e.amount;
      } else {
        // Find basic for percentage
        const basic = structure.earnings.find(b => b.code === 'BASIC')?.amount || 0;
        const val = (basic * e.percentage) / 100;
        overrides.push({ code: e.code, amount: val });
        gross += val;
      }
    });

    setFormData(prev => ({
      ...prev,
      salaryStructureId: structureId,
      componentOverrides: overrides,
      grossSalary: gross
    }));
  };

  const handleOverrideChange = (code, amount) => {
    setFormData(prev => {
      const overrides = prev.componentOverrides.map(o => o.code === code ? { ...o, amount: Number(amount) } : o);
      const gross = overrides.reduce((acc, curr) => acc + curr.amount, 0); // Assuming all overrides are earnings for this simplistic UI preview
      return { ...prev, componentOverrides: overrides, grossSalary: gross };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.salaryStructureId) {
      return toast.error('Please select employee and structure');
    }
    
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${import.meta.env.VITE_API_URL}/payroll/employee-salaries/assign`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Salary assigned successfully');
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign salary');
    }
  };

  const filteredSalaries = salaries.filter(s => 
    s.employeeId?.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.employeeId?.empId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Employee Salary</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Assign and manage salary structures for employees</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2">
          <Plus size={16} /> Assign Salary
        </button>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              <th className="py-3 px-4 text-[12px] font-bold text-gray-700">Employee</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-700">Structure</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-700">Gross Salary</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-700">Effective From</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="py-8"><SkeletonLoader type="table" rows={4} cols={5} /></td></tr>
            ) : filteredSalaries.length > 0 ? (
              filteredSalaries.map(sal => (
                <tr key={sal._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-4">
                    <p className="text-[13px] font-semibold text-gray-800">{sal.employeeId?.name}</p>
                    <p className="text-[11px] text-gray-500">{sal.employeeId?.empId} • {sal.employeeId?.department}</p>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-gray-700">{sal.salaryStructureId?.name}</td>
                  <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">₹{sal.grossSalary?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{new Date(sal.effectiveFrom).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[11px] font-semibold">Active</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="py-8 text-center text-gray-500 text-[13px]">No active salary assignments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-[16px] font-bold text-gray-800">Assign Salary to Employee</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1">Select Employee</label>
                <select value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="w-full px-3 py-2.5 border rounded-lg text-[13px]">
                  <option value="">Select an employee...</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.empId}) - {e.department}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1">Select Salary Structure</label>
                <select value={formData.salaryStructureId} onChange={e => handleStructureChange(e.target.value)} className="w-full px-3 py-2.5 border rounded-lg text-[13px]">
                  <option value="">Select a structure...</option>
                  {structures.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1">Effective From</label>
                <input type="date" value={formData.effectiveFrom} onChange={e => setFormData({...formData, effectiveFrom: e.target.value})} className="w-full px-3 py-2.5 border rounded-lg text-[13px]" />
              </div>

              {formData.salaryStructureId && (
                <div className="mt-4 border border-gray-100 rounded-lg p-4 bg-gray-50">
                  <h4 className="text-[13px] font-semibold text-gray-800 mb-3 border-b pb-2">Component Overrides (Optional)</h4>
                  <p className="text-[11px] text-gray-500 mb-3">Adjust specific component amounts for this employee if they differ from the standard structure.</p>
                  
                  {formData.componentOverrides.map((override, i) => (
                    <div key={override.code} className="flex justify-between items-center mb-2">
                      <span className="text-[12px] font-medium text-gray-700">{override.code}</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[12px]">₹</span>
                        <input type="number" value={override.amount} onChange={e => handleOverrideChange(override.code, e.target.value)} className="w-32 pl-7 pr-3 py-1.5 border rounded-lg text-[13px] text-right" />
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                    <span className="text-[13px] font-bold text-gray-800">Total Gross Salary (Est.)</span>
                    <span className="text-[14px] font-bold text-[#0A6C54]">₹{formData.grossSalary.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border rounded-lg text-[13px] font-medium text-gray-700">Cancel</button>
              <button onClick={handleSubmit} className="bg-[#0A6C54] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold">Confirm Assignment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSalary;
