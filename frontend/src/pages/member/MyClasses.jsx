// ==========================================
// Derslerim Sayfası (Üye)
// Kayıtlı dersler ve tüm dersler sekmeli görünümü
// ==========================================

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiPlus, FiX } from 'react-icons/fi';

const MyClasses = () => {
    // ---- Durum Değişkenleri ----
    const [tumDersler, setTumDersler] = useState([]);
    const [kayitliDersler, setKayitliDersler] = useState([]);
    const [aktifSekme, setAktifSekme] = useState('kayitli');
    const [yukleniyor, setYukleniyor] = useState(true);

    // ---- Verileri API'den Getir ----
    const verileriGetir = async () => {
        try {
            const [tumYanit, kayitliYanit] = await Promise.all([
                api.get('/member/classes'),
                api.get('/member/my-classes')
            ]);
            setTumDersler(tumYanit.data);
            setKayitliDersler(kayitliYanit.data);
        } catch (hata) { console.error(hata); }
        setYukleniyor(false);
    };

    useEffect(() => { verileriGetir(); }, []);

    // ---- Derse Kayıt Ol ----
    const derseKaydol = async (programId) => {
        try {
            await api.post('/member/classes/enroll', { programId });
            alert('Derse başarıyla kaydoldunuz! 🎉');
            verileriGetir();
        } catch (hata) { alert(hata.response?.data?.message || 'Bir hata oluştu'); }
    };

    // ---- Dersten Çık ----
    const derstenCik = async (programId) => {
        if (!confirm('Dersten çıkmak istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/member/classes/${programId}`);
            verileriGetir();
        } catch (hata) { console.error(hata); }
    };

    if (yukleniyor) return <div className="yukleme-kaps"><div className="yukleme"></div></div>;

    return (
        <div className="anim-soluk">
            {/* ---- Sayfa Başlığı ---- */}
            <div className="sayfa-bas"><div><h1>Derslerim</h1><p>Ders kayıt ve iptal işlemleri</p></div></div>

            {/* ---- Sekme Butonları ---- */}
            <div className="aksiyon">
                <button className={`dugme ${aktifSekme === 'kayitli' ? 'dugme-bir' : 'dugme-iki'}`} onClick={() => setAktifSekme('kayitli')}>Kayıtlı Derslerim ({kayitliDersler.length})</button>
                <button className={`dugme ${aktifSekme === 'tum' ? 'dugme-bir' : 'dugme-iki'}`} onClick={() => setAktifSekme('tum')}>Tüm Dersler ({tumDersler.length})</button>
            </div>

            {/* ---- Kayıtlı Dersler Sekmesi ---- */}
            {aktifSekme === 'kayitli' && (
                <div className="paket-izgara">
                    {kayitliDersler.map((ders, i) => (
                        <div key={ders._id} className="kart anim-yukari" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{ders.title}</h3>
                                <span className="rozet rozet-bas">Kayıtlı</span>
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '8px' }}>{ders.description || ''}</p>
                            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#94a3b8' }}>
                                <span>📅 {ders.dayOfWeek} - 🕐 {ders.time}</span>
                                <span>👤 Antrenör: {ders.trainer?.name}</span>
                            </div>
                            <button className="dugme dugme-teh" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }} onClick={() => derstenCik(ders._id)}><FiX /> Dersten Çık</button>
                        </div>
                    ))}
                    {kayitliDersler.length === 0 && <div className="kart" style={{ gridColumn: '1/-1' }}><div className="bos-durum"><div className="bos-ikon">📚</div><h3>Kayıtlı ders yok</h3><p>Tüm dersler sekmesinden derse kaydolun</p></div></div>}
                </div>
            )}

            {/* ---- Tüm Dersler Sekmesi ---- */}
            {aktifSekme === 'tum' && (
                <div className="paket-izgara">
                    {tumDersler.map((ders, i) => {
                        const kayitliMi = kayitliDersler.some(k => k._id === ders._id);
                        const doluMu = ders.enrolledMembers?.length >= ders.maxCapacity;
                        return (
                            <div key={ders._id} className="kart anim-yukari" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{ders.title}</h3>
                                    {doluMu ? <span className="rozet rozet-teh">Dolu</span> : <span className="rozet rozet-blg">{ders.enrolledMembers?.length}/{ders.maxCapacity}</span>}
                                </div>
                                <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '8px' }}>{ders.description || ''}</p>
                                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#94a3b8' }}>
                                    <span>📅 {ders.dayOfWeek} - 🕐 {ders.time}</span>
                                    <span>👤 Antrenör: {ders.trainer?.name}</span>
                                </div>
                                {kayitliMi ? (
                                    <button className="dugme dugme-iki" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }} disabled>✓ Zaten Kayıtlısınız</button>
                                ) : (
                                    <button className="dugme dugme-bir" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }} onClick={() => derseKaydol(ders._id)} disabled={doluMu}><FiPlus /> {doluMu ? 'Kapasite Dolu' : 'Kaydol'}</button>
                                )}
                            </div>
                        );
                    })}
                    {tumDersler.length === 0 && <div className="kart" style={{ gridColumn: '1/-1' }}><div className="bos-durum"><div className="bos-ikon">📚</div><h3>Henüz ders yok</h3><p>Antrenörler tarafından ders oluşturulduğunda burada görünecek</p></div></div>}
                </div>
            )}
        </div>
    );
};

export default MyClasses;
