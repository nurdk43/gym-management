// ==========================================
// GymPro - Ana Sunucu Dosyası
// Express.js tabanlı REST API sunucusu
// ==========================================

const dotenv = require('dotenv');
// ---- Ortam Değişkenlerini Yükle (EN BAŞTA) ----
dotenv.config();

const express = require('express');
const cors = require('cors');
const { ensureDatabaseExists } = require('./db/bootstrap-mysql');
const { initDB, getSequelize } = require('./db/sequelize');
require('./db/models'); // association'ları yükle
const { errorHandler } = require('./middleware/errorHandler');

// ---- Express Uygulamasını Oluştur ----
const uygulama = express();
const PORT = process.env.PORT || 5001;

// ---- Middleware'ler ----
uygulama.use(cors());                    // Çapraz kaynak isteklerine izin ver
uygulama.use(express.json());            // JSON gövde ayrıştırma

// ---- API Rotaları ----
uygulama.use('/api/auth', require('./routes/auth'));         // Kimlik doğrulama (giriş/kayıt)
uygulama.use('/api/admin', require('./routes/admin'));       // Yönetici işlemleri
uygulama.use('/api/trainer', require('./routes/trainer'));   // Antrenör işlemleri
uygulama.use('/api/member', require('./routes/member'));     // Üye işlemleri

// ---- Sunucuyu Başlat ----
const sunucuyuBaslat = async () => {
    // MySQL DB yoksa oluştur
    await ensureDatabaseExists();

    // Sequelize bağlantısı
    await initDB();

    // Dev ortamı için tablo sync (prod'da migration önerilir)
    const sequelize = getSequelize();
    await sequelize.sync();

    uygulama.listen(PORT, () => {
        console.log(`🚀 GymPro sunucusu ${PORT} portunda çalışıyor`);
    });
};

sunucuyuBaslat();

// ---- Hata middleware (en sonda) ----
uygulama.use(errorHandler);
