import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import JsonUpdater from './components/JsonUpdate/JsonUpdater';
import Home from './pages/Home';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/Private/ProtectedRoute';
import CreateUser from './pages/CreateUser';
import MovementReports from './pages/MovementReports';
import AllUser from './pages/AllUser';
import UserProfile from './pages/UserProfile';
import ProfileAccess from './pages/SettingsPages/ProfileAccess/ProfileAccess';
import CompanyNames from './pages/SettingsPages/CompanyNames';
import Departments from './pages/SettingsPages/Departments';
import Designations from './pages/SettingsPages/Designations';
import BranchNames from './pages/SettingsPages/BranchNames';
import PartyNames from './pages/SettingsPages/PartyNames';
import Roles from './pages/SettingsPages/Roles';
import VisitingStatus from './pages/SettingsPages/VisitingStatus';
import CreateTeams from './pages/TeamManagement/CreateTeams';
import ViewTeams from './pages/TeamManagement/ViewTeams';
import Team from './pages/TeamManagement/TeamDetails';
import ErrorPage from './pages/ErrorPage';
import ActivitiesReport from './pages/ActivitiesReport';
import LogReport from './pages/LogReport';
import TeamChat from './pages/TeamManagement/TeamChat';
import InactivityHandeler from './components/Private/InactivityHandler';
import AdminProfile from './pages/AdminProfile';

const App = () => {
  return (
    <BrowserRouter>
      <InactivityHandeler>
        <Header />
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Home />} />
          <Route path="*" element={<ErrorPage />} />
          <Route
            path="/team/:teamID"
            element={
              <ProtectedRoute>
                <Team />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes Under /dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path='profile' element={<AdminProfile />} />
            <Route path="createuser" element={<CreateUser />} />
            <Route path="alluser" element={<AllUser />} />
            <Route path="user-activity" element={<ActivitiesReport />} />
            <Route path="userprofile/:userID" element={<UserProfile />} />
            <Route path="profile-access/:userID" element={<ProfileAccess />}/>
            <Route path="createteam" element={<CreateTeams />} />
            <Route path="allteam" element={<ViewTeams />} />
            <Route path="team/:teamID" element={<Team />} />
            <Route path="all-team-chat" element={<TeamChat />} />
            <Route path="movementreports" element={<MovementReports />} />
            <Route path="log-report" element={<LogReport />} />
            <Route path="jsonupdater" element={<JsonUpdater />} />
            <Route path="companynames" element={<CompanyNames />} />
            <Route path="branchnames" element={<BranchNames />} />
            <Route path="designations" element={<Designations />} />
            <Route path="departments" element={<Departments />} />
            <Route path="partynames" element={<PartyNames />} />
            <Route path="visitingstatus" element={<VisitingStatus />} />
            <Route path="roles" element={<Roles />} />
          </Route>
        </Routes>
        <Footer />
      </InactivityHandeler>
    </BrowserRouter>
  );
};

export default App;
