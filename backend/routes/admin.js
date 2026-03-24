const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Package = require('../models/Package');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

// ===== KULLANICI YÖNETİMİ =====

// Tüm kullanıcıları getir
router.get('/users', async (req, res) => {
    try {
        const { role, search } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Kullanıcı güncelle
router.put('/users/:id', async (req, res) => {
    try {
        const { name, email, role, phone, isActive } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, role, phone, isActive },
            { new: true, runValidators: true }
        ).select('-password');
        if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Kullanıcı sil
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        res.json({ message: 'Kullanıcı silindi' });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// ===== PAKET YÖNETİMİ =====

// Tüm paketleri getir
router.get('/packages', async (req, res) => {
    try {
        const packages = await Package.find().sort({ createdAt: -1 });
        res.json(packages);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Paket oluştur
router.post('/packages', async (req, res) => {
    try {
        const pkg = await Package.create(req.body);
        res.status(201).json(pkg);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Paket güncelle
router.put('/packages/:id', async (req, res) => {
    try {
        const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!pkg) return res.status(404).json({ message: 'Paket bulunamadı' });
        res.json(pkg);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Paket sil
router.delete('/packages/:id', async (req, res) => {
    try {
        const pkg = await Package.findByIdAndDelete(req.params.id);
        if (!pkg) return res.status(404).json({ message: 'Paket bulunamadı' });
        res.json({ message: 'Paket silindi' });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// ===== RAPORLAR =====

// Gelir raporu
router.get('/reports/revenue', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = {};
        if (startDate || endDate) {
            filter.paidAt = {};
            if (startDate) filter.paidAt.$gte = new Date(startDate);
            if (endDate) filter.paidAt.$lte = new Date(endDate);
        }

        const payments = await Payment.find(filter)
            .populate('user', 'name email')
            .populate({ path: 'enrollment', populate: { path: 'package', select: 'name' } })
            .sort({ paidAt: -1 });

        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

        // Paket dağılımı
        const distribution = {};
        payments.forEach(p => {
            const pkgName = p.enrollment?.package?.name || 'Diğer';
            distribution[pkgName] = (distribution[pkgName] || 0) + p.amount;
        });

        res.json({ totalRevenue, payments, count: payments.length, distribution });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Devam raporu
router.get('/reports/attendance', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = {};
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const attendance = await Attendance.find(filter)
            .populate('user', 'name email')
            .populate('trainer', 'name')
            .sort({ date: -1 });

        // Antrenör popülerliği (devam kaydı sayısı)
        const distribution = {};
        attendance.forEach(a => {
            const trainerName = a.trainer?.name || 'Diğer';
            distribution[trainerName] = (distribution[trainerName] || 0) + 1;
        });

        res.json({ attendance, count: attendance.length, distribution });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const totalMembers = await User.countDocuments({ role: 'member' });
        const totalTrainers = await User.countDocuments({ role: 'trainer' });
        const activeEnrollments = await Enrollment.countDocuments({ status: 'active' });
        const totalRevenue = await Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
        const monthlyRevenue = await Payment.aggregate([
            { $match: { paidAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.json({
            totalMembers,
            totalTrainers,
            activeEnrollments,
            totalRevenue: totalRevenue[0]?.total || 0,
            monthlyRevenue: monthlyRevenue[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

module.exports = router;
