const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Package = require('../models/Package');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Program = require('../models/Program');
const router = express.Router();

router.use(protect);
router.use(authorize('member'));

// ===== PAKETLER =====

// Aktif paketleri getir
router.get('/packages', async (req, res) => {
    try {
        const packages = await Package.find({ isActive: true }).sort({ price: 1 });
        res.json(packages);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Paket satın al
router.post('/enroll', async (req, res) => {
    try {
        const { packageId, method } = req.body;
        const pkg = await Package.findById(packageId);
        if (!pkg) return res.status(404).json({ message: 'Paket bulunamadı' });
        if (!pkg.isActive) return res.status(400).json({ message: 'Bu paket artık aktif değil' });

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + pkg.durationDays);

        const enrollment = await Enrollment.create({
            user: req.user._id,
            package: packageId,
            startDate,
            endDate
        });

        const payment = await Payment.create({
            user: req.user._id,
            enrollment: enrollment._id,
            amount: pkg.price,
            method: method || 'card'
        });

        res.status(201).json({ enrollment, payment });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Aktif üyeliklerim
router.get('/enrollments', async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ user: req.user._id })
            .populate('package')
            .sort({ createdAt: -1 });
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// ===== DERSLER =====

// Tüm aktif dersleri getir
router.get('/classes', async (req, res) => {
    try {
        const programs = await Program.find({ isActive: true })
            .populate('trainer', 'name')
            .populate('enrolledMembers', 'name');
        res.json(programs);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Derse kayıt ol
router.post('/classes/enroll', async (req, res) => {
    try {
        const { programId } = req.body;
        const program = await Program.findById(programId);
        if (!program) return res.status(404).json({ message: 'Ders bulunamadı' });
        if (!program.isActive) return res.status(400).json({ message: 'Bu ders aktif değil' });
        if (program.enrolledMembers.includes(req.user._id)) {
            return res.status(400).json({ message: 'Bu derse zaten kayıtlısınız' });
        }
        if (program.enrolledMembers.length >= program.maxCapacity) {
            return res.status(400).json({ message: 'Ders kapasitesi dolu' });
        }

        program.enrolledMembers.push(req.user._id);
        await program.save();

        res.json({ message: 'Derse başarıyla kaydoldunuz', program });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Dersten çık
router.delete('/classes/:id', async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);
        if (!program) return res.status(404).json({ message: 'Ders bulunamadı' });

        program.enrolledMembers = program.enrolledMembers.filter(
            m => m.toString() !== req.user._id.toString()
        );
        await program.save();

        res.json({ message: 'Dersten çıkış yapıldı' });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Kayıtlı derslerim
router.get('/my-classes', async (req, res) => {
    try {
        const programs = await Program.find({ enrolledMembers: req.user._id })
            .populate('trainer', 'name');
        res.json(programs);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// ===== ÖDEME GEÇMİŞİ =====
router.get('/payments', async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user._id })
            .populate({ path: 'enrollment', populate: { path: 'package', select: 'name durationDays' } })
            .sort({ paidAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const activeEnrollments = await Enrollment.countDocuments({ user: req.user._id, status: 'active' });
        const myClasses = await Program.countDocuments({ enrolledMembers: req.user._id });
        const totalPayments = await Payment.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.json({
            activeEnrollments,
            myClasses,
            totalSpent: totalPayments[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

module.exports = router;
