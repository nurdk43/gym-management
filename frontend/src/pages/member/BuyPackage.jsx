import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiShoppingCart } from 'react-icons/fi';

const BuyPackage = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try { const res = await api.get('/member/packages'); setPackages(res.data); } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetch();
    }, []);

    const handleBuy = async (pkgId) => {
        setBuying(pkgId);
        try {
            await api.post('/member/enroll', { packageId: pkgId, method: 'card' });
            alert('Paket başarıyla satın alındı! 🎉');
        } catch (err) {
            alert(err.response?.data?.message || 'Bir hata oluştu');
        }
        setBuying(null);
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div className="animate-fade-in">
            <div className="page-header"><div><h1>Paket Satın Al</h1><p>Size uygun paketi seçin</p></div></div>
            <div className="package-grid">
                {packages.map((pkg, i) => (
                    <div key={pkg._id} className="package-card animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                        <h3>{pkg.name}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>{pkg.description || 'Profesyonel spor paketi'}</p>
                        <div className="price">₺{pkg.price?.toLocaleString()} <span>/ {pkg.durationDays} gün</span></div>
                        <ul className="features">
                            <li>{pkg.durationDays} gün süre</li>
                            {pkg.maxClasses > 0 ? <li>{pkg.maxClasses} ders hakkı</li> : <li>Sınırsız ders</li>}
                            <li>Tüm ekipmanlara erişim</li>
                            <li>Kişisel dolap</li>
                        </ul>
                        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleBuy(pkg._id)} disabled={buying === pkg._id}>
                            <FiShoppingCart /> {buying === pkg._id ? 'İşleniyor...' : 'Satın Al'}
                        </button>
                    </div>
                ))}
            </div>
            {packages.length === 0 && <div className="glass-card"><div className="empty-state"><div className="empty-icon">📦</div><h3>Aktif paket yok</h3><p>Henüz satışta olan paket bulunmuyor</p></div></div>}
        </div>
    );
};

export default BuyPackage;
