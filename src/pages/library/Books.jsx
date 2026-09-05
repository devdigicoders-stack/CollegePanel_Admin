import SkeletonLoader from '../../components/SkeletonLoader';
import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import { 
  X, Search, Edit2, Trash2, FileSpreadsheet,
  Package, Bookmark, AlertTriangle, UserCheck, Filter,
  Layers} from 'lucide-react';
import * as XLSX from 'xlsx';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const Books = () => {
  if (!checkPermission('View Books') && !checkPermission('Add Book') && !checkPermission('Edit Book')) {
    return <AccessDenied />;
  }
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';
  const initialTab = searchParams.get('tab') || 'inventory';

  const [activeSubTab, setActiveSubTab] = useState(initialTab);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState(initialFilter);
  const [counts, setCounts] = useState({ all: 0, inventory: 0, issued: 0, outOfStock: 0 });
  const [books, setBooks] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Active Issued Circulation state
  const [issuedTransactions, setIssuedTransactions] = useState([]);
  const [issuedLoading, setIssuedLoading] = useState(false);
  const [issuedSearch, setIssuedSearch] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showIssuedModal, setShowIssuedModal] = useState(false);
  const [selectedIssuedBook, setSelectedIssuedBook] = useState(null);
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
  }, [page, limit, search, filterCategory, stockFilter]);

  useEffect(() => {
    if (activeSubTab === 'issued') {
      fetchActiveIssues();
    }
  }, [activeSubTab, issuedSearch]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterCategory && filterCategory !== 'All') params.append('category', filterCategory);
      if (stockFilter && stockFilter !== 'all') params.append('stockFilter', stockFilter);
      params.append('page', page);
      params.append('limit', limit);
      
      const response = await axiosInstance.get(`/library/books?${params.toString()}`);
      setBooks(response.data.books || response.data);
      if (response.data.counts) {
        setCounts(response.data.counts);
      }
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

  const fetchActiveIssues = async () => {
    try {
      setIssuedLoading(true);
      const params = new URLSearchParams();
      params.append('status', 'Issued');
      if (issuedSearch) params.append('search', issuedSearch);
      const response = await axiosInstance.get(`/library/transactions?${params.toString()}`);
      const txns = response.data || [];
      const active = txns.filter(t => t.status === 'Issued' || t.status === 'Renewed' || t.status === 'Overdue');
      setIssuedTransactions(active);
    } catch (error) {
      console.error('Error fetching active issues:', error);
      toast.error('Failed to load active issues');
    } finally {
      setIssuedLoading(false);
    }
  };

  const handleQuickReturn = async (txn) => {
    const result = await Swal.fire({
      title: 'Confirm Return',
      text: `Return "${txn.bookId?.title || 'this book'}" borrowed by ${txn.memberName || txn.studentId?.studentName || 'Student'}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Return Book',
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280'
    });
    if (!result.isConfirmed) return;

    try {
      await axiosInstance.post('/library/return', {
        transactionId: txn._id,
        condition: 'Good',
        fineAmount: 0,
        remarks: 'Quick return from inventory catalog'
      });
      toast.success('Book returned successfully');
      fetchBooks();
      if (activeSubTab === 'issued') fetchActiveIssues();
      setShowIssuedModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return book');
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col font-['Inter'] relative">
      
      {/* Subtabs Bar */}
      <div className="flex border-b border-gray-100 px-6 pt-2 overflow-x-auto">
        <button
          onClick={() => { setActiveSubTab('inventory'); setPage(1); }}
          className={`px-6 py-4 text-[14px] font-semibold relative whitespace-nowrap flex items-center gap-2 transition-colors ${
            activeSubTab === 'inventory' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers size={16} />
          <span>Book Inventory</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
            activeSubTab === 'inventory' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'
          }`}>
            {counts.all}
          </span>
          {activeSubTab === 'inventory' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-md"></div>}
        </button>

        <button
          onClick={() => { setActiveSubTab('issued'); fetchActiveIssues(); }}
          className={`px-6 py-4 text-[14px] font-semibold relative whitespace-nowrap flex items-center gap-2 transition-colors ${
            activeSubTab === 'issued' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Bookmark size={16} />
          <span>Issued Circulation</span>
          <span className="bg-orange-100 text-orange-700 text-[11px] px-2 py-0.5 rounded-full font-bold">
            {counts.issued}
          </span>
          {activeSubTab === 'issued' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-md"></div>}
        </button>

        <button
          onClick={() => setActiveSubTab('categories')}
          className={`px-6 py-4 text-[14px] font-semibold relative whitespace-nowrap flex items-center gap-2 transition-colors ${
            activeSubTab === 'categories' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span>Categories & Setup</span>
          {activeSubTab === 'categories' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-md"></div>}
        </button>
      </div>

      {activeSubTab === 'inventory' ? (
        <>
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-[16px] font-bold text-gray-800">Book Inventory Catalog</h2>
              <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Add, edit, track and filter available library stock and active issues</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <FileSpreadsheet size={15} className="text-gray-500" /> Export Excel
              </button>
              <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                <FileSpreadsheet size={15} className="text-gray-500" /> 
                {isSubmitting ? 'Importing...' : 'Excel Import'}
                <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} disabled={isSubmitting} />
              </label>
              <button onClick={handleAddBookClick} className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors shadow-sm">
                <span>+</span> New Book
              </button>
            </div>
          </div>

          {/* Quick Dynamic Stock Filter Pills */}
          <div className="px-6 pt-4 pb-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2.5 flex-wrap">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <Filter size={13} /> Filter:
            </span>

            <button
              onClick={() => { setStockFilter('all'); setPage(1); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all shadow-sm cursor-pointer ${
                stockFilter === 'all'
                  ? 'bg-primary text-white ring-2 ring-primary/20'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>All Books</span>
              <span className={`px-2 py-0.2 rounded-full text-[11px] font-bold ${
                stockFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
              }`}>
                {counts.all}
              </span>
            </button>

            <button
              onClick={() => { setStockFilter('inventory'); setPage(1); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all shadow-sm cursor-pointer ${
                stockFilter === 'inventory'
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/30'
                  : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              <Package size={14} className={stockFilter === 'inventory' ? 'text-white' : 'text-emerald-600'} />
              <span>In Inventory (Available)</span>
              <span className={`px-2 py-0.2 rounded-full text-[11px] font-bold ${
                stockFilter === 'inventory' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {counts.inventory}
              </span>
            </button>

            <button
              onClick={() => { setStockFilter('issued'); setPage(1); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all shadow-sm cursor-pointer ${
                stockFilter === 'issued'
                  ? 'bg-orange-600 text-white ring-2 ring-orange-500/30'
                  : 'bg-white text-orange-700 hover:bg-orange-50 border border-orange-200'
              }`}
            >
              <Bookmark size={14} className={stockFilter === 'issued' ? 'text-white' : 'text-orange-600'} />
              <span>Issued Books</span>
              <span className={`px-2 py-0.2 rounded-full text-[11px] font-bold ${
                stockFilter === 'issued' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-800'
              }`}>
                {counts.issued}
              </span>
            </button>

            {counts.outOfStock > 0 && (
              <button
                onClick={() => { setStockFilter('out_of_stock'); setPage(1); }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all shadow-sm cursor-pointer ${
                  stockFilter === 'out_of_stock'
                    ? 'bg-red-600 text-white ring-2 ring-red-500/30'
                    : 'bg-white text-red-700 hover:bg-red-50 border border-red-200'
                }`}
              >
                <AlertTriangle size={14} className={stockFilter === 'out_of_stock' ? 'text-white' : 'text-red-600'} />
                <span>Out of Stock</span>
                <span className={`px-2 py-0.2 rounded-full text-[11px] font-bold ${
                  stockFilter === 'out_of_stock' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'
                }`}>
                  {counts.outOfStock}
                </span>
              </button>
            )}
          </div>

          {/* Search and Dropdowns Filter Row */}
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap items-center">
            <div className="flex-1 min-w-[260px] w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by title, author or accession number..." 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary bg-white"
              />
            </div>

            <div className="w-full md:w-auto flex gap-3 flex-wrap">
              <select 
                value={filterCategory} 
                onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select 
                value={stockFilter} 
                onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}
                className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="all">All Stock Status</option>
                <option value="inventory">In Inventory (Available)</option>
                <option value="issued">Issued Books (Borrowed)</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="lost_damaged">Lost / Damaged</option>
              </select>

              {(stockFilter !== 'all' || filterCategory !== 'All' || search) && (
                <button
                  onClick={() => { setStockFilter('all'); setFilterCategory('All'); setSearch(''); setPage(1); }}
                  className="text-[12px] text-gray-500 hover:text-gray-800 font-semibold underline px-2 py-2 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <SkeletonLoader type="table" rows={5} cols={5} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Accession No</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Book Title</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Author</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-gray-800">ISBN</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Category</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Copies (Avail / Total)</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Stock Status</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(item => (
                    <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 text-[13px] font-semibold text-primary whitespace-nowrap">{item.accessionNo}</td>
                      <td className="py-4 px-6 text-[13px] text-gray-800 font-bold min-w-[220px]">
                        <div className="line-clamp-2">{item.title}</div>
                        {item.shelf && <span className="text-[11px] text-gray-400 font-normal whitespace-nowrap">Location: {item.shelf} {item.rack ? `- ${item.rack}` : ''}</span>}
                      </td>
                      <td className="py-4 px-6 text-[13px] text-gray-600 font-medium whitespace-nowrap">{item.author}</td>
                      <td className="py-4 px-6 text-[13px] text-gray-500 font-medium whitespace-nowrap">{item.isbn || '—'}</td>
                      <td className="py-4 px-6 text-[13px] text-gray-600 whitespace-nowrap">{item.category}</td>
                      <td className="py-4 px-6 text-[13px] text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1">
                          <div>
                            <span className={item.availableCopies === 0 ? 'text-red-500 font-bold' : 'text-emerald-600 font-bold'}>
                              {item.availableCopies || 0}
                            </span>
                            <span className="text-gray-400 font-normal"> / {item.totalCopies || 0}</span>
                          </div>
                          {item.issuedCopies > 0 && (
                            <button
                              onClick={() => { setSelectedIssuedBook(item); setShowIssuedModal(true); }}
                              className="text-[10px] bg-orange-50 text-orange-700 hover:bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-200 flex items-center gap-1 font-bold transition-colors cursor-pointer"
                              title="Click to view borrower details"
                            >
                              <Bookmark size={10} />
                              {item.issuedCopies} Issued
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {item.status === 'Lost' || item.status === 'Damaged' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-100">
                            {item.status}
                          </span>
                        ) : item.availableCopies === item.totalCopies ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            In Inventory
                          </span>
                        ) : item.availableCopies > 0 ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            Partially Issued
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-100 flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            Fully Issued
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.issuedCopies > 0 && (
                            <button
                              onClick={() => { setSelectedIssuedBook(item); setShowIssuedModal(true); }}
                              className="p-1.5 hover:bg-orange-50 rounded-lg text-orange-600 transition-colors cursor-pointer"
                              title="View Borrowers"
                            >
                              <UserCheck size={16} />
                            </button>
                          )}
                          {checkPermission('Edit Book') && (
                            <button onClick={() => handleEditBookClick(item)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors cursor-pointer" title="Edit"><Edit2 size={15} /></button>
                          )}
                          {checkPermission('Delete Book') && (
                            <button onClick={() => handleDeleteBook(item._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors cursor-pointer" title="Delete"><Trash2 size={15} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {books.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
                  <Package size={36} className="text-gray-300" />
                  <p className="text-sm font-medium">No books matching the selected filters.</p>
                </div>
              )}
            </div>
          )}

          {books.length > 0 && (
            <div className="p-6 border-t border-gray-100 flex justify-between items-center">
              <span className="text-[13px] text-gray-500 flex items-center gap-3">
                <span>Showing page {page} of {totalPages}</span>
                <select 
                  value={limit} 
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="bg-gray-50 border border-gray-200 text-gray-700 py-1 px-2 rounded-md text-[12px] focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-[13px] border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                >
                  Previous
                </button>
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-[13px] border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : activeSubTab === 'issued' ? (
        <div className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-[16px] font-bold text-gray-800">Active Issued Circulation</h2>
              <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Track all books currently borrowed by students, faculty and staff</p>
            </div>
            <div className="w-full md:w-80 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search borrower or book title..."
                value={issuedSearch}
                onChange={(e) => setIssuedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary bg-white"
              />
            </div>
          </div>

          {issuedLoading ? (
            <div className="py-12 flex items-center justify-center">
              <SkeletonLoader type="table" rows={5} cols={6} />
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[12px] font-bold text-gray-700">
                    <th className="py-3.5 px-5">Txn ID</th>
                    <th className="py-3.5 px-5">Book Details</th>
                    <th className="py-3.5 px-5">Borrower</th>
                    <th className="py-3.5 px-5">Issue Date</th>
                    <th className="py-3.5 px-5">Due Date</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedTransactions.length > 0 ? (
                    issuedTransactions.map(txn => {
                      const isOverdue = new Date() > new Date(txn.dueDate);
                      return (
                        <tr key={txn._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-[13px]">
                          <td className="py-3.5 px-5 font-semibold text-primary whitespace-nowrap">{txn.transactionId}</td>
                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <div className="font-bold text-gray-800 line-clamp-1">{txn.bookId?.title || 'Unknown Book'}</div>
                            <span className="text-[11px] text-gray-400">Acc No: {txn.bookId?.accessionNo || '—'}</span>
                          </td>
                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <div className="font-bold text-gray-800">
                              {txn.memberName || (txn.studentId ? `${txn.studentId.firstName} ${txn.studentId.lastName || ''}`.trim() : 'Student')}
                            </div>
                            <span className="text-[11px] text-gray-500">Roll: {txn.studentId?.enrollmentNo || txn.studentId?.studentId || 'N/A'}</span>
                          </td>
                          <td className="py-3.5 px-5 text-gray-600 whitespace-nowrap">{new Date(txn.issueDate).toLocaleDateString()}</td>
                          <td className="py-3.5 px-5 font-semibold whitespace-nowrap">
                            <span className={isOverdue ? 'text-red-600' : 'text-gray-700'}>
                              {new Date(txn.dueDate).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              isOverdue ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-orange-50 text-orange-700 border border-orange-200'
                            }`}>
                              {isOverdue ? 'Overdue' : 'Issued'}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleQuickReturn(txn)}
                              className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
                            >
                              Return Book
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-gray-400 text-sm">
                        <Bookmark size={32} className="mx-auto mb-2 opacity-50" />
                        No active issued circulation records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
                  <input type="text" value={formData.accessionNo} onChange={(e) => setFormData({...formData, accessionNo: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g. ACC-1001" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">ISBN</label>
                  <input type="text" value={formData.isbn} onChange={(e) => setFormData({...formData, isbn: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g. 978-3-16-148410-0" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Book Title *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Enter title" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Author *</label>
                  <input type="text" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Enter author" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Total Copies *</label>
                  <input type="number" min="1" value={formData.totalCopies} onChange={(e) => setFormData({...formData, totalCopies: Number(e.target.value)})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Shelf</label>
                  <input type="text" value={formData.shelf} onChange={(e) => setFormData({...formData, shelf: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g. Shelf A" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Rack</label>
                  <input type="text" value={formData.rack} onChange={(e) => setFormData({...formData, rack: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g. Rack 1" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹)</label>
                  <input type="number" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
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
              <button onClick={handleSaveBook} disabled={isSubmitting} className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Save Book'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Borrowers Modal */}
      {showIssuedModal && selectedIssuedBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <Bookmark size={18} className="text-orange-500" />
                  Active Borrowers for "{selectedIssuedBook.title}"
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Accession No: <span className="font-semibold text-primary">{selectedIssuedBook.accessionNo}</span> • Issued: <span className="font-semibold text-orange-600">{selectedIssuedBook.issuedCopies} Copies</span>
                </p>
              </div>
              <button onClick={() => setShowIssuedModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              {selectedIssuedBook.activeIssues && selectedIssuedBook.activeIssues.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-700 uppercase">
                        <th className="py-3 px-4">Borrower</th>
                        <th className="py-3 px-4">ID / Roll</th>
                        <th className="py-3 px-4">Issue Date</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedIssuedBook.activeIssues.map((issue, i) => {
                        const isOverdue = new Date() > new Date(issue.dueDate);
                        return (
                          <tr key={issue._id || i} className="border-b border-gray-50 text-[13px]">
                            <td className="py-3 px-4 font-semibold text-gray-800">
                              {issue.memberName}
                              <span className="block text-[11px] text-gray-400 font-normal">{issue.memberType || 'Student'}</span>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{issue.enrollmentNo || '—'}</td>
                            <td className="py-3 px-4 text-gray-600">{new Date(issue.issueDate).toLocaleDateString()}</td>
                            <td className="py-3 px-4 font-medium">
                              <span className={isOverdue ? 'text-red-600 font-bold' : 'text-gray-700'}>
                                {new Date(issue.dueDate).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                isOverdue ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-orange-50 text-orange-700 border border-orange-200'
                              }`}>
                                {isOverdue ? 'Overdue' : 'Issued'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleQuickReturn(issue)}
                                className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
                              >
                                Return
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No active borrowers found for this book in transactions.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowIssuedModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
