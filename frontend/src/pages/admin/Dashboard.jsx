// ==========================================
// Yönetici Dashboard Sayfası
// Spor salonunun genel istatistiklerini gösterir
// ==========================================

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatsCard from '../../components/StatsCard';
import { FiUsers, FiDollarSign, FiActivity, FiUserCheck } from 'react-icons/fi';

const AdminDashboard = () => {
    // ---- Durum Değişkenleri ----
    const [istatistikler, setIstatistikler] = useState({});
    const [yukleniyor, setYukleniyor] = useState(true);

    // ---- İstatistikleri API'den Çek ----
    useEffect(() => {
        const istatistikleriGetir = async () => {
            try {
                const yanit = await api.get('/admin/stats');
                setIstatistikler(yanit.data);
            } catch (hata) { console.error(hata); }
            setYukleniyor(false);
        };
        istatistikleriGetir();
    }, []);

    // ---- Yükleniyor ----
    if (yukleniyor) return <div className="yukleme-kaps"><div className="yukleme"></div></div>;

    return (
        <div className="anim-soluk">
            {/* ---- Sayfa Başlığı ---- */}
            <div className="sayfa-bas">
                <div>
                    <h1>Dashboard</h1>
                    <p>Spor salonunuzun genel durumu</p>
                </div>
            </div>

            {/* ---- İstatistik Kartları ---- */}
            <div className="istat-izgara">
                <StatsCard icon={<FiUsers />} value={istatistikler.totalMembers || 0} label="Toplam Üye" color="mor" delay={0.1} />
                <StatsCard icon={<FiUserCheck />} value={istatistikler.totalTrainers || 0} label="Antrenör" color="mavi" delay={0.2} />
                <StatsCard icon={<FiActivity />} value={istatistikler.activeEnrollments || 0} label="Aktif Üyelik" color="yesil" delay={0.3} />
                <StatsCard icon={<FiDollarSign />} value={`₺${(istatistikler.totalRevenue || 0).toLocaleString()}`} label="Toplam Gelir" color="sari" delay={0.4} />
            </div>

            {/* ---- Detay Kartları ---- */}
            <div className="istat-izgara">
                {/* Aylık Gelir */}
                <div className="kart anim-yukari kademe-2">
                    <h3 className="bolum-bas">📊 Aylık Gelir</h3>
                    <div style={{ fontSize: '36px', fontWeight: '800', background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ₺{(istatistikler.monthlyRevenue || 0).toLocaleString()}
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>Bu ayki gelir</p>
                </div>

                {/* Hızlı İşlemler */}
                <div className="kart anim-yukari kademe-3">
                    <h3 className="bolum-bas">🎯 Hızlı İşlemler</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <a href="/admin/users" className="dugme dugme-iki" style={{ justifyContent: 'center' }}>Kullanıcı Yönetimi</a>
                        <a href="/admin/packages" className="dugme dugme-iki" style={{ justifyContent: 'center' }}>Paket Yönetimi</a>
                        <a href="/admin/reports" className="dugme dugme-iki" style={{ justifyContent: 'center' }}>Raporları Görüntüle</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
