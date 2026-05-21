// ==========================================
// Axios API Yapılandırması
// Tüm API istekleri için merkezi ayarlar
// ==========================================

import axios from 'axios';

// ---- API İstemcisi Oluştur ----
const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' }
});

// ---- İstek Dinleyicisi: Token Ekle ----
// Her istekte localStorage'dan token alıp Authorization başlığına ekler
api.interceptors.request.use((yapilandirma) => {
    const token = localStorage.getItem('token');
    if (token) {
        yapilandirma.headers.Authorization = `Bearer ${token}`;
    }
    return yapilandirma;
});

// ---- Yanıt Dinleyicisi: Hata Yönetimi ----
// 401 hatası gelirse oturumu kapat ve giriş sayfasına yönlendir
api.interceptors.response.use(
    (yanit) => yanit,
    (hata) => {
        if (hata.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(hata);
    }
);

export default api;
