// ==========================================
// Devam (Yoklama) Modeli
// Üyelerin salona giriş/çıkış kayıtları
// ==========================================

const mongoose = require('mongoose');

// ---- Devam Kaydı Şeması ----
const devamSemasi = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Üye
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },                   // Yoklamayı alan antrenör
    date: { type: Date, default: Date.now },                                       // Tarih
    checkIn: { type: Date, default: Date.now },                                       // Giriş saati
    checkOut: { type: Date }                                                            // Çıkış saati
}, {
    timestamps: true
});

module.exports = mongoose.model('Attendance', devamSemasi);
