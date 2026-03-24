const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Program = require('../models/Program');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const router = express.Router();

router.use(protect);
router.use(authorize('trainer'));

// ===== PROGRAM YÖNETİMİ =====

// Antrenörün programlarını getir
router.get('/programs', async (req, res) => {
    try {
        const programs = await Program.find({ trainer: req.user._id })
            .populate('enrolledMembers', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(programs);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Program oluştur
router.post('/programs', async (req, res) => {
    try {
        const program = await Program.create({ ...req.body, trainer: req.user._id });
        res.status(201).json(program);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Program güncelle
router.put('/programs/:id', async (req, res) => {
    try {
        const program = await Program.findOneAndUpdate(
            { _id: req.params.id, trainer: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!program) return res.status(404).json({ message: 'Program bulunamadı' });
        res.json(program);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Program sil
router.delete('/programs/:id', async (req, res) => {
    try {
        const program = await Program.findOneAndDelete({ _id: req.params.id, trainer: req.user._id });
        if (!program) return res.status(404).json({ message: 'Program bulunamadı' });
        res.json({ message: 'Program silindi' });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// ===== ÜYE LİSTESİ =====
router.get('/members', async (req, res) => {
    try {
        const members = await User.find({ role: 'member' }).select('-password').sort({ name: 1 });
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// ===== DEVAM TAKİBİ =====

// Devam kaydı oluştur
router.post('/attendance', async (req, res) => {
    try {
        const { userId } = req.body;
        const attendance = await Attendance.create({
            user: userId,
            trainer: req.user._id,
            checkIn: new Date()
        });
        const populated = await attendance.populate([
            { path: 'user', select: 'name email' },
            { path: 'trainer', select: 'name' }
        ]);
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Check-out
router.put('/attendance/:id/checkout', async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            { checkOut: new Date() },
            { new: true }
        ).populate('user', 'name email');
        if (!attendance) return res.status(404).json({ message: 'Kayıt bulunamadı' });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Devam listesi
router.get('/attendance', async (req, res) => {
    try {
        const { date } = req.query;
        const filter = { trainer: req.user._id };
        if (date) {
            const d = new Date(date);
            filter.date = { $gte: new Date(d.setHours(0, 0, 0, 0)), $lte: new Date(d.setHours(23, 59, 59, 999)) };
        }
        const attendance = await Attendance.find(filter)
            .populate('user', 'name email phone')
            .sort({ checkIn: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const totalPrograms = await Program.countDocuments({ trainer: req.user._id });
        const activePrograms = await Program.countDocuments({ trainer: req.user._id, isActive: true });
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
        const todayAttendance = await Attendance.countDocuments({
            trainer: req.user._id,
            date: { $gte: todayStart, $lte: todayEnd }
        });
        const totalMembers = await User.countDocuments({ role: 'member' });

        res.json({ totalPrograms, activePrograms, todayAttendance, totalMembers });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

module.exports = router;
