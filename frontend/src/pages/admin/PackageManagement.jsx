// ==========================================
// Paket Yönetimi Sayfası
// Üyelik paketlerini listeleme, ekleme, düzenleme, silme
// ==========================================

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const PackageManagement = () => {
    // ---- Durum Değişkenleri ----
    const [paketler, setPaketler] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [modalAcik, setModalAcik] = useState(false);
    const [duzenlenecek, setDuzenlenecek] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', price: '', durationDays: '', maxClasses: '', isActive: true });

    const modalKapat = () => {
        setModalAcik(false);
        setDuzenlenecek(null);
    };

    // ---- Paketleri API'den Getir ----
    const paketleriGetir = async () => {
        try {
            const yanit = await api.get('/admin/packages');
            setPaketler(yanit.data);
        } catch (hata) { console.error(hata); }
        setYukleniyor(false);
    };

    useEffect(() => { paketleriGetir(); }, []);

    // ---- Formu Sıfırla ----
    const formuSifirla = () => setForm({ name: '', description: '', price: '', durationDays: '', maxClasses: '', isActive: true });

    // ---- Form Gönder (Oluştur veya Güncelle) ----
    const formGonder = async (e) => {
        e.preventDefault();
        try {
            if (duzenlenecek) {
                const yanit = await api.put(`/admin/packages/${duzenlenecek._id}`, form);
                setPaketler(paketler.map(p => p._id === duzenlenecek._id ? yanit.data : p));
            } else {
                const yanit = await api.post('/admin/packages', form);
                setPaketler([yanit.data, ...paketler]);
            }
            modalKapat();
            formuSifirla();
        } catch (hata) { console.error(hata); }
    };

    // ---- Düzenleme Moduna Geç ----
    const paketDuzenle = (paket) => {
        setDuzenlenecek(paket);
        setForm({ name: paket.name, description: paket.description || '', price: paket.price, durationDays: paket.durationDays, maxClasses: paket.maxClasses || '', isActive: paket.isActive });
        setModalAcik(true);
    };

    // ---- Paket Sil ----
    const paketSil = async (id) => {
        if (!confirm('Bu paketi silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/admin/packages/${id}`);
            setPaketler(paketler.filter(p => p._id !== id));
        } catch (hata) { console.error(hata); }
    };

    // ---- Form Alanı Değişimi ----
    const alanDegistir = (e) => {
        const deger = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: deger });
    };

    if (yukleniyor) return <div className="yukleme-kaps"><div className="yukleme"></div></div>;

    return (
        <div className="anim-soluk">
            {/* ---- Sayfa Başlığı ve Yeni Paket Butonu ---- */}
            <div className="sayfa-bas">
                <div>
                    <h1>Paket Yönetimi</h1>
                    <p>Üyelik paketlerini yönetin</p>
                </div>
                <button className="dugme dugme-bir" onClick={() => { formuSifirla(); setDuzenlenecek(null); setModalAcik(true); }}>
                    <FiPlus /> Yeni Paket
                </button>
            </div>

            {/* ---- Paket Kartları ---- */}
            <div className="paket-izgara">
                {paketler.map((paket, i) => (
                    <div key={paket._id} className="paket-kart anim-yukari" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <h3>{paket.name}</h3>
                            <span className={`rozet ${paket.isActive ? 'rozet-bas' : 'rozet-teh'}`}>{paket.isActive ? 'Aktif' : 'Pasif'}</span>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>{paket.description || 'Açıklama yok'}</p>
                        <div className="ucret">₺{paket.price?.toLocaleString()} <span>/ {paket.durationDays} gün</span></div>
                        <ul className="ozellik">
                            <li>{paket.durationDays} gün süre</li>
                            {paket.maxClasses > 0 && <li>{paket.maxClasses} ders hakkı</li>}
                            <li>Tüm ekipmanlara erişim</li>
                        </ul>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="dugme dugme-iki dugme-kuc" onClick={() => paketDuzenle(paket)}><FiEdit2 /> Düzenle</button>
                            <button className="dugme dugme-teh dugme-kuc" onClick={() => paketSil(paket._id)}><FiTrash2 /> Sil</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ---- Boş Durum ---- */}
            {paketler.length === 0 && <div className="kart"><div className="bos-durum"><div className="bos-ikon">📦</div><h3>Henüz paket yok</h3><p>İlk üyelik paketinizi oluşturun</p></div></div>}

            {/* ---- Paket Ekleme/Düzenleme Modalı ---- */}
            {modalAcik && (
                <div className="modal-arka" onClick={modalKapat}>
                    <div className="modal-ic" onClick={e => e.stopPropagation()}>
                        <div className="modal-bas">
                            <h2>{duzenlenecek ? 'Paket Düzenle' : 'Yeni Paket'}</h2>
                            <button className="modal-kapat" onClick={modalKapat}>✕</button>
                        </div>
                        <form onSubmit={formGonder}>
                            <div className="form-grup">
                                <label>Paket Adı</label>
                                <input type="text" name="name" className="form-kontrol" value={form.name} onChange={alanDegistir} required />
                            </div>
                            <div className="form-grup">
                                <label>Açıklama</label>
                                <textarea name="description" className="form-kontrol" rows="3" value={form.description} onChange={alanDegistir} style={{ resize: 'vertical' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-grup">
                                    <label>Fiyat (₺)</label>
                                    <input type="number" name="price" className="form-kontrol" value={form.price} onChange={alanDegistir} required min="0" />
                                </div>
                                <div className="form-grup">
                                    <label>Süre (Gün)</label>
                                    <input type="number" name="durationDays" className="form-kontrol" value={form.durationDays} onChange={alanDegistir} required min="1" />
                                </div>
                            </div>
                            <div className="form-grup">
                                <label>Maks. Ders Sayısı (0 = sınırsız)</label>
                                <input type="number" name="maxClasses" className="form-kontrol" value={form.maxClasses} onChange={alanDegistir} min="0" />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="submit" className="dugme dugme-bir" style={{ flex: 1, justifyContent: 'center' }}>{duzenlenecek ? 'Güncelle' : 'Oluştur'}</button>
                                <button type="button" className="dugme dugme-iki" onClick={modalKapat}>İptal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PackageManagement;
