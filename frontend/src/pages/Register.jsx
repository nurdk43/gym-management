import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';

const passwordRules = [
    { id: 'length', label: 'En az 6 karakter', test: (pw) => pw.length >= 6 },
    { id: 'uppercase', label: 'En az 1 büyük harf', test: (pw) => /[A-Z]/.test(pw) },
    { id: 'lowercase', label: 'En az 1 küçük harf', test: (pw) => /[a-z]/.test(pw) },
    { id: 'number', label: 'En az 1 rakam', test: (pw) => /[0-9]/.test(pw) },
];

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const allRulesPassed = passwordRules.every((r) => r.test(form.password));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!allRulesPassed) {
            setError('Şifre tüm koşulları karşılamalıdır.');
            return;
        }

        setLoading(true);
        try {
            const user = await register(form);
            navigate(`/${user.role}`);
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.code === 'ERR_NETWORK') {
                setError('Sunucuya bağlanılamadı. Backend sunucusunun çalıştığından emin olun.');
            } else {
                setError('Kayıt başarısız: ' + (err.message || 'Bilinmeyen hata'));
            }
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>💪 GymPro</h1>
                    <p>Yeni Hesap Oluştur</p>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: 'var(--danger)', fontSize: '14px' }}>
                            {error}
                        </div>
                    )}
                    <div className="form-group">
                        <label>Ad Soyad</label>
                        <input type="text" name="name" className="form-control" placeholder="Adınız Soyadınız" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>E-posta</label>
                        <input type="email" name="email" className="form-control" placeholder="ornek@email.com" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Telefon</label>
                        <input type="tel" name="phone" className="form-control" placeholder="0555 555 55 55" value={form.phone} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Şifre</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                className="form-control"
                                placeholder="Güçlü bir şifre girin"
                                value={form.password}
                                onChange={handleChange}
                                required
                                style={{ paddingRight: '44px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                                    fontSize: '18px', display: 'flex', alignItems: 'center', padding: '4px',
                                }}
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        {/* Şifre koşulları */}
                        {form.password.length > 0 && (
                            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {passwordRules.map((rule) => {
                                    const passed = rule.test(form.password);
                                    return (
                                        <div key={rule.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: passed ? 'var(--success)' : 'var(--danger)', transition: 'color 0.2s ease' }}>
                                            {passed ? <FiCheck /> : <FiX />}
                                            <span>{rule.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading || (form.password.length > 0 && !allRulesPassed)}>
                        {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                    </button>
                </form>
                <div className="auth-footer">
                    Zaten hesabınız var mı? <Link to="/login">Giriş Yap</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
