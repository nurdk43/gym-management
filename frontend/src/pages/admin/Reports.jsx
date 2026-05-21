// ==========================================
// Raporlar Sayfası (Yönetici)
// Gelir ve devam raporlarını tarih aralığına göre gösterir
// ==========================================

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiDollarSign, FiCalendar } from 'react-icons/fi';

const Reports = () => {
    // ---- Durum Değişkenleri ----
    const [aktifSekme, setAktifSekme] = useState('gelir');
    const [gelir, setGelir] = useState({ totalRevenue: 0, payments: [], count: 0 });
    const [devam, setDevam] = useState({ attendance: [], count: 0 });
    const [tarihAralik, setTarihAralik] = useState({ startDate: '', endDate: '' });
    const [yukleniyor, setYukleniyor] = useState(true);
    const [devamLimit, setDevamLimit] = useState(25);

    const raporParametreleri = () => {
        const params = {};
        if (tarihAralik.startDate) params.startDate = tarihAralik.startDate;
        if (tarihAralik.endDate) params.endDate = tarihAralik.endDate;
        return params;
    };

    // ---- Gelir Raporunu Getir ----
    const gelirRaporuGetir = async () => {
        try {
            const yanit = await api.get('/admin/reports/revenue', {
                params: { ...raporParametreleri(), limit: 100 }
            });
            setGelir(yanit.data);
        } catch (hata) { console.error(hata); }
    };

    // ---- Devam Raporunu Getir ----
    const devamRaporuGetir = async () => {
        try {
            const yanit = await api.get('/admin/reports/attendance', {
                params: { ...raporParametreleri(), limit: 150 }
            });
            setDevam(yanit.data);
        } catch (hata) { console.error(hata); }
    };

    // ---- Tarih Değiştiğinde Raporları Yenile ----
    useEffect(() => {
        const raporlariYukle = async () => {
            setYukleniyor(true);
            await Promise.all([gelirRaporuGetir(), devamRaporuGetir()]);
            setYukleniyor(false);
        };
        raporlariYukle();
    }, [tarihAralik]);

    if (yukleniyor) return <div className="yukleme-kaps"><div className="yukleme"></div></div>;

    const devamKayitlari = devam.attendance || [];
    const gosterilenDevam = devamKayitlari.slice(0, devamLimit);
    const trainerDagilim = Object.entries(devam.distribution || {}).sort((a, b) => b[1] - a[1]);
    const yogunlukOzet = trainerDagilim.slice(0, 8);
    const toplamAntrenor = trainerDagilim.length;
    const tekilUye = new Set(devamKayitlari.map((k) => k.user?._id).filter(Boolean)).size;

    return (
        <div className="anim-soluk">
            {/* ---- Sayfa Başlığı ---- */}
            <div className="sayfa-bas">
                <div>
                    <h1>Raporlar</h1>
                    <p>Gelir ve devam raporlarını görüntüleyin</p>
                </div>
            </div>

            {/* ---- Sekme ve Tarih Seçici ---- */}
            <div className="aksiyon">
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className={`dugme ${aktifSekme === 'gelir' ? 'dugme-bir' : 'dugme-iki'}`} onClick={() => setAktifSekme('gelir')}><FiDollarSign /> Gelir Raporu</button>
                    <button className={`dugme ${aktifSekme === 'devam' ? 'dugme-bir' : 'dugme-iki'}`} onClick={() => setAktifSekme('devam')}><FiCalendar /> Devam Raporu</button>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                    <input type="date" className="form-kontrol" style={{ width: 'auto' }} value={tarihAralik.startDate} onChange={e => setTarihAralik({ ...tarihAralik, startDate: e.target.value })} />
                    <input type="date" className="form-kontrol" style={{ width: 'auto' }} value={tarihAralik.endDate} onChange={e => setTarihAralik({ ...tarihAralik, endDate: e.target.value })} />
                </div>
            </div>

            {/* ======== GELİR RAPORU ======== */}
            {aktifSekme === 'gelir' && (
                <div>
                    {/* Özet Kartları */}
                    <div className="istat-izgara" style={{ marginBottom: '24px' }}>
                        <div className="istat-kart">
                            <div className="istat-ikon sari"><FiDollarSign /></div>
                            <div className="istat-bilgi"><h3>₺{gelir.totalRevenue?.toLocaleString()}</h3><p>Toplam Gelir</p></div>
                        </div>
                        <div className="istat-kart">
                            <div className="istat-ikon mavi"><FiCalendar /></div>
                            <div className="istat-bilgi"><h3>{gelir.count}</h3><p>Toplam İşlem</p></div>
                        </div>
                    </div>

                    {/* Paket Bazlı Gelir Dağılımı */}
                    {gelir.distribution && Object.keys(gelir.distribution).length > 0 && (
                        <div className="kart" style={{ marginBottom: '24px', padding: '24px' }}>
                            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Paket Bazlı Gelir Dağılımı</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {Object.entries(gelir.distribution).map(([ad, tutar]) => {
                                    const yuzde = (tutar / gelir.totalRevenue) * 100;
                                    return (
                                        <div key={ad}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
                                                <span>{ad}</span>
                                                <span style={{ fontWeight: 600 }}>₺{tutar.toLocaleString()} ({yuzde.toFixed(1)}%)</span>
                                            </div>
                                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${yuzde}%`, background: 'linear-gradient(90deg, #ffd700, #ffae00)', borderRadius: '4px', transition: 'width 1s ease-in-out' }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Ödeme Tablosu */}
                    <div className="kart" style={{ padding: 0, overflow: 'hidden' }}>
                        <table className="tablo">
                            <thead><tr><th>Üye</th><th>Paket</th><th>Tutar</th><th>Yöntem</th><th>Tarih</th></tr></thead>
                            <tbody>
                                {gelir.payments?.map(odeme => (
                                    <tr key={odeme._id}>
                                        <td style={{ color: '#f1f5f9', fontWeight: 500 }}>{odeme.user?.name}</td>
                                        <td>{odeme.enrollment?.package?.name || '-'}</td>
                                        <td><span style={{ color: '#34d399', fontWeight: 600 }}>₺{odeme.amount?.toLocaleString()}</span></td>
                                        <td><span className="rozet rozet-blg">{odeme.method === 'cash' ? 'Nakit' : odeme.method === 'card' ? 'Kart' : 'Havale'}</span></td>
                                        <td>{new Date(odeme.paidAt).toLocaleDateString('tr-TR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {gelir.payments?.length === 0 && <div className="bos-durum"><p>Ödeme kaydı bulunamadı</p></div>}
                    </div>
                </div>
            )}

            {/* ======== DEVAM RAPORU ======== */}
            {aktifSekme === 'devam' && (
                <div>
                    {/* Özet Kartları */}
                    <div className="istat-izgara" style={{ marginBottom: '24px' }}>
                        <div className="istat-kart">
                            <div className="istat-ikon mor"><FiCalendar /></div>
                            <div className="istat-bilgi"><h3>{devam.count || 0}</h3><p>Toplam Devam Kaydı</p></div>
                        </div>
                        <div className="istat-kart">
                            <div className="istat-ikon mavi"><FiCalendar /></div>
                            <div className="istat-bilgi"><h3>{tekilUye}</h3><p>Tekil Üye</p></div>
                        </div>
                        <div className="istat-kart">
                            <div className="istat-ikon yesil"><FiCalendar /></div>
                            <div className="istat-bilgi"><h3>{toplamAntrenor}</h3><p>Antrenör Sayısı</p></div>
                        </div>
                    </div>

                    {/* Antrenör Bazlı Ders Yoğunluğu */}
                    {trainerDagilim.length > 0 && (
                        <div className="kart" style={{ marginBottom: '24px', padding: '24px' }}>
                            <h3 style={{ marginBottom: '6px', fontSize: '1.1rem' }}>Antrenör Bazlı Ders Yoğunluğu</h3>
                            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>Sadece en yoğun 8 antrenör gösteriliyor</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                                {yogunlukOzet.map(([ad, sayi]) => {
                                    const yuzde = (sayi / devam.count) * 100;
                                    return (
                                        <div key={ad} className="kart" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>{ad}</p>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                                <h4 style={{ fontSize: '1.5rem', margin: 0 }}>{sayi}</h4>
                                                <span style={{ fontSize: '0.8rem', color: '#34d399' }}>kayıt</span>
                                            </div>
                                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${yuzde}%`, background: '#6c63ff', borderRadius: '2px' }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Devam Tablosu */}
                    <div className="kart" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ color: '#94a3b8', fontSize: '13px' }}>
                                {gosterilenDevam.length} / {devamKayitlari.length} kayıt gösteriliyor
                            </p>
                            {devamKayitlari.length > devamLimit && (
                                <button className="dugme dugme-iki dugme-kuc" onClick={() => setDevamLimit((x) => x + 25)}>
                                    +25 Daha Göster
                                </button>
                            )}
                        </div>
                        <table className="tablo">
                            <thead><tr><th>Üye</th><th>Antrenör</th><th>Tarih</th><th>Giriş</th><th>Çıkış</th></tr></thead>
                            <tbody>
                                {gosterilenDevam.map(kayit => (
                                    <tr key={kayit._id}>
                                        <td style={{ color: '#f1f5f9', fontWeight: 500 }}>{kayit.user?.name}</td>
                                        <td>{kayit.trainer?.name || '-'}</td>
                                        <td>{new Date(kayit.date).toLocaleDateString('tr-TR')}</td>
                                        <td>{new Date(kayit.checkIn).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td>{kayit.checkOut ? new Date(kayit.checkOut).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : <span className="rozet rozet-uyr">Devam ediyor</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {devamKayitlari.length === 0 && <div className="bos-durum"><p>Devam kaydı bulunamadı</p></div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
