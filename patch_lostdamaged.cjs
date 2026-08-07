const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, Check, Trash2, Eye, Edit2, X } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const LostDamaged = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Lost',
    cost: 0,
    penalty: 0,
    status: 'Pending Cost Recovery'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/library/lost-damaged');
      setCases(res.data);
    } catch (error) {
      toast.error('Failed to load lost/damaged cases');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSearch = async (e) => {
    e.preventDefault();
    if(!bookSearch) return;
    try {
      const res = await axiosInstance.get(\`/library/books?search=\${bookSearch}\`);
      const books = res.data.books || [];
      if (books.length > 0) {
        setSelectedBook(books[0]);
        setFormData(prev => ({ ...prev, cost: books[0].price || 0 }));
        toast.success('Book found');
      } else {
        toast.error('Book not found!');
        setSelectedBook(null);
      }
    } catch(err) {
      toast.error('Error searching book');
    }
  };

  const handleMemberSearch = async (e) => {
    e.preventDefault();
    if(!memberSearch) return;
    try {
      const res = await axiosInstance.get(\`/library/members?search=\${memberSearch}\`);
      const members = res.data.members || [];
      if (members.length > 0) {
        setSelectedMember(members[0]);
        toast.success('Member found');
      } else {
        toast.error('Member not found!');
        setSelectedMember(null);
      }
    } catch(err) {
      toast.error('Error searching member');
    }
  };

  const handleReportCase = async () => {
    if (!selectedBook || !selectedMember) {
      toast.error('Please select both a book and a member');
      return;
    }
    try {
      setIsSubmitting(true);
      await axiosInstance.post('/library/lost-damaged', {
        bookId: selectedBook._id,
        memberId: selectedMember._id,
        type: formData.type,
        cost: formData.cost,
        penalty: formData.penalty,
        status: formData.status
      });
      toast.success('Case reported successfully');
      setShowAddModal(false);
      setSelectedBook(null);
      setSelectedMember(null);
      setBookSearch('');
      setMemberSearch('');
      fetchCases();
    } catch (error) {
      toast.error('Failed to report case');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (id, resolution) => {
    try {
      await axiosInstance.put(\`/library/lost-damaged/\${id}\`, { status: resolution });
      toast.success(\`Case updated to: \${resolution}\`);
      fetchCases();
    } catch (error) {
      toast.error('Failed to update case');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this case?')) return;
    try {
      await axiosInstance.delete(\`/library/lost-damaged/\${id}\`);
      toast.success('Case deleted');
      fetchCases();
    } catch (error) {
      toast.error('Failed to delete case');
    }
  };

  const filtered = cases.filter(c => {
    const titleMatch = c.bookId?.title?.toLowerCase().includes(search.toLowerCase());
    const caseMatch = c.caseNo?.toLowerCase().includes(search.toLowerCase());
    const memberMatch = c.memberId?.firstName?.toLowerCase().includes(search.toLowerCase());
    const matchesSearch = titleMatch || caseMatch || memberMatch;
    const matchesType = filterType === 'All' || c.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter'] relative">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Lost & Damaged Book Registry</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Record missing books, process student replacements, and manage cost recovery penalties</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={15} /> Report Case
          </button>
        </div>
      </div>

      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by book title, member name or case number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>

        <div className="flex gap-3">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Lost">Lost</option>
            <option value="Damaged">Damaged</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading cases...</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Case ID</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Accession No</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Book Title</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Reported By</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Type</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Book Cost</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Penalty</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.caseNo}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{item.bookId?.accessionNo || 'N/A'}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.bookId?.title || 'N/A'}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">
                    {item.memberId ? \`\${item.memberId.firstName} \${item.memberId.lastName||''}\` : 'Unknown'}
                  </td>
                  <td className="py-4 px-6 text-[13px]">
                    <span className={\`px-2 py-0.5 text-[11px] rounded font-semibold \${
                      item.type === 'Lost' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                    }\`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-right font-semibold text-gray-800">₹{item.cost || 0}</td>
                  <td className="py-4 px-6 text-[13px] text-right font-semibold text-red-500">₹{item.penalty || 0}</td>
                  <td className="py-4 px-6 text-[13px]">
                    <span className={\`px-2.5 py-1 rounded-full text-[11px] font-semibold \${
                      item.status?.includes('Recovered') || item.status?.includes('Received') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                    }\`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex gap-1.5 flex-wrap max-w-[200px]">
                    {item.status?.includes('Recovery') ? (
                      <>
                        <button onClick={() => handleResolve(item._id, 'Replacement Received')} className="px-2 py-1 text-[11px] font-bold bg-[#0A6C54] text-white rounded hover:bg-[#085a46]">Replacement</button>
                        <button onClick={() => handleResolve(item._id, 'Book Cost Recovered')} className="px-2 py-1 text-[11px] font-bold bg-blue-600 text-white rounded hover:bg-blue-700">Recover Cost</button>
                        <button onClick={() => handleDelete(item._id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14}/></button>
                      </>
                    ) : (
                      <span className="text-[12px] text-gray-400 font-medium italic">Case Closed</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="9" className="p-12 text-center text-gray-500">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-800">Report Lost / Damaged Book</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="border border-gray-100 p-4 rounded-xl bg-gray-50/50 space-y-3">
                <form onSubmit={handleBookSearch} className="flex gap-2">
                  <input type="text" placeholder="Search Book by Accession No..." value={bookSearch} onChange={e=>setBookSearch(e.target.value)} className="flex-1 p-2 border border-gray-200 rounded-lg text-sm" />
                  <button type="submit" className="bg-[#0A6C54] text-white px-3 py-2 rounded-lg text-sm font-bold">Search</button>
                </form>
                {selectedBook && <div className="text-sm font-bold text-green-700">✓ Selected: {selectedBook.title} ({selectedBook.accessionNo})</div>}
              </div>

              <div className="border border-gray-100 p-4 rounded-xl bg-gray-50/50 space-y-3">
                <form onSubmit={handleMemberSearch} className="flex gap-2">
                  <input type="text" placeholder="Search Member by Enrollment No..." value={memberSearch} onChange={e=>setMemberSearch(e.target.value)} className="flex-1 p-2 border border-gray-200 rounded-lg text-sm" />
                  <button type="submit" className="bg-[#0A6C54] text-white px-3 py-2 rounded-lg text-sm font-bold">Search</button>
                </form>
                {selectedMember && <div className="text-sm font-bold text-green-700">✓ Selected: {selectedMember.name}</div>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Incident Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]">
                    <option value="Lost">Lost Book</option>
                    <option value="Damaged">Damaged Book</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Book Cost (₹)</label>
                  <input type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Penalty (₹)</label>
                  <input type="number" value={formData.penalty} onChange={e => setFormData({...formData, penalty: Number(e.target.value)})} className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]" />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleReportCase} disabled={isSubmitting} className="px-5 py-2 text-sm font-bold text-white bg-[#0A6C54] hover:bg-[#085a46] rounded-lg">
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostDamaged;
`;

fs.writeFileSync('d:/Desktop/DCT_CLG_CRM/admin/src/pages/library/LostDamaged.jsx', content, 'utf-8');
console.log("Rewrote LostDamaged.jsx");
