// ==========================================
// Yönetici (Admin) Rotaları
// Kullanıcı, paket yönetimi ve raporlama
// ==========================================

const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const rota = express.Router();

// ---- Tüm rotalar admin yetkisi gerektirir ----
rota.use(protect);
rota.use(authorize('admin'));

// ==========================================
// KULLANICI YÖNETİMİ
// ==========================================

// ---- Tüm Kullanıcıları Getir ----
rota.get('/users', adminController.usersGet);

// ---- Kullanıcı Güncelle ----
rota.put('/users/:id', adminController.userPut);

// ---- Kullanıcı Sil ----
rota.delete('/users/:id', adminController.userDelete);

// ==========================================
// PAKET YÖNETİMİ
// ==========================================

// ---- Tüm Paketleri Getir ----
rota.get('/packages', adminController.packagesGet);

// ---- Paket Oluştur ----
rota.post('/packages', adminController.packagePost);

// ---- Paket Güncelle ----
rota.put('/packages/:id', adminController.packagePut);

// ---- Paket Sil ----
rota.delete('/packages/:id', adminController.packageDelete);

// ==========================================
// RAPORLAR
// ==========================================

// ---- Gelir Raporu ----
rota.get('/reports/revenue', adminController.revenueReportGet);

// ---- Devam Raporu ----
rota.get('/reports/attendance', adminController.attendanceReportGet);

// ---- Dashboard İstatistikleri ----
rota.get('/stats', adminController.statsGet);

module.exports = rota;
