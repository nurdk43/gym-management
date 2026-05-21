// ==========================================
// Üye Rotaları
// Paket satın alma, ders kaydı, ödeme geçmişi
// ==========================================

const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const memberController = require('../controllers/memberController');
const rota = express.Router();

// ---- Tüm rotalar üye yetkisi gerektirir ----
rota.use(protect);
rota.use(authorize('member'));

// ==========================================
// PAKET İŞLEMLERİ
// ==========================================

// ---- Aktif Paketleri Listele ----
rota.get('/packages', memberController.packagesGet);

// ---- Paket Satın Al ----
rota.post('/enroll', memberController.enrollPost);

// ---- Aktif Üyeliklerimi Getir ----
rota.get('/enrollments', memberController.enrollmentsGet);

// ==========================================
// DERS İŞLEMLERİ
// ==========================================

// ---- Tüm Aktif Dersleri Getir ----
rota.get('/classes', memberController.classesGet);

// ---- Derse Kayıt Ol ----
rota.post('/classes/enroll', memberController.classesEnrollPost);

// ---- Dersten Çık ----
rota.delete('/classes/:id', memberController.classesDelete);

// ---- Kayıtlı Derslerimi Getir ----
rota.get('/my-classes', memberController.myClassesGet);

// ==========================================
// ÖDEME GEÇMİŞİ
// ==========================================

// ---- Ödeme Geçmişimi Getir ----
rota.get('/payments', memberController.paymentsGet);

// ==========================================
// DASHBOARD İSTATİSTİKLERİ
// ==========================================

rota.get('/stats', memberController.statsGet);

module.exports = rota;
