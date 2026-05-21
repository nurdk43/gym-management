// ==========================================
// Program (Ders) Modeli
// Antrenörlerin oluşturduğu ders programları
// ==========================================

const mongoose = require('mongoose');

// ---- Program Şeması ----
const programSemasi = new mongoose.Schema({
    title: { type: String, required: true, trim: true },                                                 // Ders adı
    description: { type: String, trim: true },                                                                  // Açıklama
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },                         // Antrenör
    dayOfWeek: { type: String, enum: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'] },  // Gün
    time: { type: String },                                                                               // Saat
    maxCapacity: { type: Number, default: 20 },                                                                  // Maks kapasite
    enrolledMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],                                        // Kayıtlı üyeler
    isActive: { type: Boolean, default: true }                                                                // Aktiflik durumu
}, {
    timestamps: true
});

module.exports = mongoose.model('Program', programSemasi);
