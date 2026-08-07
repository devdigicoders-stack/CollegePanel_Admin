const fs = require('fs');

let content = fs.readFileSync('d:/Desktop/DCT_CLG_CRM/admin/src/pages/Notice.jsx', 'utf-8');

// 1. Add roles state
content = content.replace(
  "const [courses, setCourses] = useState([]);",
  "const [courses, setCourses] = useState([]);\n  const [roles, setRoles] = useState([]);"
);

// 2. Fetch roles in the existing useEffect
const effectOld = `  useEffect(() => {
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
  }, []);`;

const effectNew = `  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [depRes, courRes, roleRes] = await Promise.all([
          axiosInstance.get('/academics/departments'),
          axiosInstance.get('/academics/courses'),
          axiosInstance.get('/roles/list/all')
        ]);
        setDepartments(depRes.data.data || []);
        setCourses(courRes.data.data || []);
        setRoles(roleRes.data.data || ['Admin', 'Principal', 'HOD', 'Teacher', 'Staff']);
      } catch (err) {
        console.error('Failed to fetch options', err);
      }
    };
    fetchOptions();
  }, []);`;

content = content.replace(effectOld, effectNew);

// 3. Replace dropdown in CREATE MODAL
const createDropdownOld = `                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Posted By Role</label>
                  <select
                    value={formData.postedByRole}
                    onChange={(e) => setFormData({ ...formData, postedByRole: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Principal">Principal</option>
                    <option value="HOD">HOD</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>`;

const dynamicDropdown = `                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Posted By Role</label>
                  <select
                    value={formData.postedByRole}
                    onChange={(e) => setFormData({ ...formData, postedByRole: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="">-- Select Role --</option>
                    {roles.map((r, i) => <option key={i} value={r}>{r}</option>)}
                  </select>
                </div>`;

content = content.replace(createDropdownOld, dynamicDropdown);

// The Edit Modal might not have the "Posted By Role" or I might need to replace it too
// Wait, looking at Notice.jsx edit modal, does it have "Posted By Role"?
// In Notice.jsx lines 496+, the edit modal has "Date of Publishing" and "Status". It doesn't have "Posted By Role" explicitly visible in the grid (it might be missing or under a different section).
// Oh wait, in my earlier view of Notice.jsx, edit modal didn't have "Posted By Role". Let's check if it exists in content.
if (content.indexOf(createDropdownOld) !== -1) {
    content = content.replace(createDropdownOld, dynamicDropdown);
}

fs.writeFileSync('d:/Desktop/DCT_CLG_CRM/admin/src/pages/Notice.jsx', content, 'utf-8');
console.log("Patched Notice.jsx for dynamic roles.");
