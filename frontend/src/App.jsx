import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import BottomTabBar from './components/BottomTabBar';
import PageTransition from './components/PageTransition';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import Privacy from './pages/Privacy';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmotionRecorder, { EmotionHistory } from './pages/EmotionRecorder';
import { AchievementNew, AchievementList } from './pages/Achievements';
import { ConflictNew, ConflictList, ConflictStats } from './pages/Conflicts';
import BreathingTool from './pages/BreathingTool';
import { CognitiveReframeNew, CognitiveReframeList } from './pages/CognitiveReframe';
import WeeklyReport from './pages/WeeklyReport';

function AppRoutes() {
  const { authChecked } = useApp();
  if (!authChecked) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf8f3' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #7fb5a0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
  const location = useLocation();
  return (
    <>
      <PageTransition>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/emotions" element={<EmotionRecorder />} />
          <Route path="/emotions/history" element={<EmotionHistory />} />
          <Route path="/achievements" element={<AchievementList />} />
          <Route path="/achievements/new" element={<AchievementNew />} />
          <Route path="/conflicts" element={<ConflictList />} />
          <Route path="/conflicts/new" element={<ConflictNew />} />
          <Route path="/conflicts/stats" element={<ConflictStats />} />
          <Route path="/breathing" element={<BreathingTool />} />
          <Route path="/cognitive/new" element={<CognitiveReframeNew />} />
          <Route path="/cognitive/history" element={<CognitiveReframeList />} />
          <Route path="/report" element={<WeeklyReport />} />
        </Routes>
      </PageTransition>
      <BottomTabBar />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </ToastProvider>
  );
}
