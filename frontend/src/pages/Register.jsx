// ==========================================
// Kayıt Sayfası
// Yeni üye kaydı oluşturur
// ==========================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';

// ---- Şifre Kuralları ----
const sifreKurallari = [
    { id: 'uzunluk', label: 'En az 6 karakter', test: (sifre) => sifre.length >= 6 },
    { id: 'buyukHarf', label: 'En az 1 büyük harf', test: (sifre) => /[A-Z]/.test(sifre) },
    { id: 'kucukHarf', label: 'En az 1 küçük harf', test: (sifre) => /[a-z]/.test(sifre) },
    { id: 'rakam', label: 'En az 1 rakam', test: (sifre) => /[0-9]/.test(sifre) },
];

const Register = () => {
    // ---- Durum Değişkenleri ----
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [hata, setHata] = useState('');
    const [yukleniyor, setYukleniyor] = useState(false);
    const [sifreGoster, setSifreGoster] = useState(false);
    const { register } = useAuth();
    const yonlendir = useNavigate();

    // ---- Form Alanı Değişimi ----
    const alanDegistir = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // ---- Tüm kurallar geçiyor mu? ----
    const tumKurallarGecti = sifreKurallari.every((kural) => kural.test(form.password));

    // ---- Form Gönder ----
    const formGonder = async (e) => {
        e.preventDefault();
        setHata('');

        if (!tumKurallarGecti) {
            setHata('Şifre tüm koşulları karşılamalıdır.');
            return;
        }

        setYukleniyor(true);
        try {
            const kullanici = await register(form);
            yonlendir(`/${kullanici.role}`);
        } catch (err) {
            if (err.response?.data?.message) {
                setHata(err.response.data.message);
            } else if (err.response?.data?.error) {
                setHata(err.response.data.error);
            } else if (err.code === 'ERR_NETWORK') {
                setHata('Sunucuya bağlanılamadı. Backend sunucusunun çalıştığından emin olun.');
            } else {
                setHata('Kayıt başarısız: ' + (err.message || 'Bilinmeyen hata'));
            }
        }
        setYukleniyor(false);
    };

    return (
        <div className="giris-kaps">
            <div className="giris-kart">
                {/* ---- Logo ---- */}
                <div className="giris-logo">
                    <h1>💪 GymPro</h1>
                    <p>Yeni Hesap Oluştur</p>
                </div>

                {/* ---- Kayıt Formu ---- */}
                <form onSubmit={formGonder}>
                    {hata && (
                        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#f87171', fontSize: '14px' }}>
                            {hata}
                        </div>
                    )}

                    {/* Ad Soyad */}
                    <div className="form-grup">
                        <label>Ad Soyad</label>
                        <input type="text" name="name" className="form-kontrol" placeholder="Adınız Soyadınız" value={form.name} onChange={alanDegistir} required />
                    </div>

                    {/* E-posta */}
                    <div className="form-grup">
                        <label>E-posta</label>
                        <input type="email" name="email" className="form-kontrol" placeholder="ornek@email.com" value={form.email} onChange={alanDegistir} required />
                    </div>

                    {/* Telefon */}
                    <div className="form-grup">
                        <label>Telefon</label>
                        <input type="tel" name="phone" className="form-kontrol" placeholder="0555 555 55 55" value={form.phone} onChange={alanDegistir} />
                    </div>

                    {/* Şifre Alanı */}
                    <div className="form-grup">
                        <label>Şifre</label>
                        <div style={{ position: 'relative' }}>
                            <input type={sifreGoster ? 'text' : 'password'} name="password" className="form-kontrol" placeholder="Güçlü bir şifre girin" value={form.password} onChange={alanDegistir} required style={{ paddingRight: '44px' }} />
                            <button type="button" onClick={() => setSifreGoster(!sifreGoster)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', padding: '4px' }}>
                                {sifreGoster ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>

                        {/* Şifre Kuralları Göstergesi */}
                        {form.password.length > 0 && (
                            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {sifreKurallari.map((kural) => {
                                    const gecti = kural.test(form.password);
                                    return (
                                        <div key={kural.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: gecti ? '#34d399' : '#f87171', transition: 'color 0.2s ease' }}>
                                            {gecti ? <FiCheck /> : <FiX />}
                                            <span>{kural.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Gönder Butonu */}
                    <button type="submit" className="dugme dugme-bir dugme-buy" style={{ width: '100%', justifyContent: 'center' }} disabled={yukleniyor || (form.password.length > 0 && !tumKurallarGecti)}>
                        {yukleniyor ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                    </button>
                </form>

                {/* ---- Giriş Bağlantısı ---- */}
                <div className="giris-alt">
                    Zaten hesabınız var mı? <Link to="/login">Giriş Yap</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
