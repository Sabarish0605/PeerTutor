import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/StudentDashboard';
import TutorDashboard from './pages/TutorDashboard';
import TutorProfileSetup from './pages/TutorProfileSetup';
import UserProfile from './pages/UserProfile';
import MyLearning from './pages/MyLearning';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import TutorOnboarding from './pages/TutorOnboarding';
import DashboardLayout from './components/DashboardLayout';
import ProfileSettings from './pages/ProfileSettings';
import Subscriptions from './pages/Subscriptions';

function App() {
  return (
      <AuthProvider>
        <Router>

              <Toaster position="bottom-right" />

              <main className="flex-grow w-full">
                <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route element={<DashboardLayout />}>
                    <Route path="/profile/:id" element={<UserProfile />} />

                    {/* Protected Routes — all authenticated users */}
                    <Route path="/my-learning" element={
                        <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                            <MyLearning />
                        </ProtectedRoute>
                    } />
                    <Route path="/discover" element={
                        <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                            <StudentDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/subscriptions" element={
                        <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                            <Subscriptions />
                        </ProtectedRoute>
                    } />

                    {/* Creator routes — open to all users (P2P platform) */}
                    <Route path="/tutor/onboarding" element={
                        <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                            <TutorOnboarding />
                        </ProtectedRoute>
                    } />
                    <Route path="/onboard" element={
                        <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                            <TutorOnboarding />
                        </ProtectedRoute>
                    } />
                    {/* Studio (Profile, Subscribers, and Courses Hub) */}
                    <Route path="/studio" element={
                        <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                            <TutorDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/tutor/dashboard" element={
                        <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                            <TutorDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/tutor/setup" element={
                        <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                            <TutorProfileSetup />
                        </ProtectedRoute>
                    } />

                    <Route path="/profile/settings" element={
                        <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                            <ProfileSettings />
                        </ProtectedRoute>
                    } />
                </Route>
                </Routes>
              </main>

        </Router>
      </AuthProvider>
  );
}

export default App;