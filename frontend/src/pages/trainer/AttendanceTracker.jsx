// ==========================================
// Devam Takibi Sayfası (Antrenör)
// Üyelerin giriş/çıkış yoklamasını yönetir
// ==========================================

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiUserPlus, FiLogOut } from 'react-icons/fi';

const AttendanceTracker = () => {
    // ---- Durum Değişkenleri ----
    const [uyeler, setUyeler] = useState([]);
    const [yoklama, setYoklama] = useState([]);
    const [secilenTarih, setSecilenTarih] = useState(new Date().toISOString().split('T')[0]);
    const [yukleniyor, setYukleniyor] = useState(true);

    // ---- Üyeleri ve Yoklama Kayıtlarını Getir ----
    useEffect(() => {
        const verileriGetir = async () => {
            try {
                const [uyelerYanit, yoklamaYanit] = await Promise.all([
                    api.get('/trainer/members'),
                    api.get('/trainer/attendance', { params: { date: secilenTarih } })
                ]);
                setUyeler(uyelerYanit.data);
                setYoklama(yoklamaYanit.data);
            } catch (hata) { console.error(hata); }
            setYukleniyor(false);
        };
        verileriGetir();
    }, [secilenTarih]);

    // ---- Giriş Kaydı Oluştur ----
    const girisKaydet = async (uyeId) => {
        try {
            const yanit = await api.post('/trainer/attendance', { userId: uyeId });
            setYoklama([yanit.data, ...yoklama]);
        } catch (hata) { console.error(hata); }
    };

    // ---- Çıkış Kaydı Oluştur ----
    const cikisKaydet = async (id) => {
        try {
            const yanit = await api.put(`/trainer/attendance/${id}/checkout`);
            setYoklama(yoklama.map(k => k._id === id ? yanit.data : k));
        } catch (hata) { console.error(hata); }
    };

    if (yukleniyor) return <div className="yukleme-kaps"><div className="yukleme"></div></div>;

    return (
        <div className="anim-soluk">
            {/* ---- Sayfa Başlığı ve Tarih Seçici ---- */}
            <div className="sayfa-bas">
                <div><h1>Devam Takibi</h1><p>Üye giriş/çıkış kayıtlarını yönetin</p></div>
                <input type="date" className="form-kontrol" style={{ width: 'auto' }} value={secilenTarih} onChange={e => setSecilenTarih(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                {/* ---- Üye Listesi ---- */}
                <div className="kart">
                    <h3 className="bolum-bas">👥 Üyeler</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
                        {uyeler.map(uye => (
                            <div key={uye._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <div>
                                    <div style={{ fontWeight: 500, fontSize: '14px' }}>{uye.name}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{uye.email}</div>
                                </div>
                                <button className="dugme dugme-bas dugme-kuc" onClick={() => girisKaydet(uye._id)}><FiUserPlus /></button>
                            </div>
                        ))}
                        {uyeler.length === 0 && <p style={{ color: '#64748b', fontSize: '14px' }}>Üye bulunamadı</p>}
                    </div>
                </div>

                {/* ---- Yoklama Tablosu ---- */}
                <div className="kart" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <h3 className="bolum-bas" style={{ margin: 0 }}>📋 Bugünkü Kayıtlar ({yoklama.length})</h3>
                    </div>
                    <table className="tablo">
                        <thead><tr><th>Üye</th><th>Giriş</th><th>Çıkış</th><th>İşlem</th></tr></thead>
                        <tbody>
                            {yoklama.map(kayit => (
                                <tr key={kayit._id}>
                                    <td style={{ color: '#f1f5f9', fontWeight: 500 }}>{kayit.user?.name}</td>
                                    <td>{new Date(kayit.checkIn).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>{kayit.checkOut ? new Date(kayit.checkOut).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : <span className="rozet rozet-uyr">Devam ediyor</span>}</td>
                                    <td>{!kayit.checkOut && <button className="dugme dugme-teh dugme-kuc" onClick={() => cikisKaydet(kayit._id)}><FiLogOut /> Çıkış</button>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {yoklama.length === 0 && <div className="bos-durum"><p>Bugün için kayıt yok</p></div>}
                </div>
            </div>
        </div>
    );
};

export default AttendanceTracker;
