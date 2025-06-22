import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from '../components/PrivateRoute';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Sidebar from '../components/Sidebar/Sidebar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../auth/AuthContext';

import Home from '../pages/Home';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/roles/user/Profile';
// Admin
import CreateUser from '../pages/roles/admin/CreateUser';
import Users from '../pages/roles/admin/Users';
import UserProfile from '../pages/roles/admin/UserProfile';
import Departments from '../pages/roles/admin/Settings/Departments';
import Branchs from '../pages/roles/admin/Settings/Branchs';
import Designations from '../pages/roles/admin/Settings/Designations';
import VisitingStatus from '../pages/roles/admin/Settings/VisitingStatus';
import CreateTeam from '../pages/roles/admin/Teams/CreateTeam';
import Teams from '../pages/roles/admin/Teams/Teams';
import TeamDetails from '../pages/roles/admin/Teams/TeamDetails';
import Companies from '../pages/roles/admin/Settings/Companies';
import Parties from '../pages/roles/admin/Settings/Parties';

// Manager
import AllMovementReports from '../pages/roles/manager/MovementReports';
import UserProfileNoEdit from '../pages/roles/manager/UserProfile';
// Team Leader
import ManageTeam from '../pages/roles/teamLeader/ManageTeam';
import TeamReport from '../pages/roles/teamLeader/TeamReport';
// User
import UploadReportUser from '../pages/roles/user/UploadReportUser';
import UserReport from '../pages/roles/user/UserReport';

// Team
import TeamMassage from '../components/TeamMassage/TeamMassage';

// Permission wrapper component
const PermissionRoute = ({ path, element, requiredPermission }) => {
  const { user } = useAuth();
  
  // If no specific permission required, just render the element
  if (!requiredPermission) return element;
  
  // Check if user has permission for this path
  const hasPermission = user?.permissions?.[path] === 1;
  
  return hasPermission ? element : <Navigate to="/unauthorized" replace />;
};

export default function AppRoutes() {
  return (
    <>
      <Header />
      <Routes>
        {/* Public Home Route (with Login Form) */}
        <Route path="/" element={<Home />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute allowedRoles={['admin', 'manager', 'accounce', 'teamLeader', 'user']} />}>
          <Route
            path="*"
            element={
              <>
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 p-4 min-h-[80vh] bg-white overflow-hidden">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      
                      {/* Admin */}
                      <Route 
                        path="/admin/create-user" 
                        element={
                          <PermissionRoute 
                            path="/admin/create-user" 
                            element={<CreateUser />} 
                            requiredPermission 
                          />
                        } 
                      />
                      <Route 
                        path="/admin/Users" 
                        element={
                          <PermissionRoute 
                            path="/admin/Users" 
                            element={<Users />} 
                            requiredPermission 
                          />
                        } 
                      />
                      <Route 
                        path="/admin/user-profile/:userID" 
                        element={
                          <PermissionRoute 
                            path="/admin/user-profile" 
                            element={<UserProfile />} 
                            requiredPermission 
                          />
                        } 
                      />
                      <Route 
                        path="/admin/movement-reports" 
                        element={
                          <PermissionRoute 
                            path="/admin/movement-reports" 
                            element={<AllMovementReports />} 
                            requiredPermission 
                          />
                        } 
                      />
                      <Route 
                        path="/admin/departments" 
                        element={
                          <PermissionRoute 
                            path="/admin/departments" 
                            element={<Departments />} 
                            requiredPermission 
                          />
                        } 
                      />
                      <Route 
                        path="/admin/branchs" 
                        element={
                          <PermissionRoute 
                            path="/admin/branchs" 
                            element={<Branchs />} 
                            requiredPermission 
                          />
                        } 
                      />
                      <Route 
                        path="/admin/designations" 
                        element={
                          <PermissionRoute 
                            path="/admin/designations" 
                            element={<Designations />} 
                            requiredPermission 
                          />
                        } 
                      />
                      <Route 
                        path="/admin/visitingstatus" 
                        element={
                          <PermissionRoute 
                            path="/admin/visitingstatus" 
                            element={<VisitingStatus />} 
                            requiredPermission 
                          />
                        } 
                      />
                      <Route 
                        path="/admin/teams/create-team" 
                        element={
                          <PermissionRoute 
                            path="/admin/teams/create-team" 
                            element={<CreateTeam />} 
                            requiredPermission 
                          />
                        } 
                      />
                      <Route 
                        path="/admin/teams" 
                        element={
                          <PermissionRoute 
                            path="/admin/teams" 
                            element={<Teams />} 
                            requiredPermission 
                          />
                        } 
                      />
                      <Route 
                        path="/team/:teamID" 
                        element={
                          <PermissionRoute 
                            path="/team" 
                            element={<TeamDetails />} 
                            requiredPermission 
                          />
                        } 
                      />
                      <Route 
                        path="/admin/companynames" 
                        element={
                          <PermissionRoute 
                            path="/admin/companynames" 
                            element={<Companies />} 
                            requiredPermission 
                          />
                        } 
                      />
                      <Route 
                        path="/admin/parties" 
                        element={
                          <PermissionRoute 
                            path="/admin/parties" 
                            element={<Parties />} 
                            requiredPermission 
                          />
                        } 
                      />

                      {/* Manager */}
                      <Route 
                        path="/movement-reports" 
                        element={
                          <PermissionRoute 
                            path="/movement-reports" 
                            element={<AllMovementReports />} 
                            requiredPermission 
                          />
                        } 
                      />
                      <Route 
                        path="/manager/user-profile/:userID" 
                        element={
                          <PermissionRoute 
                            path="/manager/user-profile" 
                            element={<UserProfileNoEdit />} 
                            requiredPermission 
                          />
                        } 
                      />

                      {/* Team Leader */}
                      <Route 
                        path="team/manage-team" 
                        element={
                          <PermissionRoute 
                            path="/team/manage-team" 
                            element={<ManageTeam />} 
                            requiredPermission 
                          />
                        }
                      />
                      <Route 
                        path="team/team-report" 
                        element={
                          <PermissionRoute 
                            path="/team/team-report" 
                            element={<TeamReport />} 
                            requiredPermission 
                          />
                        }
                      />
                      <Route 
                        path="team/team-massage" 
                        element={
                          <PermissionRoute 
                            path="/team/team-massage" 
                            element={<TeamMassage />} 
                            requiredPermission 
                          />
                        }
                      />

                      {/* User */}
                      <Route path="/user/profile" element={<Profile />} />
                      <Route 
                        path="/user/upload-report" 
                        element={
                          <PermissionRoute 
                            path="/user/upload-report" 
                            element={<UploadReportUser />} 
                            requiredPermission 
                          />
                        } 
                      />
                      <Route 
                        path="/user/UserReport" 
                        element={
                          <PermissionRoute 
                            path="/user/UserReport" 
                            element={<UserReport />} 
                            requiredPermission 
                          />
                        } 
                      />
                      <Route 
                        path="/user/team-massage" 
                        element={
                          <PermissionRoute 
                            path="/user/team-massage" 
                            element={<TeamMassage />} 
                            requiredPermission 
                          />
                        } 
                      />

                      {/* Not Found */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
                <ToastContainer position="bottom-right" autoClose={3000} />
              </>
            }
          />
        </Route>
      </Routes>
      <Footer />
    </>
  );
}