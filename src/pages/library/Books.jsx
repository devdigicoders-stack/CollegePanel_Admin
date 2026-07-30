import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const Books = () => {
  const [activeSubTab, setActiveSubTab] = useState('inventory');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [books, setBooks] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = ['All', 'Computer Science', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Mathematics', 'Physics', 'Chemistry', 'Journals', 'Magazines', 'Reference Books'];

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [page, search, filterCategory]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterCategory && filterCategory !== 'All') params.append('category', filterCategory);
      params.append('page', page);
      params.append('limit', 10);
      
      const response = await axiosInstance.get(`/library/books?${params.toString()}`);
      setBooks(response.data);
      setTotalPages(response.data.length > 0 ? 1 : 0); // Simple pagination
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/library/categories');
      setCategoriesList(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddBook = () => {
    console.log('Add book action');
  };

  const handleEditBook = (bookId) => {
    console.log('Edit book action:', bookId);
  };

  const handleViewInfo = (bookId) => {
    console.log('View book info:', bookId);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      
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
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-[16px] font-bold text-gray-800">Book Inventory</h2>
              <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Add, edit, barcode and import library volumes</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <span>📊</span> Excel Import
              </button>
              <button onClick={handleAddBook} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
                <span>+</span> New Book
              </button>
            </div>
          </div>

          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px] relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">Loading books...</div>
            </div>
          ) : (
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
                  {books.map(item => (
                    <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.accessionNo}</td>
                      <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.title}</td>
                      <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.author}</td>
                      <td className="py-4 px-6 text-[13px] text-gray-500 font-medium">{item.isbn}</td>
                      <td className="py-4 px-6 text-[13px] text-gray-600">{item.category}</td>
                      <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.shelf || '-'} - Rack {item.rack || '-'}</td>
                      <td className="py-4 px-6 text-[13px] text-center font-bold">
                        <span className={item.availableCopies === 0 ? 'text-red-500' : 'text-green-600'}>{item.availableCopies || 0}</span> / {item.totalCopies || 0}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${item.status === 'Available' ? 'bg-green-50 text-green-700 border border-green-100' : item.status === 'Lost' || item.status === 'Damaged' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}`}>                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 flex gap-2">
                        <button onClick={() => handleViewInfo(item._id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="View Info">🔍</button>
                        <button onClick={() => handleEditBook(item._id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Edit">✏️</button>
                        <button onClick={() => handleViewInfo(item._id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-[#0A6C54] transition-colors" title="Generate Barcode">📝</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {books.length === 0 && (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  No books found.
                </div>
              )}
            </div>
          )}

          {books.length > 0 && (
            <div className="p-6 border-t border-gray-100 flex justify-between items-center">
              <span className="text-[13px] text-gray-500">
                Showing {books.length} books • Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-[13px] border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-[13px] border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-[14px]">Library Categories</h3>
              <button className="text-[12px] font-bold text-[#0A6C54] hover:underline flex items-center gap-1"><span>+</span> Add Category</button>
            </div>
            <div className="space-y-3">
              {categoriesList.length > 0 ? (
                categoriesList.map((cat, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-[13px] font-bold text-gray-800">{cat.name}</h4>
                      <p className="text-[11px] text-gray-500">{cat.subjects?.join(', ') || 'No subjects'}</p>
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 bg-gray-200/50 px-2 py-0.5 rounded">{cat.count} Books</span>
                  </div>
                ))
              ) : (
                <div className="text-[13px] text-gray-500">Loading categories...</div>
              )}
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 text-[14px] pb-2 border-b border-gray-100">Rack Locations</h3>
            <div className="grid grid-cols-3 gap-3">
              {['Rack A1-A5 (CS)', 'Rack B1-B5 (CS)', 'Rack C1-C5 (EE)', 'Rack D1-D5 (ME)', 'Rack E1-E5 (CE)', 'Rack F1-F5 (Journals)'].map((rack, idx) => (
                <div key={idx} className="p-3 border border-gray-200 rounded-lg text-center bg-white hover:border-[#0A6C54] cursor-pointer transition-all">
                  <span className="text-[11px] font-semibold text-gray-700">{rack}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="p-6 border-t border-gray-100 bg-gray-50/50">
        <h3 className="text-[14px] font-bold text-gray-800 mb-3">Bulk Upload / Quick Import</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#0A6C54] cursor-pointer transition-all">
          <div className="text-gray-400 mb-2">📁 Drag and drop files here or</div>
          <button className="text-[#0A6C54] font-semibold hover:underline">browse files</button>
          <div className="text-[11px] text-gray-400 mt-2">Supported formats: CSV, Excel, JSON</div>
        </div>
      </div>
    </div>
  );
};

export default Books;
