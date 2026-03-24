# 🏋️ GymPro - Spor Salonu Yönetim Sistemi

Profesyonel spor salonu yönetim sistemi. Üye, antrenör ve admin panelleri ile kapsamlı bir yönetim çözümü.

## 🚀 Özellikler

### 👑 Admin Paneli
- Kullanıcı yönetimi (üye, antrenör, admin)
- Paket yönetimi (oluştur, düzenle, sil)
- Gelir ve devam raporları
- Dashboard istatistikleri

### 🏋️ Antrenör Paneli
- Program oluşturma ve yönetimi
- Üye devam takibi (check-in/check-out)
- Üye listesi görüntüleme

### 👤 Üye Paneli
- Paket satın alma
- Derse kayıt olma
- Ödeme geçmişi
- Kişisel dashboard

## 🛠️ Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React, Vite, React Router |
| Backend | Node.js, Express.js |
| Veritabanı | MongoDB (kalıcı embedded) |
| Auth | JWT, bcryptjs |
| Stil | CSS (Inter font) |

## 📦 Kurulum

```bash
# Backend
cd backend
npm install
node server.js

# Frontend (yeni terminal)
cd frontend
npm install
npm run dev
```

Uygulama: `http://localhost:5173`


## 📂 Proje Yapısı

```
gym-management/
├── backend/
│   ├── config/         # DB bağlantısı
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose modelleri
│   ├── routes/          # API route'ları
│   ├── seed.js          # Kullanıcı seed
│   ├── seed-data.js     # Örnek veri seed
│   └── server.js        # Express sunucu
├── frontend/
│   ├── public/          # PWA dosyaları
│   ├── src/
│   │   ├── api/         # Axios config
│   │   ├── components/  # Navbar, Sidebar, vb.
│   │   ├── context/     # Auth context
│   │   └── pages/       # Admin, Trainer, Member sayfaları
│   └── index.html
└── README.md
```


