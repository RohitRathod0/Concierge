import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import { OnboardingWizard } from './components/profile/OnboardingWizard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Header from './components/common/Header';
import ChatWidget from './components/chat/ChatWidget';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import OnboardingReminder from './components/profile/OnboardingReminder';

// Phase A: New Pages
import LandingPage from './pages/LandingPage';
import ETPrimePage from './pages/ETPrimePage';
import MasterclassPage from './pages/MasterclassPage';
import CourseDetailPage from './pages/CourseDetailPage';
import IPOPage from './pages/IPOPage';
import IPODetailPage from './pages/IPODetailPage';
import MarketsPage from './pages/MarketsPage';
import FinancialServicesPage from './pages/FinancialServicesPage';
import PortfolioPage from './pages/PortfolioPage';
import NewsPage from './pages/NewsPage';
import { ProfileDashboard as ProfilePage } from './components/profile/ProfileDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <OnboardingReminder />
        
        <main className="flex-1 flex flex-col relative">
          <ErrorBoundary>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/et-prime" element={<ETPrimePage />} />
            <Route path="/masterclass" element={<MasterclassPage />} />
            <Route path="/masterclass/:courseId" element={<CourseDetailPage />} />
            <Route path="/markets" element={<MarketsPage />} />
            <Route path="/ipo" element={<IPOPage />} />
            <Route path="/ipo/:ipoId" element={<IPODetailPage />} />
            <Route path="/financial-services" element={<FinancialServicesPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:articleId" element={<NewsPage />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/onboarding" element={<OnboardingWizard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
            </Route>
          </Routes>
          </ErrorBoundary>
        </main>

        <ChatWidget />
      </div>
    </Router>
  );
}

export default App;
