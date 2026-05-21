// ==========================================
// Üyelik Kaydı Modeli
// Üyelerin paketlere kayıt bilgileri
// ==========================================

const mongoose = require('mongoose');

// ---- Üyelik Kaydı Şeması ----
const uyelikSemasi = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },      // Üye
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },   // Satın alınan paket
    startDate: { type: Date, default: Date.now },                                           // Başlangıç tarihi
    endDate: { type: Date, required: true },                                              // Bitiş tarihi
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' } // Durum
}, {
    timestamps: true
});

module.exports = mongoose.model('Enrollment', uyelikSemasi);
