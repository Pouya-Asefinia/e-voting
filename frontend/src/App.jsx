import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ElectionsList from './pages/Admin/ElectionsList';
import ElectionDetail from './pages/Admin/ElectionDetail';
import AnnouncementsList from './pages/Admin/AnnouncementsList';
import AnnouncementEdit from './pages/Admin/AnnouncementEdit';
import ParticipantManager from './pages/Admin/ParticipantManager';
import ElectionEdit from './pages/Admin/ElectionEdit';
// import VotingPage from './pages/VotingPage';
// import Results from './pages/Results';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/elections" element={<ElectionsList />} />
          <Route path="/admin/elections/:id" element={<ElectionDetail />} />
          <Route path="/admin/announcements" element={<AnnouncementsList />} />
          <Route path="/admin/announcements/:id/edit" element={<AnnouncementEdit />} />
          <Route path="/admin/elections/:id/participants" element={<ParticipantManager />} />
          <Route path="/admin/elections/:id/edit" element={<ElectionEdit />} />
          {/* <Route path="/vote/:id" element={<VotingPage />} />
          <Route path="/results/:id" element={<Results />} /> */}
        </Routes>
        <Toaster position="top-center" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;