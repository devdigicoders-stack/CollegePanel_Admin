import SkeletonLoader from '../../components/SkeletonLoader';
import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import { X, Search, Edit2, Trash2, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const Books = () => {
  if (!checkPermission('View Books') && !checkPermission('Add Book') && !checkPermission('Edit Book')) {
    return <AccessDenied />;
  }
  const [activeSubTab, setActiveSubTab] = useState('inventory');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [books, setBooks] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    accessionNo: '', title: '', author: '', isbn: '', category: 'Computer Science', 
    totalCopies: 1, price: 0, shelf: '', rack: '', status: 'Available'
  });

  const [categories, setCategories] = useState(['All', 'Journals', 'Magazines', 'Reference Books']);

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
      setBooks(response.data.books || response.data);
      if(response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages || 1);
      } else {
        setTotalPages(response.data.length > 0 ? 1 : 0);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const [libCatsRes, deptsRes] = await Promise.all([
        axiosInstance.get('/library/categories'),
        axiosInstance.get('/academics/departments').catch(() => ({ data: [] }))
      ]);
      setCategoriesList(libCatsRes.data || []);
      
      const depts = deptsRes.data.data || deptsRes.data || [];
      const deptNames = depts.map(d => d.name);
      const libCatNames = (libCatsRes.data || []).map(c => c._id).filter(Boolean);
      
      const combined = ['All', ...new Set([...deptNames, ...libCatNames, 'Journals', 'Magazines', 'Reference Books'])];
      setCategories(combined);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      accessionNo: '', title: '', author: '', isbn: '', category: 'Computer Science', 
      totalCopies: 1, price: 0, shelf: '', rack: '', status: 'Available'
    });
    setSelectedBook(null);
  };

  const handleAddBookClick = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditBookClick = (book) => {
    setFormData({
      accessionNo: book.accessionNo || '',
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      category: book.category || 'Computer Science',
      totalCopies: book.totalCopies || 1,
      price: book.price || 0,
      shelf: book.shelf || '',
      rack: book.rack || '',
      status: book.status || 'Available'
    });
    setSelectedBook(book);
    setShowEditModal(true);
  };

  const handleSaveBook = async () => {
    if (!formData.accessionNo || !formData.title || !formData.author || !formData.category) {
      toast.error('Please fill required fields (Accession No, Title, Author, Category)');
      return;
    }
    try {
      setIsSubmitting(true);
      if (selectedBook) {
        await axiosInstance.put(`/library/books/${selectedBook._id}`, formData);
        toast.success('Book updated successfully');
        setShowEditModal(false);
      } else {
        await axiosInstance.post('/library/books', formData);
        toast.success('Book added successfully');
        setShowAddModal(false);
      }
      resetForm();
      fetchBooks();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this book?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, proceed!'
    });
    if (!result.isConfirmed) return;
    try {
      await axiosInstance.delete(`/library/books/${id}`);
      toast.success('Book deleted successfully');
      fetchBooks();
    } catch (error) {
      toast.error('Failed to delete book');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsSubmitting(true);
        const bstr = event.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        if (jsonData.length === 0) {
          toast.error('Excel file is empty');
          return;
        }

        const res = await axiosInstance.post('/library/books/import', { books: jsonData });
        toast.success(res.data.message || 'Books imported successfully');
        fetchBooks();
      } catch (error) {
        console.error('Import error:', error);
        toast.error(error.response?.data?.message || 'Failed to import books');
      } finally {
        setIsSubmitting(false);
        e.target.value = null;
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    if (books.length === 0) {
      toast.error('No books to export');
      return;
    }

    const exportData = books.map(book => ({
      'Accession No': book.accessionNo,
      'Book Title': book.title,
      'Author': book.author,
      'ISBN': book.isbn || '',
      'Category': book.category,
      'Total Copies': book.totalCopies,
      'Available Copies': book.availableCopies,
      'Price': book.price || 0,
      'Shelf': book.shelf || '',
      'Rack': book.rack || '',
      'Status': book.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Books');
    XLSX.writeFile(workbook, 'Library_Books_Inventory.xlsx');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter'] relative">
      
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
              <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <FileSpreadsheet size={15} className="text-gray-500" /> Export Excel
              </button>
              <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                <FileSpreadsheet size={15} className="text-gray-500" /> 
                {isSubmitting ? 'Importing...' : 'Excel Import'}
                <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} disabled={isSubmitting} />
              </label>
              <button onClick={handleAddBookClick} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
                <span>+</span> New Book
              </button>
            </div>
          </div>

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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <SkeletonLoader type="table" rows={5} cols={5} />
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
                      <td className="py-4 px-6 text-[13px] text-center font-bold">
                        <span className={item.availableCopies === 0 ? 'text-red-500' : 'text-green-600'}>{item.availableCopies || 0}</span> / {item.totalCopies || 0}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${item.status === 'Available' ? 'bg-green-50 text-green-700 border border-green-100' : item.status === 'Lost' || item.status === 'Damaged' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}`}>                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 flex gap-2">
                        {checkPermission('Edit Book') && (
                          <button onClick={() => handleEditBookClick(item)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Edit"><Edit2 size={15} /></button>
                        )}
                        {checkPermission('Delete Book') && (
                          <button onClick={() => handleDeleteBook(item._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Delete"><Trash2 size={15} /></button>
                        )}
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
                Showing page {page} of {totalPages}
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
            </div>
            <div className="space-y-3">
              {categoriesList.length > 0 ? (
                categoriesList.map((cat, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-[13px] font-bold text-gray-800">{cat.name || cat._id}</h4>
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 bg-gray-200/50 px-2 py-0.5 rounded">{cat.count} Books</span>
                  </div>
                ))
              ) : (
                <div className="text-[13px] text-gray-500 p-4 text-center border border-dashed border-gray-200 rounded-lg">
                  {loading ? 'Loading categories...' : 'No categories found. Add books to generate categories.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Book Form Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-800">{showAddModal ? 'Add New Book' : 'Edit Book'}</h2>
              <button onClick={() => {setShowAddModal(false); setShowEditModal(false);}} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Accession No *</label>
                  <input type="text" value={formData.accessionNo} onChange={(e) => setFormData({...formData, accessionNo: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0A6C54] focus:ring-1 focus:ring-[#0A6C54]" placeholder="e.g. ACC-1001" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">ISBN</label>
                  <input type="text" value={formData.isbn} onChange={(e) => setFormData({...formData, isbn: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0A6C54] focus:ring-1 focus:ring-[#0A6C54]" placeholder="e.g. 978-3-16-148410-0" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Book Title *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0A6C54] focus:ring-1 focus:ring-[#0A6C54]" placeholder="Enter title" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Author *</label>
                  <input type="text" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0A6C54] focus:ring-1 focus:ring-[#0A6C54]" placeholder="Enter author" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0A6C54] focus:ring-1 focus:ring-[#0A6C54]">
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Total Copies *</label>
                  <input type="number" min="1" value={formData.totalCopies} onChange={(e) => setFormData({...formData, totalCopies: Number(e.target.value)})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0A6C54] focus:ring-1 focus:ring-[#0A6C54]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Shelf</label>
                  <input type="text" value={formData.shelf} onChange={(e) => setFormData({...formData, shelf: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0A6C54] focus:ring-1 focus:ring-[#0A6C54]" placeholder="e.g. Shelf A" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Rack</label>
                  <input type="text" value={formData.rack} onChange={(e) => setFormData({...formData, rack: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0A6C54] focus:ring-1 focus:ring-[#0A6C54]" placeholder="e.g. Rack 1" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹)</label>
                  <input type="number" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0A6C54] focus:ring-1 focus:ring-[#0A6C54]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0A6C54] focus:ring-1 focus:ring-[#0A6C54]">
                    <option value="Available">Available</option>
                    <option value="Issued">Issued</option>
                    <option value="Lost">Lost</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl sticky bottom-0">
              <button onClick={() => {setShowAddModal(false); setShowEditModal(false);}} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveBook} disabled={isSubmitting} className="px-5 py-2 text-sm font-bold text-white bg-[#0A6C54] hover:bg-[#085a46] rounded-lg transition-colors disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Save Book'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
