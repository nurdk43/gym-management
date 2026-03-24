import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            navigate(`/${user.role}`);
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.code === 'ERR_NETWORK') {
                setError('Sunucuya bağlanılamadı. Backend sunucusunun çalıştığından emin olun.');
            } else {
                setError('Giriş başarısız: ' + (err.message || 'Bilinmeyen hata'));
            }
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>💪 GymPro</h1>
                    <p>Spor Salonu Yönetim Sistemi</p>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: 'var(--danger)', fontSize: '14px' }}>
                            {error}
                        </div>
                    )}
                    <div className="form-group">
                        <label>E-posta</label>
                        <input type="email" className="form-control" placeholder="ornek@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Şifre</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showPassword ? 'text' : 'password'} className="form-control" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingRight: '44px' }} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', padding: '4px' }}>
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>
                <div className="auth-footer">
                    Hesabınız yok mu? <Link to="/register">Kayıt Ol</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
