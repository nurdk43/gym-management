// ==========================================
// Antrenör Dashboard Sayfası
// Antrenörün program ve katılım istatistikleri
// ==========================================

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatsCard from '../../components/StatsCard';
import { FiCalendar, FiUsers, FiCheckSquare, FiActivity } from 'react-icons/fi';

const TrainerDashboard = () => {
    // ---- Durum Değişkenleri ----
    const [istatistikler, setIstatistikler] = useState({});
    const [yukleniyor, setYukleniyor] = useState(true);

    // ---- İstatistikleri API'den Çek ----
    useEffect(() => {
        const istatistikleriGetir = async () => {
            try {
                const yanit = await api.get('/trainer/stats');
                setIstatistikler(yanit.data);
            } catch (hata) { console.error(hata); }
            setYukleniyor(false);
        };
        istatistikleriGetir();
    }, []);

    if (yukleniyor) return <div className="yukleme-kaps"><div className="yukleme"></div></div>;

    return (
        <div className="anim-soluk">
            {/* ---- Sayfa Başlığı ---- */}
            <div className="sayfa-bas"><div><h1>Dashboard</h1><p>Antrenör panelinize hoş geldiniz</p></div></div>

            {/* ---- İstatistik Kartları ---- */}
            <div className="istat-izgara">
                <StatsCard icon={<FiCalendar />} value={istatistikler.totalPrograms || 0} label="Toplam Program" color="mor" delay={0.1} />
                <StatsCard icon={<FiActivity />} value={istatistikler.akPrograms || 0} label="Aktif Program" color="yesil" delay={0.2} />
                <StatsCard icon={<FiCheckSquare />} value={istatistikler.todayAttendance || 0} label="Bugünkü Katılım" color="mavi" delay={0.3} />
                <StatsCard icon={<FiUsers />} value={istatistikler.totalMembers || 0} label="Toplam Üye" color="sari" delay={0.4} />
            </div>

            {/* ---- Hızlı İşlemler ---- */}
            <div className="istat-izgara">
                <div className="kart anim-yukari kademe-3">
                    <h3 className="bolum-bas">🎯 Hızlı İşlemler</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <a href="/trainer/programs" className="dugme dugme-iki" style={{ justifyContent: 'center' }}>Program Oluştur</a>
                        <a href="/trainer/attendance" className="dugme dugme-iki" style={{ justifyContent: 'center' }}>Devam Takibi</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
