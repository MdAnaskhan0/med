// src/config/SidebarMenuConfig.js

export const sidebarMenu = {
  admin: [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Profile', path: '/user/profile' },
    {
      name: 'Users',
      path: '/admin/users',
      submenu: [
        { name: 'Create User', path: '/admin/create-user' },
        { name: 'All Users', path: '/admin/users' },
      ]
    },
    {
      name: 'Teams',
      path: '/admin/teams',
      submenu: [
        { name: 'All Teams', path: '/admin/teams' },
      ]
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      submenu: [
        { name: 'Movement Reports', path: '/admin/movement-reports' },
      ]
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      submenu: [
        { name: 'Company Names', path: '/admin/companynames' },
        { name: 'Departments', path: '/admin/departments' },
        { name: 'Branch Names', path: '/admin/branchs' },
        { name: 'Designations', path: '/admin/designations' },
        { name: 'Visiting Status', path: '/admin/visitingstatus' },
        { name: 'Parties', path: '/admin/parties' },
      ]
    }
  ],
  manager: [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Profile', path: '/user/profile' },
    {
      name: 'Users',
      path: '/manager/users',
      submenu: [
        { name: 'All Users', path: '/admin/users' },
      ]
    },
    {
      name: 'Reports',
      path: '/manager/reports',
      submenu: [
        { name: 'All Movement Reports', path: '/movement-reports' },
      ]
    }
  ],
  accounce: [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Profile', path: '/user/profile' },
    { name: 'All Movement Reports', path: '/movement-reports' },
  ],
  teamleader: [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Profile', path: '/user/profile' },
    { name: 'Movement Status', path: '/user/upload-report' },
    { name: 'Movement Report', path: '/user/UserReport' },
    {
      name: 'Team',
      path: '/team/team',
      submenu: [
        { name: 'Manage Team', path: '/team/manage-team' },
        { name: 'View Report', path: '/team/team-report' },
        { name: 'Team Massage', path: '/team/team-massage' },
      ]
    }
  ],
  user: [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Profile', path: '/user/profile' },
    { name: 'Movement Status', path: '/user/upload-report' },
    { name: 'Movement Report', path: '/user/UserReport' },
    {
      name: 'Team',
      path: '/user/team',
      submenu: [
        { name: 'Team Massage', path: '/user/team-massage' },
      ]
    }
  ],
};
