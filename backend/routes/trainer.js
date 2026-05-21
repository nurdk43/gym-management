// ==========================================
// Antrenör Rotaları
// Program oluşturma, üye yoklama takibi
// ==========================================

const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const trainerController = require('../controllers/trainerController');
const rota = express.Router();

// ---- Tüm rotalar antrenör yetkisi gerektirir ----
rota.use(protect);
rota.use(authorize('trainer'));

// ==========================================
// PROGRAM (DERS) YÖNETİMİ
// ==========================================

// ---- Program Oluştur ----
rota.post('/programs', trainerController.programsPost);

// ---- Antrenörün Programlarını Getir ----
rota.get('/programs', trainerController.programsGet);

// ---- Program Güncelle ----
rota.put('/programs/:id', trainerController.programsPut);

// ---- Program Sil ----
rota.delete('/programs/:id', trainerController.programsDelete);

// ==========================================
// YOKLAMA (DEVAM) TAKİBİ
// ==========================================

// ---- Giriş Kaydı Oluştur (Check-in) ----
rota.post('/attendance', trainerController.attendancePost);

// ---- Çıkış Kaydı (Check-out) ----
rota.put('/attendance/:id/checkout', trainerController.attendanceCheckoutPut);

// ---- Bugünün Yoklama Listesi ----
rota.get('/attendance', trainerController.attendanceGet);

// ---- Üye Listesi (Antrenörün görebileceği) ----
rota.get('/members', trainerController.membersGet);

// ---- Dashboard istatistikleri ----
rota.get('/stats', trainerController.statsGet);

module.exports = rota;
