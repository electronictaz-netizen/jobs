import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import ManagementDashboard from './pages/ManagementDashboard';
import DriverDashboard from './pages/DriverDashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/management"
            element={
              <PrivateRoute>
                <ManagementDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/driver"
            element={
              <PrivateRoute>
                <DriverDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;