// ==========================================
// Kimlik Doğrulama Rotaları (Kayıt & Giriş)
// POST /api/auth/register - Yeni kullanıcı kaydı
// POST /api/auth/login    - Kullanıcı girişi
// ==========================================

const express = require('express');
const { protect } = require('../middleware/auth');
const authController = require('../controllers/authController');
const rota = express.Router();

// ==========================================
// KULLANICI BİLGİLERİ - GET /api/auth/me
// ==========================================
rota.get('/me', protect, authController.me);

// ==========================================
// KAYIT OL - POST /api/auth/register
// ==========================================
rota.post('/register', authController.register);

// ==========================================
// GİRİŞ YAP - POST /api/auth/login
// ==========================================
rota.post('/login', authController.login);

module.exports = rota;
