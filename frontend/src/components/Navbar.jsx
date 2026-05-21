// ==========================================
// Üst Gezinme Çubuğu (Navbar)
// Sayfa başlığı ve kullanıcı bilgisi gösterir
// ==========================================

import { useAuth } from '../context/AuthContext';
import { FiMenu } from 'react-icons/fi';

const Navbar = ({ title, onMenuClick }) => {
    const { user } = useAuth();

    // ---- Ad-Soyadın baş harflerini al ----
    const basHarfleriniAl = (ad) => {
        if (!ad) return '?';
        return ad.split(' ').map(kelime => kelime[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <nav className="ustbar">
            {/* ---- Sol Taraf: Menü Butonu ve Başlık ---- */}
            <div className="ust-sol">
                <button className="menu-btn" onClick={onMenuClick}>
                    <FiMenu />
                </button>
                <h2>{title}</h2>
            </div>

            {/* ---- Sağ Taraf: Kullanıcı Bilgisi ---- */}
            <div className="ust-sag">
                <div className="kullanici-bilgi">
                    <span style={{ fontSize: '14px', color: '#94a3b8' }}>{user?.name}</span>
                    <div className="kullanici-avatar">{basHarfleriniAl(user?.name)}</div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
