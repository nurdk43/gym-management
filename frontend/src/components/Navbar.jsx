import { useAuth } from '../context/AuthContext';
import { FiMenu } from 'react-icons/fi';

const Navbar = ({ title, onMenuClick }) => {
    const { user } = useAuth();

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <button className="hamburger" onClick={onMenuClick}>
                    <FiMenu />
                </button>
                <h2>{title}</h2>
            </div>
            <div className="navbar-right">
                <div className="user-info">
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{user?.name}</span>
                    <div className="user-avatar">{getInitials(user?.name)}</div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
