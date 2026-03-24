import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiUsers, FiPackage, FiBarChart2, FiCalendar, FiClipboard, FiCheckSquare, FiShoppingCart, FiBookOpen, FiCreditCard, FiLogOut } from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const adminLinks = [
        { to: '/admin', icon: <FiHome />, label: 'Dashboard' },
        { to: '/admin/users', icon: <FiUsers />, label: 'Kullanıcı Yönetimi' },
        { to: '/admin/packages', icon: <FiPackage />, label: 'Paket Yönetimi' },
        { to: '/admin/reports', icon: <FiBarChart2 />, label: 'Raporlar' },
    ];

    const trainerLinks = [
        { to: '/trainer', icon: <FiHome />, label: 'Dashboard' },
        { to: '/trainer/programs', icon: <FiCalendar />, label: 'Programlar' },
        { to: '/trainer/attendance', icon: <FiCheckSquare />, label: 'Devam Takibi' },
    ];

    const memberLinks = [
        { to: '/member', icon: <FiHome />, label: 'Dashboard' },
        { to: '/member/packages', icon: <FiShoppingCart />, label: 'Paket Satın Al' },
        { to: '/member/classes', icon: <FiBookOpen />, label: 'Derslerim' },
        { to: '/member/payments', icon: <FiCreditCard />, label: 'Ödeme Geçmişi' },
    ];

    const links = user?.role === 'admin' ? adminLinks : user?.role === 'trainer' ? trainerLinks : memberLinks;
    const roleLabel = user?.role === 'admin' ? 'Yönetici Paneli' : user?.role === 'trainer' ? 'Antrenör Paneli' : 'Üye Paneli';

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <h2>💪 GymPro</h2>
                <span>{roleLabel}</span>
            </div>
            <nav className="sidebar-nav">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === '/admin' || link.to === '/trainer' || link.to === '/member'}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        onClick={onClose}
                    >
                        <span className="nav-icon">{link.icon}</span>
                        {link.label}
                    </NavLink>
                ))}
            </nav>
            <div className="sidebar-footer">
                <button className="nav-item" onClick={handleLogout}>
                    <span className="nav-icon"><FiLogOut /></span>
                    Çıkış Yap
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
