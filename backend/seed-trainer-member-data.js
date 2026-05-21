// Trainer ve member ekranları için örnek veri ekler:
// - Programlar (dün/bugün fark etmez, üye ders kaydı için gerekli)
// - Bugünkü Attendance (trainer/attendance için gerekli)

const mongoose = require('mongoose');

const User = require('./models/User');
const Package = require('./models/Package');
const Program = require('./models/Program');
const Enrollment = require('./models/Enrollment');
const Attendance = require('./models/Attendance');

function startOfToday(d = new Date()) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function endOfToday(d = new Date()) {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
}

function uniq(arr) {
    return [...new Set(arr)];
}

async function run() {
    const mongoUri =
        process.env.MONGO_URI || 'mongodb://127.0.0.1:27019/gym-management';

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

    const trainers = await User.find({ role: 'trainer', isActive: true }).sort({ createdAt: 1 });
    const members = await User.find({ role: 'member', isActive: true }).sort({ createdAt: 1 });

    if (!trainers.length || !members.length) {
        console.log('⚠️ Program/Attendance için trainer veya member bulunamadı.');
        await mongoose.disconnect();
        process.exit(0);
    }

    // 1) Programlar
    const existingPrograms = await Program.countDocuments();
    if (existingPrograms === 0) {
        const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

        const templateByTrainer = [
            {
                trainerIndex: 0,
                programs: [
                    { title: 'Sabah Yogası', description: 'Güne enerjik başlamak için yoga dersi', dayOfWeek: days[0], time: '08:00', maxCapacity: 15 },
                    { title: 'Fonksiyonel Antrenman', description: 'Tüm vücut fonksiyonel egzersizler', dayOfWeek: days[1], time: '10:00', maxCapacity: 12 },
                    { title: 'Pilates', description: 'Core güçlendirme ve esneklik', dayOfWeek: days[2], time: '09:00', maxCapacity: 10 },
                ]
            },
            {
                trainerIndex: 1,
                programs: [
                    { title: 'HIIT Kardiyo', description: 'Yüksek yoğunluklu interval antrenman', dayOfWeek: days[3], time: '18:00', maxCapacity: 20 },
                    { title: 'Zumba', description: 'Dans ile eğlenceli kardiyo', dayOfWeek: days[4], time: '17:00', maxCapacity: 25 },
                    { title: 'CrossFit', description: 'Güç ve dayanıklılık antrenmanı', dayOfWeek: days[5], time: '10:00', maxCapacity: 15 }
                ]
            }
        ];

        const createdPrograms = [];
        const memberIds = members.map(m => m._id);

        for (const block of templateByTrainer) {
            const trainer = trainers[block.trainerIndex] || trainers[0];
            for (const t of block.programs) {
                // Her program için 2-3 üye seçelim
                const slice = memberIds.slice(
                    createdPrograms.length % Math.max(memberIds.length, 1),
                    Math.min(memberIds.length, (createdPrograms.length % Math.max(memberIds.length, 1)) + 3)
                );
                const enrolledMembers = uniq(slice);

                const program = await Program.create({
                    ...t,
                    trainer: trainer._id,
                    enrolledMembers,
                    isActive: true
                });
                createdPrograms.push(program._id);
            }
        }

        console.log(`✅ Programlar eklendi: ${createdPrograms.length} adet`);
    } else {
        console.log(`ℹ️ Programlar zaten var (${existingPrograms}).`);
    }

    // 2) Bugünkü Attendance
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    // Her trainer için bugün en az 2 kayıt olsun
    for (const trainer of trainers) {
        const todayCount = await Attendance.countDocuments({
            trainer: trainer._id,
            date: { $gte: todayStart, $lte: todayEnd }
        });

        if (todayCount >= 2) continue;

        const toCreate = Math.min(2 - todayCount, members.length);
        const memberIds = members.map(m => m._id);
        const targetMemberIds = memberIds.slice(0, toCreate);

        const now = new Date();
        const records = targetMemberIds.map(userId => ({
            user: userId,
            trainer: trainer._id,
            date: now,
            checkIn: now
        }));

        await Attendance.insertMany(records);
        console.log(`✅ Trainer ${trainer.email}: bugün attendance eklendi (${records.length} adet)`);
    }

    await mongoose.disconnect();
    process.exit(0);
}

run().catch(err => {
    console.error('❌ Seed hatası:', err.message);
    process.exit(1);
});

