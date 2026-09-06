import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TutorDashboard from './pages/TutorDashboard';
import TutorProfileSetup from './pages/TutorProfileSetup';
import TutorProfile from './pages/TutorProfile';
import MyLearning from './pages/MyLearning';

function App() {
  return (
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">

            {/* Our new smart Navbar */}
            <Navbar />

            <main className="container mx-auto px-4 py-8 flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* FIXED: Correct JSX syntax for the element prop */}
                <Route path="/my-learning" element={<MyLearning />} />

                {/* Protected Routes */}
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/tutor/dashboard" element={<TutorDashboard />} />
                <Route path="/tutor/setup" element={<TutorProfileSetup />} />
                <Route path="/tutor/:id" element={<TutorProfile />} />

              </Routes>
            </main>

            {/* A simple footer for polish */}
            <footer className="bg-gray-800 text-gray-400 text-center py-6 mt-12 text-sm">
              <p>© 2026 PeerTutor. Built by students, for students.</p>
            </footer>
          </div>
        </Router>
      </AuthProvider>
  );
}

export default App;