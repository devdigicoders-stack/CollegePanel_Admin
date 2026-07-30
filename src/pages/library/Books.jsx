import React, { useState } from 'react';
import { Search, Plus, Edit2, Eye, Download, Trash2, Filter, BookOpen, Barcode } from 'lucide-react';

const initialBooks = [
  { id: 1, accessionNo: 'ACC-8021', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', category: 'Computer Science', subject: 'Algorithms', shelf: 'CS-03', rack: 'B2', total: 5, available: 3, status: 'Available' },
  { id: 2, accessionNo: 'ACC-8022', title: 'Database System Concepts', author: 'Abraham Silberschatz', isbn: '978-0073523323', category: 'Computer Science', subject: 'Databases', shelf: 'CS-05', rack: 'A4', total: 4, available: 2, status: 'Available' },
  { id: 3, accessionNo: 'ACC-8023', title: 'Engineering Physics', author: 'Gaur & Gupta', isbn: '978-8189928236', category: 'Physics', subject: 'Optics & Wave', shelf: 'PH-01', rack: 'C1', total: 6, available: 0, status: 'Issued' },
  { id: 4, accessionNo: 'ACC-8024', title: 'Advanced Engineering Mathematics', author: 'Erwin Kreyszig', isbn: '978-0470458365', category: 'Mathematics', subject: 'Calculus', shelf: 'MA-02', rack: 'D2', total: 3, available: 3, status: 'Available' },
  { id: 5, accessionNo: 'ACC-8025', title: 'Theory of Machines', author: 'R.S. Khurmi', isbn: '978-8121925242', category: 'Mechanical Engineering', subject: 'Kinetics', shelf: 'ME-04', rack: 'E3', total: 2, available: 1, status: 'Available' },
];

const categories = ['All', 'Computer Science', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Mathematics', 'Physics', 'Chemistry', 'Journals', 'Magazines', 'Reference Books'];

const Books = () => {
  const [activeSubTab, setActiveSubTab] = useState('inventory'); // inventory or categories
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [books, setBooks] = useState(initialBooks);

  const [categoriesList, setCategoriesList] = useState([
    { name: 'Computer Science', count: 120, subjects: ['Algorithms', 'Databases', 'OS'] },
    { name: 'Mechanical Engineering', count: 85, subjects: ['Thermodynamics', 'Kinetics'] },
    { name: 'Physics', count: 40, subjects: ['Optics & Wave', 'Mechanics'] },
    { name: 'Mathematics', count: 65, subjects: ['Calculus', 'Algebra'] },
  ]);

  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science',
    subject: '',
    shelf: '',
    rack: '',
    total: 1,
    price: '',
  });

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || 
                          b.author.toLowerCase().includes(search.toLowerCase()) ||
                          b.accessionNo.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'All' || b.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddBook = (e) => {
    e.preventDefault();
    const newAcc = `ACC-${Math.floor(8000 + Math.random() * 2000)}`;
    const bookToAdd = {
      id: books.length + 1,
      accessionNo: newAcc,
      title: newBook.title,
      author: newBook.author,
      isbn: newBook.isbn,
      category: newBook.category,
      subject: newBook.subject,
      shelf: newBook.shelf,
      rack: newBook.rack,
      total: parseInt(newBook.total) || 1,
      available: parseInt(newBook.total) || 1,
      status: 'Available'
    };
    setBooks([bookToAdd, ...books]);
    setShowAddBookModal(false);
    setNewBook({
      title: '',
      author: '',
      isbn: '',
      category: 'Computer Science',
      subject: '',
      shelf: '',
      rack: '',
      total: 1,
      price: '',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      
      {/* Sub Tabs */}
      <div className="flex border-b border-gray-100 px-6 pt-2">
        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`px-6 py-4 text-[14px] font-semibold relative ${activeSubTab === 'inventory' ? 'text-[#0A6C54]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Book Inventory
          {activeSubTab === 'inventory' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-md"></div>}
        </button>
        <button
          onClick={() => setActiveSubTab('categories')}
          className={`px-6 py-4 text-[14px] font-semibold relative ${activeSubTab === 'categories' ? 'text-[#0A6C54]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Book Categories & Setup
          {activeSubTab === 'categories' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-md"></div>}
        </button>
      </div>

      {activeSubTab === 'inventory' ? (
        <>
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-[16px] font-bold text-gray-800">Book Inventory</h2>
              <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Add, edit, barcode and import library volumes</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Download size={15} /> Excel Import
              </button>
              <button onClick={() => setShowAddBookModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
                <Plus size={16} /> New Book
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by title, author or accession number..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
              />
            </div>

            <div>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Accession No</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Book Title</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Author</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800">ISBN</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Category</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Location (Shelf)</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Copies (Avail/Total)</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map(item => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.accessionNo}</td>
                    <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.title}</td>
                    <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.author}</td>
                    <td className="py-4 px-6 text-[13px] text-gray-500 font-medium">{item.isbn}</td>
                    <td className="py-4 px-6 text-[13px] text-gray-600">{item.category}</td>
                    <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.shelf} - Rack {item.rack}</td>
                    <td className="py-4 px-6 text-[13px] text-center font-bold">
                      <span className={item.available === 0 ? 'text-red-500' : 'text-green-600'}>{item.available}</span> / {item.total}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        item.status === 'Available' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 flex gap-2">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="View Info"><Eye size={15} /></button>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Edit"><Edit2 size={15} /></button>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg text-[#0A6C54] transition-colors" title="Generate Barcode"><Barcode size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categories Setup */}
          <div className="border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-[14px]">Library Categories</h3>
              <button className="text-[12px] font-bold text-[#0A6C54] hover:underline flex items-center gap-1"><Plus size={14} /> Add Category</button>
            </div>
            <div className="space-y-3">
              {categoriesList.map((cat, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-800">{cat.name}</h4>
                    <p className="text-[11px] text-gray-500">{cat.subjects.join(', ')}</p>
                  </div>
                  <span className="text-[11px] font-bold text-gray-600 bg-gray-200/50 px-2 py-0.5 rounded">{cat.count} Books</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Rack & Shelves Setup */}
          <div className="border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 text-[14px] pb-2 border-b border-gray-100">Rack Locations</h3>
            <div className="grid grid-cols-3 gap-3">
              {['Rack A1-A5 (CS)', 'Rack B1-B5 (CS)', 'Rack C1-C5 (EE)', 'Rack D1-D5 (ME)', 'Rack E1-E5 (CE)', 'Rack F1-F5 (Journals)'].map((rack, idx) => (
                <div key={idx} className="p-3 border border-gray-200 rounded-lg text-center bg-white hover:border-[#0A6C54] cursor-pointer transition-all">
                  <BookOpen className="mx-auto text-gray-400 mb-1" size={18} />
                  <span className="text-[11px] font-semibold text-gray-700">{rack}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Add New Library Book</h3>
              <button onClick={() => setShowAddBookModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddBook} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Book Title</label>
                <input 
                  type="text" 
                  required
                  value={newBook.title}
                  onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                  placeholder="e.g. Introduction to Algorithms"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Author</label>
                  <input 
                    type="text" 
                    required
                    value={newBook.author}
                    onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                    placeholder="e.g. Thomas H. Cormen"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">ISBN</label>
                  <input 
                    type="text" 
                    required
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
                    placeholder="e.g. 978-0262033848"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Category</label>
                  <select 
                    value={newBook.category} 
                    onChange={(e) => setNewBook({...newBook, category: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Subject</label>
                  <input 
                    type="text" 
                    required
                    value={newBook.subject}
                    onChange={(e) => setNewBook({...newBook, subject: e.target.value})}
                    placeholder="e.g. Algorithms"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Total Copies</label>
                  <input 
                    type="number" 
                    required
                    value={newBook.total}
                    onChange={(e) => setNewBook({...newBook, total: e.target.value})}
                    placeholder="1"
                    min="1"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Shelf Location</label>
                  <input 
                    type="text" 
                    required
                    value={newBook.shelf}
                    onChange={(e) => setNewBook({...newBook, shelf: e.target.value})}
                    placeholder="e.g. CS-03"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Rack Code</label>
                  <input 
                    type="text" 
                    required
                    value={newBook.rack}
                    onChange={(e) => setNewBook({...newBook, rack: e.target.value})}
                    placeholder="e.g. B2"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    value={newBook.price}
                    onChange={(e) => setNewBook({...newBook, price: e.target.value})}
                    placeholder="e.g. 750"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
                >
                  Add Book Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
