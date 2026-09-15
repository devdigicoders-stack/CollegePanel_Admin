import { useState, useEffect, useRef } from 'react';
import { 
  Lock, Sparkles, ShieldCheck, 
  ArrowLeft, PhoneCall, 
  Bed, UtensilsCrossed, DoorOpen, Library, ShieldAlert,
  X, Check, ChevronDown, ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';

export const AVAILABLE_PREMIUM_MODULES = [
  {
    key: 'hostel',
    name: 'Hostel Management',
    desc: 'Rooms, Bed Allotment, In/Out, Assets & Leave Records',
    icon: Bed,
    badge: 'Popular'
  },
  {
    key: 'mess',
    name: 'Mess Management',
    desc: 'Meal Menu, Enrolled Students, Stock & Daily Food Log',
    icon: UtensilsCrossed,
    badge: 'Essential'
  },
  {
    key: 'library',
    name: 'Library Management',
    desc: 'Books Catalog, Issue/Return Desk & Automated Fines',
    icon: Library,
    badge: 'Automated'
  },
  {
    key: 'complaints',
    name: 'Complaint & Discipline',
    desc: 'Student Complaints, Room Issues & Discipline Logs',
    icon: ShieldAlert,
    badge: 'Security'
  },
  {
    key: 'security',
    name: 'Campus Security & Gatepass',
    desc: 'Gate Security, Visitor Management & Check-in Desk',
    icon: DoorOpen,
    badge: 'Safety'
  },
  {
    key: 'all',
    name: '⚡ Full Premium Suite (All Modules)',
    desc: 'All 5 premium modules bundled with VIP priority support',
    icon: Sparkles,
    badge: 'Best Value'
  }
];

// Helper to determine the initial module key based on current page
const resolveInitialKey = (key, name) => {
  if (key && AVAILABLE_PREMIUM_MODULES.some(m => m.key === key)) {
    return key;
  }
  const lower = (name || '').toLowerCase();
  if (lower.includes('hostel')) return 'hostel';
  if (lower.includes('mess')) return 'mess';
  if (lower.includes('library')) return 'library';
  if (lower.includes('complaint')) return 'complaints';
  if (lower.includes('security') || lower.includes('visitor') || lower.includes('gatepass')) return 'security';
  return 'all';
};

export const PremiumLockScreen = ({ moduleName = 'This Premium Feature', moduleKey = 'all' }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    note: ''
  });

  // Multi-selector state
  const [selectedKeys, setSelectedKeys] = useState(() => [resolveInitialKey(moduleKey, moduleName)]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');

  // Pre-select the current page module whenever modal opens or moduleKey/moduleName changes
  useEffect(() => {
    if (showModal) {
      setSelectedKeys([resolveInitialKey(moduleKey, moduleName)]);
    }
  }, [showModal, moduleKey, moduleName]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleModule = (key) => {
    if (key === 'all') {
      if (selectedKeys.includes('all')) {
        setSelectedKeys([]);
      } else {
        setSelectedKeys(['all']);
      }
      return;
    }

    let updated = selectedKeys.filter(k => k !== 'all');
    if (updated.includes(key)) {
      updated = updated.filter(k => k !== key);
    } else {
      updated.push(key);
    }

    // If all 5 individual modules are checked, collapse to 'all'
    const individualKeys = ['hostel', 'mess', 'library', 'complaints', 'security'];
    const allIndividualsSelected = individualKeys.every(k => updated.includes(k));
    if (allIndividualsSelected) {
      setSelectedKeys(['all']);
    } else {
      setSelectedKeys(updated);
    }
  };

  const removeModule = (key, e) => {
    if (e) e.stopPropagation();
    setSelectedKeys(prev => prev.filter(k => k !== key));
  };

  const selectAll = (e) => {
    if (e) e.stopPropagation();
    setSelectedKeys(['all']);
  };

  const clearAll = (e) => {
    if (e) e.stopPropagation();
    setSelectedKeys([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedKeys.length === 0) {
      toast.error('Please select at least one module to request activation.');
      return;
    }

    try {
      setSubmitting(true);
      const isAll = selectedKeys.includes('all') || selectedKeys.length >= 5;
      const selectedModules = AVAILABLE_PREMIUM_MODULES.filter(m => selectedKeys.includes(m.key));
      
      const formattedName = isAll 
        ? '⚡ Full Premium Suite (All Modules)' 
        : selectedModules.map(m => m.name).join(', ');

      const formattedKey = isAll ? 'all' : selectedKeys.join(', ');
      const formattedKeys = isAll ? ['all'] : selectedKeys;

      const res = await axiosInstance.post('/upgrade-requests', {
        contactPerson: formData.name || adminInfo.name || 'College Admin',
        phone: formData.phone,
        moduleName: formattedName,
        moduleKey: formattedKey,
        moduleKeys: formattedKeys
      });

      setRequestSent(true);
      toast.success(res.data.message || 'Upgrade request submitted to Superadmin!', {
        duration: 5000,
        icon: '💎'
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const premiumPerks = [
    {
      icon: Bed,
      title: 'Hostel & Bed Allotment',
      desc: 'Real-time room occupancy, automatic bed allocations, asset & inventory registers.'
    },
    {
      icon: UtensilsCrossed,
      title: 'Mess & Food Management',
      desc: 'Weekly nutritious meal scheduling, grocery inventory & daily consumption tracking.'
    },
    {
      icon: DoorOpen,
      title: 'Smart Student In/Out & Leaves',
      desc: 'Digital leave approval workflows, gate-pass security verification & visitor gate logs.'
    },
    {
      icon: Library,
      title: 'Automated Digital Library',
      desc: 'Barcode/ISBN cataloging, instant issue/return desk & auto-fine calculation engine.'
    }
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 md:p-8 font-['Outfit']">
      <div className="max-w-3xl w-full bg-white rounded-3xl border border-amber-200/60 shadow-[0_20px_50px_rgba(245,158,11,0.08)] overflow-hidden relative">
        
        {/* Top Decorative Gradient Ribbon */}
        <div className="h-2.5 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="p-6 md:p-12 relative z-10 flex flex-col items-center text-center">
          
          {/* Lock Icon Emblem */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-1 shadow-xl shadow-amber-500/25 animate-pulse">
              <div className="w-full h-full bg-[#0F172A] rounded-[20px] flex items-center justify-center">
                <Lock size={42} className="text-amber-400" strokeWidth={2.2} />
              </div>
            </div>
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
              <Sparkles size={11} className="stroke-[3]" />
              PRO
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[12px] font-bold uppercase tracking-widest mb-3">
            <ShieldCheck size={14} className="text-amber-600" />
            Premium Campus Feature • Paid License Required
          </div>

          {/* Main Titles */}
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2.5 font-['Inter']">
            {moduleName} is Locked
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-xl mb-8 leading-relaxed font-['Inter']">
            This module is part of the <span className="font-semibold text-slate-800">Premium Campus Management Suite</span>. 
            Your current plan only includes <span className="font-semibold text-emerald-700">Core ERP Features</span>. 
            Upgrade to unlock full automation and control.
          </p>

          {/* Perks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left mb-8">
            {premiumPerks.map((perk, idx) => {
              const Icon = perk.icon;
              return (
                <div key={idx} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-amber-50/40 hover:border-amber-200 transition-all flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-800 font-['Inter']">{perk.title}</h4>
                    <p className="text-[11.5px] text-slate-500 leading-snug mt-0.5">{perk.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-[14px] shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles size={16} className="stroke-[2.5]" />
              Upgrade to Premium Suite
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[14px] transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Core Dashboard
            </button>
          </div>

          {/* Footer note */}
          <p className="text-xs text-slate-400 mt-6 flex items-center gap-2">
            <PhoneCall size={12} className="text-amber-500" />
            Contact Administrator or Support for immediate license key activation
          </p>
        </div>
      </div>

      {/* Upgrade Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-amber-100/80 flex flex-col max-h-[92vh] overflow-hidden relative animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-yellow-400 p-4 sm:p-5 text-slate-950 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-950/10 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Unlock Premium Campus</h3>
                  <p className="text-xs text-slate-900/80 font-medium">Request instant upgrade consultation</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-slate-950 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {requestSent ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                  <Check size={28} className="stroke-[3]" />
                </div>
                <h4 className="text-lg font-bold text-slate-800">Request Received!</h4>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">Our customer support manager will contact you within 2 hours with the activation plan.</p>
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-5 px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">College / Organization Name</label>
                  <input
                    type="text"
                    defaultValue={adminInfo.collegeName || 'Polytechnic College'}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Principal / Admin Name"
                      defaultValue={adminInfo.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / WhatsApp Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Fully Dynamic Multi-Select Dropdown Section inside Safe Area */}
                <div className="pt-1" ref={dropdownRef}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span>Module(s) You Want to Activate</span>
                      <span className="text-[10px] text-amber-700 font-normal">
                        ({selectedKeys.includes('all') ? 'All Modules' : `${selectedKeys.length} selected`})
                      </span>
                    </label>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={selectAll}
                        className="text-amber-800 font-bold hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={clearAll}
                        className="text-slate-500 hover:text-slate-800"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Multi-select Trigger Input Box */}
                  <div
                    onClick={() => setIsDropdownOpen(prev => !prev)}
                    tabIndex={0}
                    className={`w-full min-h-[44px] p-2 bg-white border rounded-xl cursor-pointer flex flex-wrap items-center justify-between gap-1.5 transition-all text-xs focus:outline-none ${
                      isDropdownOpen 
                        ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-1.5 flex-1 pr-1">
                      {selectedKeys.length === 0 ? (
                        <span className="text-slate-400 font-normal px-1">
                          Click to select module(s)...
                        </span>
                      ) : selectedKeys.includes('all') ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 text-amber-900 font-bold text-[11px] shadow-xs animate-in fade-in">
                          <Sparkles size={12} className="text-amber-600 fill-amber-500" />
                          <span>⚡ Full Premium Suite (All Modules)</span>
                          <button
                            type="button"
                            onClick={(e) => removeModule('all', e)}
                            className="w-4 h-4 rounded-full hover:bg-amber-200/80 flex items-center justify-center text-amber-900 transition-colors"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ) : (
                        selectedKeys.map(key => {
                          const mod = AVAILABLE_PREMIUM_MODULES.find(m => m.key === key);
                          if (!mod) return null;
                          const ModIcon = mod.icon;
                          return (
                            <span 
                              key={key}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-semibold text-[11px] shadow-2xs animate-in fade-in"
                            >
                              <ModIcon size={12} className="text-amber-700" />
                              <span className="truncate max-w-[150px]">{mod.name}</span>
                              <button
                                type="button"
                                onClick={(e) => removeModule(key, e)}
                                className="w-3.5 h-3.5 rounded-full hover:bg-amber-200/80 flex items-center justify-center text-amber-900 transition-colors ml-0.5"
                              >
                                <X size={10} />
                              </button>
                            </span>
                          );
                        })
                      )}
                    </div>

                    {/* Right controls inside trigger */}
                    <div className="flex items-center gap-1 text-slate-400 pl-1 border-l border-slate-100 flex-shrink-0">
                      {selectedKeys.length > 0 && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          {selectedKeys.includes('all') ? 'ALL' : selectedKeys.length}
                        </span>
                      )}
                      {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Options Menu rendered cleanly inside modal safe flow */}
                  {isDropdownOpen && (
                    <div className="mt-2 bg-gradient-to-b from-amber-50/40 via-slate-50/30 to-white border border-amber-200/90 rounded-2xl p-2.5 space-y-1.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-2 py-1 flex items-center justify-between border-b border-amber-200/50 pb-1.5 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                          <Sparkles size={12} className="text-amber-500 fill-amber-400" />
                          Choose Modules ({AVAILABLE_PREMIUM_MODULES.length})
                        </span>
                        <span className="text-[10px] text-amber-800 font-medium">
                          click to select/unselect
                        </span>
                      </div>

                      <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                        {AVAILABLE_PREMIUM_MODULES.map((module) => {
                          const isSelected = selectedKeys.includes('all') 
                            ? module.key === 'all' 
                            : selectedKeys.includes(module.key);
                          const Icon = module.icon;

                          return (
                            <div
                              key={module.key}
                              onClick={() => toggleModule(module.key)}
                              className={`p-2 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
                                isSelected 
                                  ? 'bg-amber-50/90 border border-amber-300 text-slate-900 font-medium shadow-2xs' 
                                  : 'hover:bg-white/80 border border-transparent text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                                  isSelected 
                                    ? 'bg-amber-500 border-amber-500 text-white shadow-2xs' 
                                    : 'border-slate-300 bg-white'
                                }`}>
                                  {isSelected && <Check size={12} className="stroke-[3]" />}
                                </div>

                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  module.key === 'all' ? 'bg-amber-400/20 text-amber-700' : 'bg-white border border-slate-100 text-slate-600'
                                }`}>
                                  <Icon size={14} />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-800 truncate">{module.name}</span>
                                    {module.badge && (
                                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                                        module.key === 'all' ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-600'
                                      }`}>
                                        {module.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10.5px] text-slate-400 truncate">{module.desc}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-1.5 border-t border-amber-200/50 flex items-center justify-between text-[11px] px-2 text-slate-500">
                        <span>
                          {selectedKeys.includes('all') 
                            ? '⚡ Full Suite bundle selected' 
                            : `${selectedKeys.length} module(s) chosen`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(false)}
                          className="px-2.5 py-0.5 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] shadow-xs transition-colors"
                        >
                          Done ✓
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || selectedKeys.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Sparkles size={14} className="stroke-[2.5]" />
                    {submitting ? 'Submitting...' : 'Send Activation Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumLockScreen;

