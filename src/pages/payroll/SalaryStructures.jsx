import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Edit2, CheckCircle, XCircle } from 'lucide-react';
import SkeletonLoader from '../../components/SkeletonLoader';

const SalaryStructures = () => {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    earnings: [{ name: 'Basic Salary', code: 'BASIC', calculationType: 'fixed', amount: 0 }],
    deductions: []
  });

  const fetchStructures = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/payroll/salary-structures`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStructures(res.data);
    } catch (error) {
      toast.error('Failed to fetch salary structures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, []);

  const handleAddComponent = (type) => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], { name: '', code: '', calculationType: 'fixed', amount: 0, percentage: 0 }]
    }));
  };

  const handleComponentChange = (type, index, field, value) => {
    const updated = [...formData[type]];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, [type]: updated }));
  };

  const removeComponent = (type, index) => {
    const updated = formData[type].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [type]: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${import.meta.env.VITE_API_URL}/payroll/salary-structures`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Salary structure created successfully');
      setShowModal(false);
      fetchStructures();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create structure');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Salary Structures</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Manage employee earning and deduction templates</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-2">
          <Plus size={16} /> Create Structure
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <SkeletonLoader type="card" count={3} />
          ) : structures.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No salary structures found. Create one to get started.</p>
          ) : (
            structures.map(structure => (
              <div key={structure._id} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-[15px] font-bold text-gray-800">{structure.name}</h3>
                    <p className="text-[12px] text-gray-500">{structure.description}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${structure.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {structure.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-[13px] font-semibold text-gray-700 mb-2 border-b pb-1">Earnings</h4>
                    {structure.earnings.map((e, i) => (
                      <div key={i} className="flex justify-between text-[12px] text-gray-600 mb-1">
                        <span>{e.name} ({e.code})</span>
                        <span className="font-medium">{e.calculationType === 'fixed' ? `₹${e.amount}` : `${e.percentage}% of BASIC`}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="text-[13px] font-semibold text-gray-700 mb-2 border-b pb-1">Deductions</h4>
                    {structure.deductions.map((d, i) => (
                      <div key={i} className="flex justify-between text-[12px] text-gray-600 mb-1">
                        <span>{d.name} ({d.code})</span>
                        <span className="font-medium">{d.calculationType === 'fixed' ? `₹${d.amount}` : `${d.percentage}% of BASIC`}</span>
                      </div>
                    ))}
                    {structure.deductions.length === 0 && <p className="text-[12px] text-gray-400">No deductions configured</p>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-[16px] font-bold text-gray-800">Create Salary Structure</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">Structure Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-[13px]" placeholder="e.g. Teaching Staff Structure" required />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">Description</label>
                  <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-[13px]" placeholder="Optional description" />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-[14px] font-bold text-gray-800">Earnings Components</h4>
                  <button type="button" onClick={() => handleAddComponent('earnings')} className="text-[#0A6C54] text-[12px] font-semibold">+ Add Earning</button>
                </div>
                {formData.earnings.map((e, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-center">
                    <input type="text" placeholder="Name (e.g. HRA)" value={e.name} onChange={ev => handleComponentChange('earnings', i, 'name', ev.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-[13px]" />
                    <input type="text" placeholder="Code (e.g. HRA)" value={e.code} onChange={ev => handleComponentChange('earnings', i, 'code', ev.target.value)} className="w-24 px-3 py-2 border rounded-lg text-[13px] uppercase" />
                    <select value={e.calculationType} onChange={ev => handleComponentChange('earnings', i, 'calculationType', ev.target.value)} className="w-32 px-3 py-2 border rounded-lg text-[13px]">
                      <option value="fixed">Fixed</option>
                      <option value="percentage">% of Basic</option>
                    </select>
                    {e.calculationType === 'fixed' ? (
                      <input type="number" placeholder="Amount (₹)" value={e.amount} onChange={ev => handleComponentChange('earnings', i, 'amount', Number(ev.target.value))} className="w-28 px-3 py-2 border rounded-lg text-[13px]" />
                    ) : (
                      <input type="number" placeholder="Percentage" value={e.percentage} onChange={ev => handleComponentChange('earnings', i, 'percentage', Number(ev.target.value))} className="w-28 px-3 py-2 border rounded-lg text-[13px]" />
                    )}
                    <button type="button" onClick={() => removeComponent('earnings', i)} className="text-red-500 hover:text-red-700 disabled:opacity-50" disabled={e.code === 'BASIC'}>✕</button>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-[14px] font-bold text-gray-800">Deduction Components</h4>
                  <button type="button" onClick={() => handleAddComponent('deductions')} className="text-red-600 text-[12px] font-semibold">+ Add Deduction</button>
                </div>
                {formData.deductions.map((d, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-center">
                    <input type="text" placeholder="Name (e.g. PF)" value={d.name} onChange={ev => handleComponentChange('deductions', i, 'name', ev.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-[13px]" />
                    <input type="text" placeholder="Code (e.g. PF)" value={d.code} onChange={ev => handleComponentChange('deductions', i, 'code', ev.target.value)} className="w-24 px-3 py-2 border rounded-lg text-[13px] uppercase" />
                    <select value={d.calculationType} onChange={ev => handleComponentChange('deductions', i, 'calculationType', ev.target.value)} className="w-32 px-3 py-2 border rounded-lg text-[13px]">
                      <option value="fixed">Fixed</option>
                      <option value="percentage">% of Basic</option>
                    </select>
                    {d.calculationType === 'fixed' ? (
                      <input type="number" placeholder="Amount (₹)" value={d.amount} onChange={ev => handleComponentChange('deductions', i, 'amount', Number(ev.target.value))} className="w-28 px-3 py-2 border rounded-lg text-[13px]" />
                    ) : (
                      <input type="number" placeholder="Percentage" value={d.percentage} onChange={ev => handleComponentChange('deductions', i, 'percentage', Number(ev.target.value))} className="w-28 px-3 py-2 border rounded-lg text-[13px]" />
                    )}
                    <button type="button" onClick={() => removeComponent('deductions', i)} className="text-red-500 hover:text-red-700">✕</button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border rounded-lg text-[13px] font-medium text-gray-700">Cancel</button>
              <button onClick={handleSubmit} className="bg-[#0A6C54] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold">Save Structure</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryStructures;
