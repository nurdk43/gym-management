// ==========================================
// Yan Menü (Sidebar)
// Rol bazlı navigasyon menüsü
// ==========================================

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiUsers, FiPackage, FiBarChart2, FiCalendar, FiCheckSquare, FiShoppingCart, FiBookOpen, FiCreditCard, FiLogOut } from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const yonlendir = useNavigate();

    // ---- Çıkış İşlemi ----
    const cikisYap = () => {
        logout();
        yonlendir('/login');
    };

    // ---- Yönetici Menü Linkleri ----
    const yoneticiLinkleri = [
        { to: '/admin', icon: <FiHome />, label: 'Dashboard' },
        { to: '/admin/users', icon: <FiUsers />, label: 'Kullanıcı Yönetimi' },
        { to: '/admin/packages', icon: <FiPackage />, label: 'Paket Yönetimi' },
        { to: '/admin/reports', icon: <FiBarChart2 />, label: 'Raporlar' },
    ];

    // ---- Antrenör Menü Linkleri ----
    const antrenorLinkleri = [
        { to: '/trainer', icon: <FiHome />, label: 'Dashboard' },
        { to: '/trainer/programs', icon: <FiCalendar />, label: 'Programlar' },
        { to: '/trainer/attendance', icon: <FiCheckSquare />, label: 'Devam Takibi' },
    ];

    // ---- Üye Menü Linkleri ----
    const uyeLinkleri = [
        { to: '/member', icon: <FiHome />, label: 'Dashboard' },
        { to: '/member/packages', icon: <FiShoppingCart />, label: 'Paket Satın Al' },
        { to: '/member/classes', icon: <FiBookOpen />, label: 'Derslerim' },
        { to: '/member/payments', icon: <FiCreditCard />, label: 'Ödeme Geçmişi' },
    ];

    // ---- Aktif rol'e göre linkleri seç ----
    const linkler = user?.role === 'admin' ? yoneticiLinkleri : user?.role === 'trainer' ? antrenorLinkleri : uyeLinkleri;
    const panelBaslik = user?.role === 'admin' ? 'Yönetici Paneli' : user?.role === 'trainer' ? 'Antrenör Paneli' : 'Üye Paneli';

    return (
        <aside className={`kenar ${isOpen ? 'acik' : ''}`}>
            {/* ---- Başlık ---- */}
            <div className="kenar-bas">
                <h2>💪 GymPro</h2>
                <span>{panelBaslik}</span>
            </div>

            {/* ---- Navigasyon Linkleri ---- */}
            <nav className="kenar-nav">
                {linkler.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === '/admin' || link.to === '/trainer' || link.to === '/member'}
                        className={({ isActive }) => `nav-oge ${isActive ? 'aktif' : ''}`}
                        onClick={onClose}
                    >
                        <span className="nav-ikon">{link.icon}</span>
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            {/* ---- Çıkış Butonu ---- */}
            <div className="kenar-alt">
                <button className="nav-oge" onClick={cikisYap}>
                    <span className="nav-ikon"><FiLogOut /></span>
                    Çıkış Yap
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
