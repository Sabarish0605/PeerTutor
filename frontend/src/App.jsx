import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TutorDashboard from './pages/TutorDashboard';
import TutorProfileSetup from './pages/TutorProfileSetup';
import Home from './pages/Home';
import TutorProfile from './pages/TutorProfile';
function App() {
  return (
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

            {/* Updated Navbar with functional links */}
            <nav className="bg-blue-600 text-white p-4 shadow-md">
              <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="font-bold text-xl">PeerTutor</Link>
                <div className="space-x-4">
                  <Link to="/login" className="hover:text-blue-200">Login</Link>
                  <Link to="/register" className="bg-white text-blue-600 px-4 py-1 rounded-full font-medium hover:bg-blue-50">Sign Up</Link>
                </div>
              </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tutor/:id" element={<TutorProfile />} />

                {/* Point to our new actual components! */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/tutor/dashboard" element={<TutorDashboard />} />
                <Route path="/tutor/setup" element={<TutorProfileSetup />} />
              </Routes>
            </main>

          </div>
        </Router>
      </AuthProvider>
  );
}

export default App;