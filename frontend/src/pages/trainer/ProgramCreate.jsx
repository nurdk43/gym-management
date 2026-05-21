// ==========================================
// Program Yönetimi Sayfası (Antrenör)
// Ders programı oluşturma, düzenleme, silme
// ==========================================

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiPlus, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';

const ProgramCreate = () => {
    // ---- Durum Değişkenleri ----
    const [programlar, setProgramlar] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [modalAcik, setModalAcik] = useState(false);
    const [duzenlenecek, setDuzenlenecek] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', dayOfWeek: 'Pazartesi', time: '', maxCapacity: '' });

    // ---- Haftanın Günleri ----
    const gunler = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

    // ---- Programları API'den Getir ----
    useEffect(() => {
        const programlariGetir = async () => {
            try {
                const yanit = await api.get('/trainer/programs');
                setProgramlar(yanit.data);
            } catch (hata) { console.error(hata); }
            setYukleniyor(false);
        };
        programlariGetir();
    }, []);

    // ---- Formu Sıfırla ----
    const formuSifirla = () => setForm({ title: '', description: '', dayOfWeek: 'Pazartesi', time: '', maxCapacity: '' });

    // ---- Form Gönder (Oluştur veya Güncelle) ----
    const formGonder = async (e) => {
        e.preventDefault();
        try {
            if (duzenlenecek) {
                const yanit = await api.put(`/trainer/programs/${duzenlenecek._id}`, form);
                setProgramlar(programlar.map(p => p._id === duzenlenecek._id ? yanit.data : p));
            } else {
                const yanit = await api.post('/trainer/programs', form);
                setProgramlar([yanit.data, ...programlar]);
            }
            setModalAcik(false); setDuzenlenecek(null); formuSifirla();
        } catch (hata) { console.error(hata); }
    };

    // ---- Düzenleme Moduna Geç ----
    const programDuzenle = (program) => {
        setDuzenlenecek(program);
        setForm({ title: program.title, description: program.description || '', dayOfWeek: program.dayOfWeek, time: program.time, maxCapacity: program.maxCapacity });
        setModalAcik(true);
    };

    // ---- Program Sil ----
    const programSil = async (id) => {
        if (!confirm('Bu programı silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/trainer/programs/${id}`);
            setProgramlar(programlar.filter(p => p._id !== id));
        } catch (hata) { console.error(hata); }
    };

    if (yukleniyor) return <div className="yukleme-kaps"><div className="yukleme"></div></div>;

    return (
        <div className="anim-soluk">
            {/* ---- Sayfa Başlığı ---- */}
            <div className="sayfa-bas">
                <div><h1>Programlar</h1><p>{programlar.length} program oluşturulmuş</p></div>
                <button className="dugme dugme-bir" onClick={() => { formuSifirla(); setDuzenlenecek(null); setModalAcik(true); }}><FiPlus /> Yeni Program</button>
            </div>

            {/* ---- Program Kartları ---- */}
            <div className="paket-izgara">
                {programlar.map((program, i) => (
                    <div key={program._id} className="paket-kart anim-yukari" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <h3>{program.title}</h3>
                            <span className={`rozet ${program.isActive ? 'rozet-bas' : 'rozet-teh'}`}>{program.isActive ? 'Aktif' : 'Pasif'}</span>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>{program.description || 'Açıklama yok'}</p>
                        <ul className="ozellik">
                            <li>📅 {program.dayOfWeek}</li>
                            <li>🕐 {program.time}</li>
                            <li><FiUsers style={{ marginRight: '4px' }} /> {program.enrolledMembers?.length || 0} / {program.maxCapacity} katılımcı</li>
                        </ul>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="dugme dugme-iki dugme-kuc" onClick={() => programDuzenle(program)}><FiEdit2 /> Düzenle</button>
                            <button className="dugme dugme-teh dugme-kuc" onClick={() => programSil(program._id)}><FiTrash2 /> Sil</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ---- Boş Durum ---- */}
            {programlar.length === 0 && <div className="kart"><div className="bos-durum"><div className="bos-ikon">📋</div><h3>Henüz program yok</h3><p>İlk programınızı oluşturun</p></div></div>}

            {/* ---- Program Ekleme/Düzenleme Modalı ---- */}
            {modalAcik && (
                <div className="modal-arka" onClick={() => { setModalAcik(false); setDuzenlenecek(null); }}>
                    <div className="modal-ic" onClick={e => e.stopPropagation()}>
                        <div className="modal-bas"><h2>{duzenlenecek ? 'Program Düzenle' : 'Yeni Program'}</h2><button className="modal-kapat" onClick={() => { setModalAcik(false); setDuzenlenecek(null); }}>✕</button></div>
                        <form onSubmit={formGonder}>
                            <div className="form-grup"><label>Program Adı</label><input type="text" name="title" className="form-kontrol" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
                            <div className="form-grup"><label>Açıklama</label><textarea name="description" className="form-kontrol" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-grup"><label>Gün</label><select className="form-kontrol" value={form.dayOfWeek} onChange={e => setForm({ ...form, dayOfWeek: e.target.value })}>{gunler.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                                <div className="form-grup"><label>Saat</label><input type="time" className="form-kontrol" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required /></div>
                            </div>
                            <div className="form-grup"><label>Maksimum Kapasite</label><input type="number" className="form-kontrol" value={form.maxCapacity} onChange={e => setForm({ ...form, maxCapacity: e.target.value })} required min="1" /></div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="submit" className="dugme dugme-bir" style={{ flex: 1, justifyContent: 'center' }}>{duzenlenecek ? 'Güncelle' : 'Oluştur'}</button>
                                <button type="button" className="dugme dugme-iki" onClick={() => { setModalAcik(false); setDuzenlenecek(null); }}>İptal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgramCreate;
