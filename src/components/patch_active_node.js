const fs = require('fs');

let content = fs.readFileSync('d:/Desktop/DCT_CLG_CRM/admin/src/components/Sidebar.jsx', 'utf8');

const old_useEffect = \  useEffect(() => {
    const activeGroup = menuGroups.find(group => 
      group.items && group.items.some(item => location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/'))
    );
    if (activeGroup && !expandedGroups.includes(activeGroup.name)) {
      setExpandedGroups(prev => [...prev, activeGroup.name]);
    }
  }, [location.pathname]);\;

const new_useEffect = \  useEffect(() => {
    const activeGroup = menuGroups.find(group => 
      group.items && group.items.some(item => {
        if (item.path === '/dashboard' && location.pathname === '/') return true;
        if (item.path !== '/' && item.path !== '/dashboard') {
           return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
        }
        return location.pathname === item.path;
      })
    );
    if (activeGroup && !expandedGroups.includes(activeGroup.name)) {
      setExpandedGroups(prev => [...prev, activeGroup.name]);
    }
  }, [location.pathname]);\;

content = content.replace(old_useEffect, new_useEffect);

const old_isGroupActive = \const isGroupActive = group.items.some(item => location.pathname === item.path);\;
const new_isGroupActive = \const isGroupActive = group.items.some(item => {
            if (item.path === '/dashboard' && location.pathname === '/') return true;
            if (item.path !== '/' && item.path !== '/dashboard') {
               return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            }
            return location.pathname === item.path;
          });\;

content = content.replace(old_isGroupActive, new_isGroupActive);

const old_isActiveMain = \const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');\;
const new_isActiveMain = \const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/') || (item.path !== '/' && item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'));\;
content = content.replace(old_isActiveMain, new_isActiveMain);

const old_isActiveOther = \const isActive = location.pathname === item.path;\;
const new_isActiveOther = \const isActive = location.pathname === item.path || (item.path !== '/' && item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'));\;
content = content.replace(old_isActiveOther, new_isActiveOther); // Note: replace might only replace the first occurrence, which is fine

const old_isItemActive = \const isItemActive = location.pathname === item.path;\;
const new_isItemActive = \const isItemActive = location.pathname === item.path || (item.path !== '/' && item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'));\;
content = content.replace(old_isItemActive, new_isItemActive);

fs.writeFileSync('d:/Desktop/DCT_CLG_CRM/admin/src/components/Sidebar.jsx', content, 'utf8');
console.log('Sidebar active state patched');
