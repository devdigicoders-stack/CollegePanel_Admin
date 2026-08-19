import SkeletonLoader from '../../components/SkeletonLoader';
const fs = require('fs');

let content = fs.readFileSync('d:/Desktop/DCT_CLG_CRM/admin/src/pages/Roles.jsx', 'utf8');

const states_target =   const [availablePermissions, setAvailablePermissions] = useState([]);

  useEffect(() => {
    fetchRoles();
    fetchAvailablePermissions();
  }, []);;

const states_replacement =   const [availablePermissions, setAvailablePermissions] = useState([]);
  
  // Tab State
  const [activeTab, setActiveTab] = useState('roles'); // 'roles' or 'users'
  
  // Users (Employees) State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const userSearchTimeout = useRef(null);

  useEffect(() => {
    fetchRoles();
    fetchAvailablePermissions();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    if (userSearchTimeout.current) clearTimeout(userSearchTimeout.current);
    userSearchTimeout.current = setTimeout(() => {
      if (activeTab === 'users') fetchUsers();
    }, 400);
  }, [userSearchQuery]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await axiosInstance.get('/employees', { params: { search: userSearchQuery, limit: 100 } });
      setUsers(res.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleAssignRole = async (userId, roleName) => {
    try {
      await axiosInstance.put(\/employees/\\, { role: roleName });
      toast.success('Role assigned successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to assign role');
    }
  };;

content = content.replace(states_target, states_replacement);

const layout_target =   return (
    <div className="flex flex-col h-full font-['Inter']">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[20px] font-bold text-sidebar font-['Outfit']">Roles & Permissions</h2>
          <p className="text-[13px] text-gray-500 mt-1">Manage system roles and their permissions</p>
        </div>
        <button
          onClick={handleAddRole}
          className="flex items-center gap-2 bg-sidebar text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold hover:bg-sidebar/90 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add New Role
        </button>
      </div>

      <div className="mb-6">;

const layout_replacement =   return (
    <div className="flex flex-col h-full font-['Inter'] bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[20px] font-bold text-sidebar font-['Outfit']">Users & Roles</h2>
          <p className="text-[13px] text-gray-500 mt-1">Manage system roles and assign them to users</p>
        </div>
        {activeTab === 'roles' && (
          <button
            onClick={handleAddRole}
            className="flex items-center gap-2 bg-sidebar text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold hover:bg-sidebar/90 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Add New Role
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-6">
        <button
          onClick={() => setActiveTab('roles')}
          className={\px-6 py-3 text-[14px] font-semibold transition-all relative \\}
        >
          Manage Roles
          {activeTab === 'roles' && (
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={\px-6 py-3 text-[14px] font-semibold transition-all relative \\}
        >
          Assign Roles to Users
          {activeTab === 'users' && (
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></div>
          )}
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search users by name or ID..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-sidebar focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {usersLoading ? (
              <SkeletonLoader type="table" rows={5} cols={4} />
            ) : (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#F9FAFB] border-y border-gray-100">
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800">User Details</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800">Department</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800">Status</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[250px]">Assigned Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-gray-900">{user.name}</p>
                            <p className="text-[11px] text-gray-500">{user.empId || user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[13px] text-gray-600">{user.department || 'N/A'}</td>
                      <td className="py-4 px-6">
                        <span className={\inline-block px-2.5 py-1 rounded-full text-[11px] font-bold \\}>
                          {user.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={user.role || ''}
                          onChange={(e) => handleAssignRole(user._id, e.target.value)}
                          className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                        >
                          <option value="">Select Role...</option>
                          {roles.map(r => (
                            <option key={r._id} value={r.name}>{r.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-500 text-[13px]">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="mb-6">;

content = content.replace(layout_target, layout_replacement);

const closing_target =       {showRoleModal && (
const closing_replacement =       </div>
      )}

      {showRoleModal && (

// Only replace the first occurrence of showRoleModal from the end to be safe, but let's do a simple replace since it only appears near the end once (for the modal rendering)
content = content.replace(closing_target, closing_replacement);

fs.writeFileSync('d:/Desktop/DCT_CLG_CRM/admin/src/pages/Roles.jsx', content, 'utf8');
console.log('Roles.jsx successfully patched via node');
