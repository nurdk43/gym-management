// ==========================================
// Kullanıcı Yönetimi Sayfası
// Kullanıcıları listeleme, arama, düzenleme, silme
// ==========================================

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

const UserManagement = () => {
    // ---- Durum Değişkenleri ----
    const [kullanicilar, setKullanicilar] = useState([]);
    const [arama, setArama] = useState('');
    const [rolFiltre, setRolFiltre] = useState('');
    const [yukleniyor, setYukleniyor] = useState(true);
    const [duzenlenecek, setDuzenlenecek] = useState(null);

    const filtreParametreleri = () => {
        const params = {};
        if (arama) params.search = arama;
        if (rolFiltre) params.role = rolFiltre;
        return params;
    };

    // ---- Kullanıcıları API'den Getir ----
    const kullanicilariGetir = async () => {
        try {
            const yanit = await api.get('/admin/users', { params: filtreParametreleri() });
            setKullanicilar(yanit.data);
        } catch (hata) { console.error(hata); }
        setYukleniyor(false);
    };

    useEffect(() => { kullanicilariGetir(); }, [arama, rolFiltre]);

    // ---- Kullanıcı Sil ----
    const kullaniciSil = async (id) => {
        if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setKullanicilar(kullanicilar.filter(k => k._id !== id));
        } catch (hata) { console.error(hata); }
    };

    // ---- Kullanıcı Güncelle ----
    const kullaniciGuncelle = async (e) => {
        e.preventDefault();
        try {
            const yanit = await api.put(`/admin/users/${duzenlenecek._id}`, duzenlenecek);
            setKullanicilar(kullanicilar.map(k => k._id === duzenlenecek._id ? yanit.data : k));
            setDuzenlenecek(null);
        } catch (hata) { console.error(hata); }
    };

    // ---- Rol Rozeti ----
    const rolRozeti = (rol) => {
        const renkler = { admin: 'rozet-mor', trainer: 'rozet-blg', member: 'rozet-bas' };
        const etiketler = { admin: 'Admin', trainer: 'Antrenör', member: 'Üye' };
        return <span className={`rozet ${renkler[rol]}`}>{etiketler[rol]}</span>;
    };

    if (yukleniyor) return <div className="yukleme-kaps"><div className="yukleme"></div></div>;

    return (
        <div className="anim-soluk">
            {/* ---- Sayfa Başlığı ---- */}
            <div className="sayfa-bas">
                <div>
                    <h1>Kullanıcı Yönetimi</h1>
                    <p>{kullanicilar.length} kullanıcı bulundu</p>
                </div>
            </div>

            {/* ---- Arama ve Filtre ---- */}
            <div className="aksiyon">
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <FiSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input type="text" className="arama" placeholder="İsim veya e-posta arama..." value={arama} onChange={(e) => setArama(e.target.value)} />
                </div>
                <select className="form-kontrol" style={{ width: 'auto', minWidth: '150px' }} value={rolFiltre} onChange={(e) => setRolFiltre(e.target.value)}>
                    <option value="">Tüm Roller</option>
                    <option value="admin">Admin</option>
                    <option value="trainer">Antrenör</option>
                    <option value="member">Üye</option>
                </select>
            </div>

            {/* ---- Kullanıcı Tablosu ---- */}
            <div className="kart" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="tablo">
                    <thead>
                        <tr>
                            <th>İsim</th>
                            <th>E-posta</th>
                            <th>Telefon</th>
                            <th>Rol</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kullanicilar.map(k => (
                            <tr key={k._id}>
                                <td style={{ color: '#f1f5f9', fontWeight: 500 }}>{k.name}</td>
                                <td>{k.email}</td>
                                <td>{k.phone || '-'}</td>
                                <td>{rolRozeti(k.role)}</td>
                                <td><span className={`rozet ${k.isActive ? 'rozet-bas' : 'rozet-teh'}`}>{k.isActive ? 'Aktif' : 'Pasif'}</span></td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="dugme dugme-iki dugme-kuc" onClick={() => setDuzenlenecek({ ...k })}><FiEdit2 /></button>
                                        <button className="dugme dugme-teh dugme-kuc" onClick={() => kullaniciSil(k._id)}><FiTrash2 /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {kullanicilar.length === 0 && <div className="bos-durum"><p>Kullanıcı bulunamadı</p></div>}
            </div>

            {/* ---- Düzenleme Modalı ---- */}
            {duzenlenecek && (
                <div className="modal-arka" onClick={() => setDuzenlenecek(null)}>
                    <div className="modal-ic" onClick={e => e.stopPropagation()}>
                        <div className="modal-bas">
                            <h2>Kullanıcı Düzenle</h2>
                            <button className="modal-kapat" onClick={() => setDuzenlenecek(null)}>✕</button>
                        </div>
                        <form onSubmit={kullaniciGuncelle}>
                            <div className="form-grup">
                                <label>İsim</label>
                                <input type="text" className="form-kontrol" value={duzenlenecek.name} onChange={e => setDuzenlenecek({ ...duzenlenecek, name: e.target.value })} />
                            </div>
                            <div className="form-grup">
                                <label>E-posta</label>
                                <input type="email" className="form-kontrol" value={duzenlenecek.email} onChange={e => setDuzenlenecek({ ...duzenlenecek, email: e.target.value })} />
                            </div>
                            <div className="form-grup">
                                <label>Telefon</label>
                                <input type="tel" className="form-kontrol" value={duzenlenecek.phone || ''} onChange={e => setDuzenlenecek({ ...duzenlenecek, phone: e.target.value })} />
                            </div>
                            <div className="form-grup">
                                <label>Rol</label>
                                <select className="form-kontrol" value={duzenlenecek.role} onChange={e => setDuzenlenecek({ ...duzenlenecek, role: e.target.value })}>
                                    <option value="member">Üye</option>
                                    <option value="trainer">Antrenör</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="submit" className="dugme dugme-bir" style={{ flex: 1, justifyContent: 'center' }}>Kaydet</button>
                                <button type="button" className="dugme dugme-iki" onClick={() => setDuzenlenecek(null)}>İptal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
