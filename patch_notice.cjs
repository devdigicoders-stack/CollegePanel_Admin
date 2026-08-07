const fs = require('fs');

let content = fs.readFileSync('d:/Desktop/DCT_CLG_CRM/admin/src/pages/Notice.jsx', 'utf-8');

// 1. Add states for dynamic fetching
content = content.replace(
  "const [formLoading, setFormLoading] = useState(false);",
  "const [formLoading, setFormLoading] = useState(false);\n  const [departments, setDepartments] = useState([]);\n  const [courses, setCourses] = useState([]);"
);

// 2. Add useEffect to fetch courses and departments
content = content.replace(
  "useEffect(() => {\n    fetchNotices();\n  }, [pagination.page, filterAudience, filterStatus]);",
  `useEffect(() => {
    fetchNotices();
  }, [pagination.page, filterAudience, filterStatus]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [depRes, courRes] = await Promise.all([
          axiosInstance.get('/academics/departments'),
          axiosInstance.get('/academics/courses')
        ]);
        setDepartments(depRes.data.data || []);
        setCourses(courRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch departments/courses', err);
      }
    };
    fetchOptions();
  }, []);`
);

// 3. Update handleSave to use FormData
const handleSaveOld = `  const handleSave = async () => {
    if (!formData.title || !formData.details || !formData.dateOfPublishing) {
      toast.error('Please fill all required fields');
      return;
    }
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        dateOfPublishing: new Date(formData.dateOfPublishing).toISOString()
      };
      if (isEditing) {
        await axiosInstance.put(\`/notices/\${selectedNotice._id}\`, payload);
        toast.success('Notice updated successfully');
        setShowEditModal(false);
      } else {
        await axiosInstance.post('/notices', payload);
        toast.success('Notice created successfully');
        setShowCreateModal(false);
      }
      resetForm();
      fetchNotices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save notice');
    } finally {
      setFormLoading(false);
    }
  };`;

const handleSaveNew = `  const handleSave = async () => {
    if (!formData.title || !formData.details || !formData.dateOfPublishing) {
      toast.error('Please fill all required fields');
      return;
    }
    setFormLoading(true);
    try {
      const payload = new FormData();
      payload.append('noticeId', formData.noticeId || \`NOT-\${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}\`);
      payload.append('title', formData.title);
      payload.append('targetAudience', formData.targetAudience);
      payload.append('postedBy', formData.postedBy);
      payload.append('postedByRole', formData.postedByRole);
      if (formData.department) payload.append('department', formData.department);
      payload.append('dateOfPublishing', new Date(formData.dateOfPublishing).toISOString());
      payload.append('details', formData.details);
      payload.append('status', formData.status);

      if (formData.attachments && formData.attachments.length > 0) {
        formData.attachments.forEach(file => {
          if (file instanceof File) {
            payload.append('attachments', file);
          }
        });
      }

      if (isEditing) {
        await axiosInstance.put(\`/notices/\${selectedNotice._id}\`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Notice updated successfully');
        setShowEditModal(false);
      } else {
        await axiosInstance.post('/notices', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Notice created successfully');
        setShowCreateModal(false);
      }
      resetForm();
      fetchNotices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save notice');
    } finally {
      setFormLoading(false);
    }
  };`;

content = content.replace(handleSaveOld, handleSaveNew);

// 4. Update the Modals (Create and Edit)
function patchModal(contentStr, modalType) {
  // We need to inject the dynamic department/course dropdowns right after Target Audience
  const targetAudienceOld = `<div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Target Audience *</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="All Students">All Students</option>
                    <option value="All Staff">All Staff</option>
                    <option value="All Parents">All Parents</option>
                    <option value="Specific Department">Specific Department</option>
                    <option value="Specific Course">Specific Course</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Posted By *</label>
                  <input
                    type="text"
                    value={formData.postedBy}
                    onChange={(e) => setFormData({ ...formData, postedBy: e.target.value })}
                    placeholder="e.g., Admin, Principal"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>`;
              
  const targetAudienceNew = `<div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Target Audience *</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value, department: '' })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="All Students">All Students</option>
                    <option value="All Staff">All Staff</option>
                    <option value="All Parents">All Parents</option>
                    <option value="Specific Department">Specific Department</option>
                    <option value="Specific Course">Specific Course</option>
                  </select>
                </div>
                
                {formData.targetAudience === 'Specific Department' ? (
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Select Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                    >
                      <option value="">-- Select Department --</option>
                      {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                ) : formData.targetAudience === 'Specific Course' ? (
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Select Course *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                    >
                      <option value="">-- Select Course --</option>
                      {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Posted By *</label>
                    <input
                      type="text"
                      value={formData.postedBy}
                      onChange={(e) => setFormData({ ...formData, postedBy: e.target.value })}
                      placeholder="e.g., Admin, Principal"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                    />
                  </div>
                )}
              </div>

              {(formData.targetAudience === 'Specific Department' || formData.targetAudience === 'Specific Course') && (
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Posted By *</label>
                  <input
                    type="text"
                    value={formData.postedBy}
                    onChange={(e) => setFormData({ ...formData, postedBy: e.target.value })}
                    placeholder="e.g., Admin, Principal"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              )}`;
              
  return contentStr.replace(targetAudienceOld, targetAudienceNew);
}

