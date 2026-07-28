import React, { useState, useEffect } from 'react';
import { Copy, Plus, Search, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Eye, Edit, Trash2, X, AlertTriangle, Lock, Info } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const Teachers = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    department: 'All Departments',
    designation: 'All Designations',
    status: 'All Status',
    search: ''
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Fetch teachers on mount and when filters change
  useEffect(() => {
    fetchTeachers();
    fetchFilterOptions();
  }, [filters, pagination.page]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        department: filters.department === 'All Departments' ? '' : filters.department,
        designation: filters.designation === 'All Designations' ? '' : filters.designation,
        status: filters.status === 'All Status' ? '' : filters.status,
        search: filters.search
      });

      const res = await axiosInstance.get(`/teachers?${params}`);
      setTableData(res.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.total,
        pages: res.data.pages
      }));
    } catch (error) {
      toast.error('Failed to fetch teachers');
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [deptRes, desigRes] = await Promise.all([
        axiosInstance.get('/academics/departments'),
        axiosInstance.get('/designations/list/all')
      ]);
      
      // Academics endpoints return plain array of objects
      const depts = Array.isArray(deptRes.data) ? deptRes.data : (deptRes.data?.data || []);
      
      // Designations /list/all returns {data: ["string1", "string2"]} - array of strings
      const desigs = desigRes.data?.data || [];
      
      console.log('Fetched departments:', depts); // Debug log
      console.log('Fetched designations:', desigs); // Debug log
      
      setDepartments(depts);
      setDesignations(desigs);
    } catch (error) {
      console.error('Failed to fetch filter options', error);
    }
  };

  // Copy to clipboard utility function
  const copyToClipboard = (text) => {
    if (!text) {
      toast.error('No text to copy');
      return;
    }
    
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('Copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy');
      });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setSelectedTeacher(null);
    setFormData({});
    setSelectedImage(null);
    setImagePreview(null);
    setIsCreating(true);
  };

  const handleViewClick = (teacher) => {
    setSelectedTeacher(teacher);
    setShowViewModal(true);
  };

  const handleEditClick = (teacher) => {
    setIsEditing(true);
    setSelectedTeacher(teacher);
    setFormData(teacher);
    setSelectedImage(null);
    setImagePreview(teacher.profileImage ? `http://localhost:5000${teacher.profileImage}` : null);
    setIsCreating(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleDeleteClick = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && key !== 'profileImage' && key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append image if selected
      if (selectedImage) {
        formDataToSend.append('profileImage', selectedImage);
      }

      if (isEditing) {
        await axiosInstance.put(`/teachers/${selectedTeacher._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Teacher updated successfully');
      } else {
        await axiosInstance.post('/teachers', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Teacher created successfully');
      }
      setIsCreating(false);
      setSelectedImage(null);
      setImagePreview(null);
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save teacher');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/teachers/${selectedTeacher._id}`);
      toast.success('Teacher deleted successfully');
      setShowDeleteModal(false);
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete teacher');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'text-green-700 bg-green-50';
      case 'On Leave': return 'text-orange-700 bg-orange-50';
      case 'Inactive': return 'text-red-700 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (isCreating) {
    return (
      <div className="flex flex-col h-full font-['Inter']">
        
        {/* Header for Form */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-gray-800 font-['Outfit']">{isEditing ? 'Edit Teacher' : 'Create New Teacher'}</h2>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Left Column: Personal Information */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 sm:p-8 h-fit">
              <h3 className="text-[15px] font-bold text-[#0A6C54] mb-6">Personal Information</h3>
              
              <div className="space-y-5">
                {/* Profile Image Upload */}
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                    Profile Image
                  </label>
                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-24 h-24 rounded-full object-cover border-2 border-[#0A6C54]"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="px-4 py-2 bg-[#0A6C54] text-white rounded-lg hover:bg-[#085a46] transition-colors text-xs font-semibold">
                        {imagePreview ? 'Change Image' : 'Upload Image'}
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Max size: 5MB. Formats: JPG, PNG, GIF</p>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Full Name<span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter full name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    placeholder="Enter email address"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    disabled={isEditing}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Mobile<span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter mobile number"
                    value={formData.mobile || ''}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Department<span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={formData.department || ''}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] appearance-none bg-white"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id || dept.name} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Date of Birth<span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="date" 
                      value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Gender<span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={formData.gender || ''}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] appearance-none bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Qualification
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., Ph.D., M.Tech"
                    value={formData.qualification || ''}
                    onChange={(e) => handleInputChange('qualification', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Experience
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., 5 Years"
                    value={formData.experience || ''}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Employment Information */}
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 sm:p-8 h-fit">
                <h3 className="text-[15px] font-bold text-gray-800 mb-6">Employment Information</h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Designation<span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={formData.designation || ''}
                      onChange={(e) => handleInputChange('designation', e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] appearance-none bg-white"
                    >
                      <option value="">Select Designation</option>
                      {designations.map(desig => (
                        <option key={desig} value={desig}>{desig}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Date of Joining<span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="date" 
                      value={formData.dateOfJoining ? formData.dateOfJoining.split('T')[0] : ''}
                      onChange={(e) => handleInputChange('dateOfJoining', e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Employee ID
                    </label>
                    <input 
                      type="text" 
                      placeholder="Auto-generated"
                      value={formData.empId || ''}
                      disabled
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-500 bg-gray-50 focus:outline-none disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Pay Scale / Grade
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Level 10"
                      value={formData.payScale || ''}
                      onChange={(e) => handleInputChange('payScale', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Status
                    </label>
                    <select 
                      value={formData.status || 'Active'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] appearance-none bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Login Credentials */}
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 sm:p-8 h-fit">
                <div className="flex items-center gap-2 mb-6">
                  <Lock size={16} className="text-[#0A6C54]" />
                  <h3 className="text-[15px] font-bold text-[#0A6C54]">Login Credentials</h3>
                </div>
                
                <div className="space-y-5">
                  {/* Username field with copy button */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Username
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={formData.username || 'Auto-generated on save'}
                        disabled
                        className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 bg-gray-50 cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(formData.username)}
                        className="px-3 py-2 bg-[#0A6C54] text-white rounded-lg hover:bg-[#085a46] transition-colors"
                        title="Copy username"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Password field with copy button */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Password
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={formData.password || 'Teacher@123 (default)'}
                        disabled
                        className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 bg-gray-50 cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(formData.password || 'Teacher@123')}
                        className="px-3 py-2 bg-[#0A6C54] text-white rounded-lg hover:bg-[#085a46] transition-colors"
                        title="Copy password"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Send to email checkbox (future feature) */}
                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="sendCredentials"
                      disabled
                      className="w-4 h-4 text-[#0A6C54] border-gray-300 rounded focus:ring-[#0A6C54] disabled:cursor-not-allowed"
                    />
                    <label htmlFor="sendCredentials" className="text-[13px] text-gray-500">
                      Send credentials to email (Coming soon)
                    </label>
                  </div>

                  {/* Info message */}
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-[12px] text-blue-700">
                      Username is generated from teacher name (firstname.lastname). Default password is "Teacher@123".
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-4 flex items-center justify-end gap-3 pt-4">
          <button 
            onClick={() => setIsCreating(false)}
            className="px-5 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleFormSubmit}
            className="px-6 py-2.5 text-[13px] font-semibold text-white bg-[#0A6C54] hover:bg-[#085a46] rounded-lg transition-colors shadow-sm"
          >
            {isEditing ? 'Update Teacher' : 'Create Teacher'}
          </button>
        </div>

      </div>
    );
  }

  // --- Table View ---
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Filters Top Row */}
      <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-gray-50">
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select 
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
            >
              <option>All Departments</option>
              {departments.map(dept => (
                <option key={dept._id || dept.name} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative flex-1 md:flex-none">
            <select 
              value={filters.designation}
              onChange={(e) => handleFilterChange('designation', e.target.value)}
              className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
            >
              <option>All Designations</option>
              {designations.map(desig => (
                <option key={desig} value={desig}>{desig}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative flex-1 md:flex-none">
            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>On Leave</option>
              <option>Inactive</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        <button 
          onClick={handleAddClick}
          className="w-full md:w-auto bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Teacher
        </button>
      </div>

      {/* Filters Bottom Row */}
      <div className="px-5 py-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border-b border-gray-50">
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by name or employee ID" 
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-700 py-2 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] placeholder:text-gray-400 shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[#0A6C54] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tableData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 text-sm">No teachers found</p>
          </div>
        ) : (
          <div className="inline-block w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-gray-100">
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 whitespace-nowrap">#</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 whitespace-nowrap">Employee ID</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 whitespace-nowrap">Name</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 whitespace-nowrap">Designation</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 whitespace-nowrap">Department</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 whitespace-nowrap">Mobile</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 whitespace-nowrap">Status</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 whitespace-nowrap text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={row._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-[13px] text-gray-600 whitespace-nowrap">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                    <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54] whitespace-nowrap cursor-pointer hover:underline">{row.empId}</td>
                    <td className="py-4 px-6 text-[13px] text-gray-800 font-medium whitespace-nowrap">{row.name}</td>
                    <td className="py-4 px-6 text-[13px] text-gray-600 whitespace-nowrap">{row.designation}</td>
                    <td className="py-4 px-6 text-[13px] text-gray-600 whitespace-nowrap">{row.department}</td>
                    <td className="py-4 px-6 text-[13px] text-gray-600 whitespace-nowrap">{row.mobile}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide inline-block ${getStatusColor(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                        <button 
                          onClick={() => handleViewClick(row)}
                          className="w-7 h-7 rounded border border-green-100 flex items-center justify-center text-[#0A6C54] hover:bg-green-50 transition-colors flex-shrink-0"
                          title="View Details"
                        >
                          <Eye size={14} strokeWidth={2} />
                        </button>
                        <button 
                          onClick={() => handleEditClick(row)}
                          className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors flex-shrink-0"
                          title="Edit"
                        >
                          <Edit size={14} strokeWidth={2} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(row)}
                          className="w-7 h-7 rounded border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors bg-red-50/50 flex-shrink-0"
                          title="Delete"
                        >
                          <Trash2 size={14} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-5 border-t border-gray-100 gap-4">
        <div className="text-[13px] text-gray-500 font-medium">
          Showing {tableData.length === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          {[...Array(Math.min(3, pagination.pages))].map((_, i) => (
            <button 
              key={i + 1}
              onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
              className={`w-8 h-8 flex items-center justify-center rounded-lg font-semibold text-[13px] transition-colors ${
                pagination.page === i + 1 
                  ? 'bg-[#0A6C54] text-white' 
                  : 'border border-transparent text-gray-600 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          {pagination.pages > 3 && (
            <>
              <div className="w-8 h-8 flex items-center justify-center text-gray-400">
                <MoreHorizontal size={16} />
              </div>
              <button 
                onClick={() => setPagination(prev => ({ ...prev, page: pagination.pages }))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-gray-600 hover:bg-gray-50 font-medium text-[13px] transition-colors"
              >
                {pagination.pages}
              </button>
            </>
          )}
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
            disabled={pagination.page === pagination.pages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-red-50">
              <AlertTriangle size={24} className="text-red-600" />
              <h3 className="text-lg font-bold text-gray-800">Delete Teacher</h3>
            </div>

            <div className="px-6 py-6">
              <p className="text-gray-600 text-sm">Are you sure you want to delete {selectedTeacher.name}? This action cannot be undone.</p>
            </div>

            <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Teacher Modal */}
      {showViewModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#0A6C54] to-[#085a46]">
              <h3 className="text-lg font-bold text-white">Teacher Details</h3>
              <button 
                onClick={() => setShowViewModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Info Card */}
              <div className="bg-gradient-to-br from-[#0A6C54]/5 to-[#0A6C54]/10 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  {selectedTeacher.profileImage ? (
                    <img 
                      src={`http://localhost:5000${selectedTeacher.profileImage}`}
                      alt={selectedTeacher.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#0A6C54]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#0A6C54] flex items-center justify-center text-white text-2xl font-bold">
                      {selectedTeacher.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">{selectedTeacher.name}</h4>
                    <p className="text-sm text-gray-600">{selectedTeacher.designation}</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide inline-block ${getStatusColor(selectedTeacher.status)}`}>
                      {selectedTeacher.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Employee ID:</span>
                    <span className="ml-2 font-semibold text-[#0A6C54]">{selectedTeacher.empId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Department:</span>
                    <span className="ml-2 font-semibold text-gray-800">{selectedTeacher.department}</span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Personal Information */}
                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-2">Personal Information</h5>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                    <p className="text-sm text-gray-800">{selectedTeacher.email}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Mobile</label>
                    <p className="text-sm text-gray-800">{selectedTeacher.mobile}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Date of Birth</label>
                    <p className="text-sm text-gray-800">{selectedTeacher.dateOfBirth ? formatDate(selectedTeacher.dateOfBirth) : 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Gender</label>
                    <p className="text-sm text-gray-800">{selectedTeacher.gender || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Qualification</label>
                    <p className="text-sm text-gray-800">{selectedTeacher.qualification || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Experience</label>
                    <p className="text-sm text-gray-800">{selectedTeacher.experience || 'N/A'}</p>
                  </div>
                </div>

                {/* Employment Information */}
                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-2">Employment Information</h5>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
                    <p className="text-sm text-gray-800">{selectedTeacher.department}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Designation</label>
                    <p className="text-sm text-gray-800">{selectedTeacher.designation}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Date of Joining</label>
                    <p className="text-sm text-gray-800">{selectedTeacher.dateOfJoining ? formatDate(selectedTeacher.dateOfJoining) : 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Pay Scale / Grade</label>
                    <p className="text-sm text-gray-800">{selectedTeacher.payScale || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Employment Status</label>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide inline-block ${getStatusColor(selectedTeacher.status)}`}>
                      {selectedTeacher.status}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Created On</label>
                    <p className="text-sm text-gray-800">{selectedTeacher.createdAt ? formatDate(selectedTeacher.createdAt) : 'N/A'}</p>
                  </div>
                </div>

              </div>

              {/* Login Credentials Section */}
              <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Lock size={18} className="text-purple-600" />
                  <h4 className="text-[14px] font-bold text-gray-800">Login Credentials</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <p className="text-[11px] text-gray-500 mb-1">Username</p>
                      <p className="text-[13px] font-semibold text-gray-800">{selectedTeacher.username || 'N/A'}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(selectedTeacher.username)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy username"
                    >
                      <Copy size={14} className="text-gray-600" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <p className="text-[11px] text-gray-500 mb-1">Password</p>
                      <p className="text-[13px] font-semibold text-gray-800">{selectedTeacher.password || 'N/A'}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(selectedTeacher.password)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy password"
                    >
                      <Copy size={14} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditClick(selectedTeacher);
                }}
                className="px-4 py-2 bg-[#0A6C54] text-white rounded-lg hover:bg-[#085a46] transition-colors font-medium text-sm flex items-center gap-2"
              >
                <Edit size={14} />
                Edit Teacher
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Teachers;
