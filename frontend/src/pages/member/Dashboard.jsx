// ==========================================
// Üye Dashboard Sayfası
// Üye istatistikleri ve aktif üyelikleri gösterir
// ==========================================

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatsCard from '../../components/StatsCard';
import { FiShoppingCart, FiBookOpen, FiCreditCard } from 'react-icons/fi';

const MemberDashboard = () => {
    // ---- Durum Değişkenleri ----
    const [istatistikler, setIstatistikler] = useState({});
    const [kayitlar, setKayitlar] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(true);

    // ---- Verileri API'den Getir ----
    useEffect(() => {
        const verileriGetir = async () => {
            try {
                const [istatistikYanit, kayitYanit] = await Promise.all([
                    api.get('/member/stats'),
                    api.get('/member/enrollments')
                ]);
                setIstatistikler(istatistikYanit.data);
                setKayitlar(kayitYanit.data);
            } catch (hata) { console.error(hata); }
            setYukleniyor(false);
        };
        verileriGetir();
    }, []);

    if (yukleniyor) return <div className="yukleme-kaps"><div className="yukleme"></div></div>;

    return (
        <div className="anim-soluk">
            {/* ---- Sayfa Başlığı ---- */}
            <div className="sayfa-bas"><div><h1>Dashboard</h1><p>Üye panelinize hoş geldiniz</p></div></div>

            {/* ---- İstatistik Kartları ---- */}
            <div className="istat-izgara">
                <StatsCard icon={<FiShoppingCart />} value={istatistikler.akEnrollments || 0} label="Aktif Üyelik" color="yesil" delay={0.1} />
                <StatsCard icon={<FiBookOpen />} value={istatistikler.myClasses || 0} label="Kayıtlı Ders" color="mavi" delay={0.2} />
                <StatsCard icon={<FiCreditCard />} value={`₺${(istatistikler.totalSpent || 0).toLocaleString()}`} label="Toplam Harcama" color="sari" delay={0.3} />
            </div>

            {/* ---- Aktif Üyelikler ---- */}
            <div className="kart anim-yukari kademe-2">
                <h3 className="bolum-bas">📋 Aktif Üyeliklerim</h3>
                {kayitlar.filter(k => k.status === 'aktif').length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {kayitlar.filter(k => k.status === 'aktif').map(kayit => (
                            <div key={kayit._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '16px' }}>{kayit.package?.name}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                                        {new Date(kayit.startDate).toLocaleDateString('tr-TR')} - {new Date(kayit.endDate).toLocaleDateString('tr-TR')}
                                    </div>
                                </div>
                                <span className="rozet rozet-bas">Aktif</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bos-durum" style={{ padding: '30px' }}><p>Aktif üyeliğiniz bulunmuyor</p></div>
                )}
            </div>

            {/* ---- Hızlı İşlemler ---- */}
            <div className="istat-izgara" style={{ marginTop: '24px' }}>
                <div className="kart anim-yukari kademe-3">
                    <h3 className="bolum-bas">🎯 Hızlı İşlemler</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <a href="/member/packages" className="dugme dugme-iki" style={{ justifyContent: 'center' }}>Paket Satın Al</a>
                        <a href="/member/classes" className="dugme dugme-iki" style={{ justifyContent: 'center' }}>Derslerimi Görüntüle</a>
                        <a href="/member/payments" className="dugme dugme-iki" style={{ justifyContent: 'center' }}>Ödeme Geçmişi</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;
