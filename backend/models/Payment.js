// ==========================================
// Ödeme Modeli
// Üyelerin yaptığı ödemelerin kaydı
// ==========================================

const mongoose = require('mongoose');

// ---- Ödeme Şeması ----
const odemeSemasi = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },        // Ödeme yapan üye
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true },  // İlişkili üyelik kaydı
    amount: { type: Number, required: true },                                              // Ödeme tutarı (₺)
    method: { type: String, enum: ['cash', 'card', 'transfer'], default: 'card' },        // Ödeme yöntemi
    paidAt: { type: Date, default: Date.now }                                             // Ödeme tarihi
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', odemeSemasi);