content = patchModal(content, 'CREATE');

// For EDIT MODAL, the 'Posted By' input doesn't have a placeholder in the original file, so the regex match is slightly different
const targetAudienceEditOld = `<div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Target Audience *</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="All Students">All Students</option>
                    <option value="All Staff">All Staff</option>
                    <option value="All Parents">All Parents</option>
                    <option value="Specific Department">Specific Department</option>
                    <option value="Specific Course">Specific Course</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Posted By *</label>
                  <input
                    type="text"
                    value={formData.postedBy}
                    onChange={(e) => setFormData({ ...formData, postedBy: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>`;
              
const targetAudienceEditNew = `<div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Target Audience *</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value, department: '' })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="All Students">All Students</option>
                    <option value="All Staff">All Staff</option>
                    <option value="All Parents">All Parents</option>
                    <option value="Specific Department">Specific Department</option>
                    <option value="Specific Course">Specific Course</option>
                  </select>
                </div>
                
                {formData.targetAudience === 'Specific Department' ? (
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Select Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                    >
                      <option value="">-- Select Department --</option>
                      {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                ) : formData.targetAudience === 'Specific Course' ? (
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Select Course *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                    >
                      <option value="">-- Select Course --</option>
                      {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Posted By *</label>
                    <input
                      type="text"
                      value={formData.postedBy}
                      onChange={(e) => setFormData({ ...formData, postedBy: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                    />
                  </div>
                )}
              </div>

              {(formData.targetAudience === 'Specific Department' || formData.targetAudience === 'Specific Course') && (
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Posted By *</label>
                  <input
                    type="text"
                    value={formData.postedBy}
                    onChange={(e) => setFormData({ ...formData, postedBy: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              )}`;

content = content.replace(targetAudienceEditOld, targetAudienceEditNew);

// 5. Add Attachments block to EDIT MODAL
const attachmentsEditOld = `              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Notice Details *</label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] resize-none"
                />
              </div>
            </div>`;

const attachmentsEditNew = `              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Notice Details *</label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] resize-none"
                />
              </div>
              
              {/* Attachments */}
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Attachments (Upload new files to replace old ones)</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-[13px] font-medium text-gray-600">
                    <Paperclip size={16} />
                    Upload Files
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        setFormData(prev => ({
                          ...prev,
                          attachments: files // replacing since we do simple replace on backend
                        }));
                      }}
                    />
                  </label>
                  {formData.attachments && formData.attachments.length > 0 && (
                    <span className="text-[12px] text-gray-500">{formData.attachments.length} file(s) selected</span>
                  )}
                </div>
              </div>
            </div>`;

content = content.replace(attachmentsEditOld, attachmentsEditNew);

// 6. View Modal: show attachments
const viewModalOld = `              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Details</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedNotice.details}</p>
              </div>
            </div>`;

const viewModalNew = `              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Details</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{selectedNotice.details}</p>
              </div>

              {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Paperclip size={16} /> Attachments</h4>
                  <div className="flex flex-col gap-2">
                    {selectedNotice.attachments.map((att, i) => (
                      <a 
                        key={i} 
                        href={\`http://localhost:5000\${att}\`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[13px] text-blue-600 hover:underline flex items-center gap-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100 w-fit"
                      >
                        <BookOpen size={14} /> File {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>`;

content = content.replace(viewModalOld, viewModalNew);

fs.writeFileSync('d:/Desktop/DCT_CLG_CRM/admin/src/pages/Notice.jsx', content, 'utf-8');
console.log("Patched Notice.jsx completely.");
