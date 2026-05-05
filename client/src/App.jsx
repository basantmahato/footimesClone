import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Tournament from './pages/Tournament';
import TournamentDetails from './pages/TournamentDetails';
import MatchDetails from './pages/MatchDetails';
import News from './pages/News';
import NewsArticle from './pages/NewsArticle';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminMatchesPage from './pages/AdminMatchesPage';
import AdminNewsForm from './pages/AdminNewsForm';
import AdminAddFixture from './pages/AdminAddFixture';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LiveMatches from './components/LiveMatches';
import Bottom from './components/BottomNav';
import AdminTournamentPage from './pages/AdminTournamentPage';
import AdminLiveUpdatePage from './pages/AdminLiveUpdatePage';
import Notification from './components/Notification';

function App() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Bottom />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tournament" element={<Tournament />} />
        <Route path="/live-matches" element={<LiveMatches />} />
        <Route path="/tournament/:id" element={<TournamentDetails />} />
        <Route path="/match/:id" element={<MatchDetails />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsArticle />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/notification" element={<Notification />} />
        <Route
          path="/admin/tournaments"
          element={
            <ProtectedRoute>
              <AdminTournamentPage />
            </ProtectedRoute>
          }/>
        <Route
          path="/admin/update-live/:fixtureId"
          element={
            <ProtectedRoute>
              <AdminLiveUpdatePage />
            </ProtectedRoute>
          }/>
        <Route
          path="/admin/fixture"
          element={
            <ProtectedRoute>
              <AdminAddFixture />
            </ProtectedRoute>
          }/>
        <Route
          path="/admin/matches"
          element={
            <ProtectedRoute>
              <AdminMatchesPage />
            </ProtectedRoute>
          }/>
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/news"
          element={
            <ProtectedRoute>
              <AdminNewsForm />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;