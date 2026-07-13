import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import PageLayout from './components/layout/PageLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import TripDetail from './pages/TripDetail';
import NotFound from './pages/NotFound';
import CustomCursor from './components/ui/CustomCursor';
import CommandPalette from './components/ui/CommandPalette';

function App() {
  return (
    <>
      <CustomCursor />
      <CommandPalette />
      <Toaster 
        position="top-right"
        toastOptions={{
          className: '!bg-dark-800 !text-white !border !border-white/10',
          duration: 3000,
          style: {
            backdropFilter: 'blur(10px)',
            background: 'rgba(30, 41, 59, 0.8)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PageLayout><Landing /></PageLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<PageLayout><Dashboard /></PageLayout>} />
          <Route path="/plan/new" element={<PageLayout><CreateTrip /></PageLayout>} />
          <Route path="/plan/:id" element={<PageLayout><TripDetail /></PageLayout>} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<PageLayout><NotFound /></PageLayout>} />
      </Routes>
    </>
  );
}

export default App;
