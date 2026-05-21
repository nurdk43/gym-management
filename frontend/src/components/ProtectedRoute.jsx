// ==========================================
// Korumalı Rota Bileşeni
// Yetkisiz erişimi engeller, giriş sayfasına yönlendirir
// ==========================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    // ---- Yükleniyor durumu ----
    if (loading) {
        return (
            <div className="yukleme-kaps">
                <div className="yukleme"></div>
            </div>
        );
    }

    // ---- Giriş yapmamış veya yetkisiz kullanıcı ----
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;

    return children;
};

export default ProtectedRoute;
