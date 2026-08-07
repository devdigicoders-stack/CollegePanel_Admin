import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Link as LinkIcon, Upload, Loader2 } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const StudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [uploadMode, setUploadMode] = useState('link'); // 'link' or 'file'
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    course: '',
    type: 'Document',
    size: '',
    fileUrl: ''
  });

  useEffect(() => {
    fetchMaterials();
    fetchCoursesAndSubjects();
  }, []);

  const fetchCoursesAndSubjects = async () => {
    try {
      const [courseRes, subjectRes] = await Promise.all([
        axiosInstance.get('/academics/courses'),
        axiosInstance.get('/academics/subjects')
      ]);
      setCourses(courseRes.data);
      setSubjects(subjectRes.data);
    } catch (error) {
      console.error('Failed to fetch academics data');
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await axiosInstance.get('/study-materials');
      setMaterials(res.data);
    } catch (error) {
      toast.error('Failed to fetch study materials');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto-fill size
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setFormData(prev => ({ ...prev, size: `${sizeMB} MB` }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let finalFileUrl = formData.fileUrl;

      // Handle file upload if mode is 'file'
      if (uploadMode === 'file') {
        if (!selectedFile) {
          toast.error('Please select a file to upload');
          setUploading(false);
          return;
        }
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        
        const uploadRes = await axiosInstance.post('/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Use full URL to backend, assuming backend handles /uploads
        finalFileUrl = axiosInstance.defaults.baseURL.replace('/api', '') + uploadRes.data.url;
      }

      // Submit data
      const payload = { ...formData, fileUrl: finalFileUrl };
      await axiosInstance.post('/study-materials', payload);
      
      toast.success('Study Material added successfully');
      setShowModal(false);
      resetForm();
      fetchMaterials();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add material');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', subject: '', course: '', type: 'Document', size: '', fileUrl: '' });
    setSelectedFile(null);
    setUploadMode('link');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await axiosInstance.delete(`/study-materials/${id}`);
        toast.success('Material deleted');
        fetchMaterials();
      } catch (error) {
        toast.error('Failed to delete material');
      }
    }
  };

  // Filter subjects based on selected course
  const filteredSubjects = subjects.filter(sub => formData.course ? sub.courseName === formData.course : true);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Study Materials Management</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Upload notes, PDFs, and video links for students</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-[#0A6C54] hover:bg-[#085a46] text-white px-4 py-2.5 sm:py-2 rounded-xl text-[13px] font-semibold transition-colors flex justify-center sm:justify-start items-center gap-2 whitespace-nowrap shadow-sm"
        >
          <Plus size={16} /> Add Material
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map(mat => (
            <div key={mat._id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow relative">
              <button onClick={() => handleDelete(mat._id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                <Trash2 size={16} />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-[14px]">{mat.title}</h4>
                  <p className="text-[12px] text-gray-500">{mat.type} • {mat.size}</p>
                </div>
              </div>
              <div className="space-y-2 text-[12px] text-gray-600">
                <p><span className="font-semibold text-gray-700">Course:</span> {mat.course}</p>
                <p><span className="font-semibold text-gray-700">Subject:</span> {mat.subject}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50">
                <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-[#0A6C54] text-[13px] font-semibold transition-colors">
                  <LinkIcon size={14} /> View File
                </a>
              </div>
            </div>
          ))}
          {materials.length === 0 && (
            <div className="col-span-full py-10 text-center text-gray-500 text-[13px]">
              No study materials found. Click "Add Material" to upload one.
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Add Study Material</h3>
              <button onClick={() => {setShowModal(false); resetForm();}} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1">Title</label>
                <input required type="text" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54]" 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Chapter 1 Notes" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">Course/Branch</label>
                  <select required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54]" 
                    value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})}>
                    <option value="">Select Course</option>
                    {courses.map(c => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">Subject</label>
                  <select required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54]" 
                    value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                    <option value="">Select Subject</option>
                    {filteredSubjects.map(s => (
                      <option key={s._id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">Type</label>
                  <select required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54]" 
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="Document">Document (PDF/Doc)</option>
                    <option value="Video">Video Link</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">Size (Optional)</label>
                  <input type="text" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54]" 
                    value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} placeholder="e.g. 2.5 MB" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-2">Upload Method</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input type="radio" name="uploadMode" checked={uploadMode === 'file'} onChange={() => setUploadMode('file')} className="text-[#0A6C54] focus:ring-[#0A6C54]" />
                    Upload File
                  </label>
                  <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input type="radio" name="uploadMode" checked={uploadMode === 'link'} onChange={() => setUploadMode('link')} className="text-[#0A6C54] focus:ring-[#0A6C54]" />
                    Provide URL Link
                  </label>
                </div>
              </div>

              {uploadMode === 'link' ? (
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">External URL / Google Drive Link</label>
                  <input required type="url" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54]" 
                    value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} placeholder="https://..." />
                </div>
              ) : (
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">Select File</label>
                  <div className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                    <input type="file" required onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4" />
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Upload size={24} className="mb-2 text-gray-400" />
                      <p className="text-[12px] font-medium">{selectedFile ? selectedFile.name : 'Click or drag file to upload'}</p>
                      <p className="text-[10px] mt-1 text-gray-400">PDF, DOC, PPT, MP4 (Max 5MB)</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button disabled={uploading} type="submit" className="w-full flex justify-center items-center gap-2 bg-[#0A6C54] hover:bg-[#085a46] text-white py-2.5 rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : 'Save Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyMaterials;
