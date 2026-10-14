import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import MyComplaints from './pages/MyComplaints';
import ComplaintDetails from './pages/ComplaintDetails';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminAllComplaints from './pages/AdminAllComplaints';
import AssignStaffPage from './pages/AssignStaffPage';

// Staff Pages
import StaffDashboard from './pages/StaffDashboard';
import StaffComplaintDetails from './pages/StaffComplaintDetails';

// Error Pages
import { AccessDeniedPage, NotFoundPage } from './pages/ErrorPages';

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute roles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/submit-complaint"
            element={
              <ProtectedRoute roles={['STUDENT']}>
                <SubmitComplaint />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/my-complaints"
            element={
              <ProtectedRoute roles={['STUDENT']}>
                <MyComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/complaints/:id"
            element={
              <ProtectedRoute roles={['STUDENT']}>
                <ComplaintDetails />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminAllComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints/:id"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AssignStaffPage />
              </ProtectedRoute>
            }
          />

          {/* Staff Routes */}
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute roles={['STAFF']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/complaints"
            element={
              <ProtectedRoute roles={['STAFF']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/complaints/:id"
            element={
              <ProtectedRoute roles={['STAFF']}>
                <StaffComplaintDetails />
              </ProtectedRoute>
            }
          />

          {/* Error & Fallback Routes */}
          <Route path="/access-denied" element={<AccessDeniedPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>© 2026 Smart Complaint Management System — AI-Powered Campus Issue Resolution</p>
      </footer>
    </div>
  );
}
