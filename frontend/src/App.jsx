// ==========================================
// Ana Uygulama Bileşeni
// Rota yapılandırması ve sayfa düzeni (layout)
// ==========================================

import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// ---- Sayfa Bileşenleri ----
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
import PaymentPage from './pages/member/PaymentPage';

// ---- Sayfa Başlıkları ----
const sayfaBasliklari = {
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
    '/member/payment': 'Güvenli Ödeme',
};

// ---- Sayfa Düzeni (Sidebar + Navbar + İçerik) ----
function AppLayout({ children }) {
    const [menuAcik, setMenuAcik] = useState(false);
    const konum = useLocation();
    const baslik = sayfaBasliklari[konum.pathname] || 'GymPro';

    return (
        <div className="duzen">
            <Sidebar isOpen={menuAcik} onClose={() => setMenuAcik(false)} />
            <Navbar title={baslik} onMenuClick={() => setMenuAcik(!menuAcik)} />
            <main className="ana-icerik">
                {children}
            </main>
            {menuAcik && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} onClick={() => setMenuAcik(false)} />}
        </div>
    );
}

// ---- Ana Uygulama ----
function App() {
    const { user, loading } = useAuth();

    // Yükleniyor durumu
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#12122b' }}>
                <div className="yukleme" style={{ width: '48px', height: '48px' }}></div>
            </div>
        );
    }

    return (
        <Routes>
            {/* ---- Kimlik Doğrulama Sayfaları ---- */}
            <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to={`/${user.role}`} /> : <Register />} />

            {/* ---- Yönetici Rotaları ---- */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AppLayout><UserManagement /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/packages" element={<ProtectedRoute roles={['admin']}><AppLayout><PackageManagement /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AppLayout><Reports /></AppLayout></ProtectedRoute>} />

            {/* ---- Antrenör Rotaları ---- */}
            <Route path="/trainer" element={<ProtectedRoute roles={['trainer']}><AppLayout><TrainerDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/trainer/programs" element={<ProtectedRoute roles={['trainer']}><AppLayout><ProgramCreate /></AppLayout></ProtectedRoute>} />
            <Route path="/trainer/attendance" element={<ProtectedRoute roles={['trainer']}><AppLayout><AttendanceTracker /></AppLayout></ProtectedRoute>} />

            {/* ---- Üye Rotaları ---- */}
            <Route path="/member" element={<ProtectedRoute roles={['member']}><AppLayout><MemberDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/member/packages" element={<ProtectedRoute roles={['member']}><AppLayout><BuyPackage /></AppLayout></ProtectedRoute>} />
            <Route path="/member/classes" element={<ProtectedRoute roles={['member']}><AppLayout><MyClasses /></AppLayout></ProtectedRoute>} />
            <Route path="/member/payments" element={<ProtectedRoute roles={['member']}><AppLayout><PaymentHistory /></AppLayout></ProtectedRoute>} />
            <Route path="/member/payment/:packageId" element={<ProtectedRoute roles={['member']}><AppLayout><PaymentPage /></AppLayout></ProtectedRoute>} />

            {/* ---- Varsayılan Yönlendirme ---- */}
            <Route path="*" element={<Navigate to={user ? `/${user.role}` : '/login'} />} />
        </Routes>
    );
}

export default App;
