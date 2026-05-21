// ==========================================
// Kullanıcı Modeli
// Admin, antrenör ve üye rollerini tanımlar
// ==========================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ---- Kullanıcı Şeması ----
const kullaniciSemasi = new mongoose.Schema({
    name: { type: String, required: true, trim: true },                              // Ad-Soyad
    email: { type: String, required: true, unique: true, lowercase: true, trim: true }, // E-posta
    password: { type: String, required: true, minlength: 6 },                             // Şifre (hashlenmiş)
    role: { type: String, enum: ['admin', 'trainer', 'member'], default: 'member' },  // Rol
    phone: { type: String, trim: true },                                               // Telefon
    isActive: { type: Boolean, default: true }                                            // Aktiflik durumu
}, {
    timestamps: true  // createdAt ve updatedAt otomatik oluşturulur
});

// ---- Kayıt Öncesi: Şifreyi Hashle ----
kullaniciSemasi.pre('save', async function (sonraki) {
    if (!this.isModified('password')) return sonraki();
    const tuz = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, tuz);
});

// ---- Şifre Karşılaştırma Metodu ----
kullaniciSemasi.methods.sifreKarsilastir = async function (girilenSifre) {
    return await bcrypt.compare(girilenSifre, this.password);
};

module.exports = mongoose.model('User', kullaniciSemasi);
