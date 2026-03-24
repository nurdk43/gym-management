import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import PackageManagement from './pages/admin/PackageManagement';
import Reports from './pages/admin/Reports';
import TrainerDashboard from './pages/trainer/Dashboard';
import ProgramCreate from './pages/trainer/ProgramCreate';
import AttendanceTracker from './pages/trainer/AttendanceTracker';
import MemberDashboard from './pages/member/Dashboard';
import BuyPackage from './pages/member/BuyPackage';
import MyClasses from './pages/member/MyClasses';
import PaymentHistory from './pages/member/PaymentHistory';

const pageTitles = {
    '/admin': 'Dashboard',
    '/admin/users': 'Kullanıcı Yönetimi',
    '/admin/packages': 'Paket Yönetimi',
    '/admin/reports': 'Raporlar',
    '/trainer': 'Dashboard',
    '/trainer/programs': 'Programlar',
    '/trainer/attendance': 'Devam Takibi',
    '/member': 'Dashboard',
    '/member/packages': 'Paket Satın Al',
    '/member/classes': 'Derslerim',
    '/member/payments': 'Ödeme Geçmişi',
};

function AppLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const title = pageTitles[location.pathname] || 'GymPro';

    return (
        <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Navbar title={title} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <main className="main-content">
                {children}
            </main>
            {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} onClick={() => setSidebarOpen(false)} />}
        </div>
    );
}

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
                <div className="spinner" style={{ width: '48px', height: '48px' }}></div>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to={`/${user.role}`} /> : <Register />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AppLayout><UserManagement /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/packages" element={<ProtectedRoute roles={['admin']}><AppLayout><PackageManagement /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AppLayout><Reports /></AppLayout></ProtectedRoute>} />

            {/* Trainer Routes */}
            <Route path="/trainer" element={<ProtectedRoute roles={['trainer']}><AppLayout><TrainerDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/trainer/programs" element={<ProtectedRoute roles={['trainer']}><AppLayout><ProgramCreate /></AppLayout></ProtectedRoute>} />
            <Route path="/trainer/attendance" element={<ProtectedRoute roles={['trainer']}><AppLayout><AttendanceTracker /></AppLayout></ProtectedRoute>} />

            {/* Member Routes */}
            <Route path="/member" element={<ProtectedRoute roles={['member']}><AppLayout><MemberDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/member/packages" element={<ProtectedRoute roles={['member']}><AppLayout><BuyPackage /></AppLayout></ProtectedRoute>} />
            <Route path="/member/classes" element={<ProtectedRoute roles={['member']}><AppLayout><MyClasses /></AppLayout></ProtectedRoute>} />
            <Route path="/member/payments" element={<ProtectedRoute roles={['member']}><AppLayout><PaymentHistory /></AppLayout></ProtectedRoute>} />

            {/* Default */}
            <Route path="*" element={<Navigate to={user ? `/${user.role}` : '/login'} />} />
        </Routes>
    );
}

export default App;
