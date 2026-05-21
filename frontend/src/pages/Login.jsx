// ==========================================
// Giriş Sayfası
// Kullanıcı e-posta ve şifre ile giriş yapar
// ==========================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
    // ---- Durum Değişkenleri ----
    const [eposta, setEposta] = useState('');
    const [sifre, setSifre] = useState('');
    const [hata, setHata] = useState('');
    const [yukleniyor, setYukleniyor] = useState(false);
    const [sifreGoster, setSifreGoster] = useState(false);
    const { login } = useAuth();
    const yonlendir = useNavigate();

    // ---- Form Gönder ----
    const formGonder = async (e) => {
        e.preventDefault();
        setHata('');
        setYukleniyor(true);
        try {
            const kullanici = await login(eposta, sifre);
            yonlendir(`/${kullanici.role}`);
        } catch (err) {
            if (err.response?.data?.message) {
                setHata(err.response.data.message);
            } else if (err.code === 'ERR_NETWORK') {
                setHata('Sunucuya bağlanılamadı. Backend sunucusunun çalıştığından emin olun.');
            } else {
                setHata('Giriş başarısız: ' + (err.message || 'Bilinmeyen hata'));
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
                    <p>Spor Salonu Yönetim Sistemi</p>
                </div>

                {/* ---- Giriş Formu ---- */}
                <form onSubmit={formGonder}>
                    {hata && (
                        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#f87171', fontSize: '14px' }}>
                            {hata}
                        </div>
                    )}

                    {/* E-posta Alanı */}
                    <div className="form-grup">
                        <label>E-posta</label>
                        <input type="email" className="form-kontrol" placeholder="ornek@email.com" value={eposta} onChange={(e) => setEposta(e.target.value)} required />
                    </div>

                    {/* Şifre Alanı */}
                    <div className="form-grup">
                        <label>Şifre</label>
                        <div style={{ position: 'relative' }}>
                            <input type={sifreGoster ? 'text' : 'password'} className="form-kontrol" placeholder="••••••" value={sifre} onChange={(e) => setSifre(e.target.value)} required style={{ paddingRight: '44px' }} />
                            <button type="button" onClick={() => setSifreGoster(!sifreGoster)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', padding: '4px' }}>
                                {sifreGoster ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    {/* Gönder Butonu */}
                    <button type="submit" className="dugme dugme-bir dugme-buy" style={{ width: '100%', justifyContent: 'center' }} disabled={yukleniyor}>
                        {yukleniyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>

                {/* ---- Kayıt Bağlantısı ---- */}
                <div className="giris-alt">
                    Hesabınız yok mu? <Link to="/register">Kayıt Ol</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
