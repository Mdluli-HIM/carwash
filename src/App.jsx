import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './context/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LogWash from './pages/LogWash';
import ActiveWashes from './pages/ActiveWashes';
import Employees from './pages/Employees';
import Services from './pages/Services';
import History from './pages/History';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import LoyaltyRules from './pages/LoyaltyRules';
import Rewards from './pages/Rewards';
import Attendants from './pages/Attendants';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute adminOnly>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute adminOnly>
                <Employees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendants"
            element={
              <ProtectedRoute adminOnly>
                <Attendants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <ProtectedRoute adminOnly>
                <Services />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute adminOnly>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute adminOnly>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute adminOnly>
                <CustomerDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loyalty-rules"
            element={
              <ProtectedRoute adminOnly>
                <LoyaltyRules />
              </ProtectedRoute>
            }
          />
          <Route
            path="/log-wash"
            element={
              <ProtectedRoute>
                <LogWash />
              </ProtectedRoute>
            }
          />
          <Route
            path="/active-washes"
            element={
              <ProtectedRoute>
                <ActiveWashes />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
