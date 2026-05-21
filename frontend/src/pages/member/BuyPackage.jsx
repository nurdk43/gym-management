

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiShoppingCart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const BuyPackage = () => {
    const navigate = useNavigate();
    // ---- Durum Değişkenleri ----
    const [paketler, setPaketler] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(true);

    // ---- Paketleri API'den Getir ----
    useEffect(() => {
        const paketleriGetir = async () => {
            try {
                const yanit = await api.get('/member/packages');
                setPaketler(yanit.data);
            } catch (hata) { console.error(hata); }
            setYukleniyor(false);
        };
        paketleriGetir();
    }, []);

    // ---- Satın Alma İşlemi ----
    const handleBuy = (pkgId) => {
        navigate(`/member/payment/${pkgId}`);
    };

    if (yukleniyor) return <div className="yukleme-spinner"><div className="yuk"></div></div>;

    return (
        <div className="an-sol">
            {/* ---- Sayfa Başlığı ---- */}
            <div className="sayfa-bas"><div><h1>Paket Satın Al</h1><p>Size uygun paketi seçin</p></div></div>

            {/* ---- Paket Kartları ---- */}
            <div className="istat-izgara">
                {paketler.map((paket, i) => (
                    <div key={paket._id} className="kart anim-yukari" style={{ animationDelay: `${i * 0.1}s`, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>{paket.name}</h3>
                        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px', marginBottom: '16px' }}>{paket.description || 'Profesyonel spor paketi'}</p>
                        <div style={{ fontSize: '32px', fontWeight: '700', color: '#6c63ff', marginBottom: '24px' }}>₺{paket.price?.toLocaleString()} <span style={{ fontSize: '14px', color: '#64748b' }}> / {paket.durationDays} gün</span></div>
                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px', flex: 1 }}>
                            <li style={{ padding: '8px 0', color: '#94a3b8', fontSize: '14px' }}>✓ {paket.durationDays} gün süre</li>
                            {paket.maxClasses > 0 ? <li style={{ padding: '8px 0', color: '#94a3b8', fontSize: '14px' }}>✓ {paket.maxClasses} ders hakkı</li> : <li style={{ padding: '8px 0', color: '#94a3b8', fontSize: '14px' }}>✓ Sınırsız ders</li>}
                            <li style={{ padding: '8px 0', color: '#94a3b8', fontSize: '14px' }}>✓ Tüm ekipmanlara erişim</li>
                            <li style={{ padding: '8px 0', color: '#94a3b8', fontSize: '14px' }}>✓ Kişisel dolap</li>
                        </ul>
                        <button
                            className="dugme dugme-bir"
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={() => handleBuy(paket._id)}
                        >
                            <FiShoppingCart /> Satın Al
                        </button>
                    </div>
                ))}
            </div>

            {/* ---- Boş Durum ---- */}
            {paketler.length === 0 && <div className="kart"><div className="bos-durum"><div className="bos-ikon">📦</div><h3>Aktif paket yok</h3><p>Henüz satışta olan paket bulunmuyor</p></div></div>}
        </div>
    );
};

export default BuyPackage;
