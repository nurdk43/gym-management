// ==========================================
// Paket Modeli
// Üyelik paketlerinin tanımlandığı şema
// ==========================================

const mongoose = require('mongoose');

// ---- Paket Şeması ----
const paketSemasi = new mongoose.Schema({
    name: { type: String, required: true, trim: true },      // Paket adı
    description: { type: String, trim: true },                       // Açıklama
    price: { type: Number, required: true },                   // Fiyat (₺)
    durationDays: { type: Number, required: true },                   // Süre (gün)
    maxClasses: { type: Number, default: 0 },                       // Maks ders sayısı (0 = sınırsız)
    isActive: { type: Boolean, default: true }                    // Aktiflik durumu
}, {
    timestamps: true
});

module.exports = mongoose.model('Package', paketSemasi);
