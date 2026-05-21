// ==========================================
// Kimlik Doğrulama Context'i
// Oturum yönetimi (giriş, kayıt, çıkış)
// ==========================================

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

// ---- Context Oluştur ----
const AuthContext = createContext();

// ---- Hook: Context'e kolay erişim ----
export const useAuth = () => useContext(AuthContext);

// ---- Provider: Oturum durumunu tüm uygulamaya sağlar ----
export const AuthProvider = ({ children }) => {
    const [kullanici, setKullanici] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [yukleniyor, setYukleniyor] = useState(true);

    // ---- Sayfa yüklendiğinde kullanıcıyı kontrol et ----
    useEffect(() => {
        const kullaniciyiYukle = async () => {
            if (token) {
                try {
                    const yanit = await api.get('/auth/me');
                    setKullanici(yanit.data);
                } catch {
                    cikisYap();
                }
            }
            setYukleniyor(false);
        };
        kullaniciyiYukle();
    }, [token]);

    // ---- Giriş Yap ----
    const girisYap = async (email, password) => {
        const yanit = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', yanit.data.token);
        localStorage.setItem('user', JSON.stringify(yanit.data.user));
        setToken(yanit.data.token);
        setKullanici(yanit.data.user);
        return yanit.data.user;
    };

    // ---- Kayıt Ol ----
    const kayitOl = async (veri) => {
        const yanit = await api.post('/auth/register', veri);
        localStorage.setItem('token', yanit.data.token);
        localStorage.setItem('user', JSON.stringify(yanit.data.user));
        setToken(yanit.data.token);
        setKullanici(yanit.data.user);
        return yanit.data.user;
    };

    // ---- Çıkış Yap ----
    const cikisYap = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setKullanici(null);
    };

    return (
        <AuthContext.Provider value={{ user: kullanici, token, loading: yukleniyor, login: girisYap, register: kayitOl, logout: cikisYap }}>
            {children}
        </AuthContext.Provider>
    );
};
