require('dotenv').config();

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const connectDB = require('./config/db');
const User = require('./models/User');

function looksLikeObjectId(value) {
    return typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);
}

function toObjectId(value) {
    if (!value) return undefined;
    const v = value?._id ? value._id : value;
    if (value instanceof mongoose.Types.ObjectId) return value;
    if (looksLikeObjectId(v)) return new mongoose.Types.ObjectId(v);
    return undefined;
}

function toDate(value) {
    if (!value) return undefined;
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
}

async function restoreData() {
    // Mongo bağlantısı (artık mongodb-memory-server yok)
    await connectDB();
    console.log('✅ MongoDB bağlantısı başarılı (Restore Mode)');

    const backupDir = path.join(__dirname, '..', 'db-backup');
    if (!fs.existsSync(backupDir)) {
        console.error('❌ db-backup klasörü bulunamadı!');
        process.exit(1);
    }

    // Bu yedeklerde doğrudan gelen koleksiyonlar:
    // - users (users.json)
    // - packages (packages.json)
    // - payments (revenue.json) + enrollments (revenue.json içinden türetiliyor)
    // - attendances (attendance.json)
    const collectionsToClear = ['users', 'packages', 'payments', 'enrollments', 'attendances'];
    for (const colName of collectionsToClear) {
        await mongoose.connection.db.collection(colName).deleteMany({});
    }

    let users = [];
    let packages = [];
    let payments = [];
    let enrollmentsById = new Map();
    let attendances = [];

    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
        const baseName = path.basename(file, '.json');
        const raw = JSON.parse(fs.readFileSync(path.join(backupDir, file), 'utf8'));

        if (baseName === 'users' && Array.isArray(raw)) {
            users = raw.map(u => ({ ...u, _id: toObjectId(u._id) }));
            continue;
        }

        if (baseName === 'packages' && Array.isArray(raw)) {
            packages = raw.map(p => ({ ...p, _id: toObjectId(p._id) }));
            continue;
        }

        if (baseName === 'attendance' && raw?.attendance) {
            attendances = raw.attendance.map(a => ({
                _id: toObjectId(a._id),
                user: toObjectId(a.user),
                trainer: toObjectId(a.trainer),
                date: toDate(a.date),
                checkIn: toDate(a.checkIn),
                checkOut: toDate(a.checkOut),
                createdAt: toDate(a.createdAt),
                updatedAt: toDate(a.updatedAt)
            }));
            continue;
        }

        if (baseName === 'revenue' && raw?.payments) {
            for (const p of raw.payments) {
                // Payment şeması: user/enrollment sadece ObjectId
                const paymentUserId = toObjectId(p.user);
                const enrollmentId = toObjectId(p.enrollment);

                payments.push({
                    _id: toObjectId(p._id),
                    user: paymentUserId,
                    enrollment: enrollmentId,
                    amount: p.amount,
                    method: p.method,
                    paidAt: toDate(p.paidAt),
                    createdAt: toDate(p.createdAt),
                    updatedAt: toDate(p.updatedAt)
                });

                // Payment.enrollment embedded datadan Enrollment koleksiyonunu üret.
                const e = p.enrollment;
                if (e && e._id) {
                    const enrollmentIdStr = e._id;
                    if (!enrollmentsById.has(enrollmentIdStr)) {
                        enrollmentsById.set(enrollmentIdStr, {
                            _id: toObjectId(e._id),
                            user: toObjectId(e.user),
                            package: toObjectId(e.package),
                            startDate: toDate(e.startDate),
                            endDate: toDate(e.endDate),
                            status: e.status,
                            createdAt: toDate(e.createdAt),
                            updatedAt: toDate(e.updatedAt)
                        });
                    }
                }
            }
            continue;
        }

        console.log(`⚠️  ${baseName}: format beklenmedik veya dosya atlandı`);
    }

    if (users.length) await mongoose.connection.db.collection('users').insertMany(users);
    if (packages.length) await mongoose.connection.db.collection('packages').insertMany(packages);
    if (enrollmentsById.size) await mongoose.connection.db.collection('enrollments').insertMany([...enrollmentsById.values()]);
    if (payments.length) await mongoose.connection.db.collection('payments').insertMany(payments);
    if (attendances.length) await mongoose.connection.db.collection('attendances').insertMany(attendances);

    // db-backup/users.json içinde password alanı olmayabiliyor; login'in çalışması için
    // bilinen kullanıcıları seed şifreleriyle güncelliyoruz.
    const defaultPasswordsByEmail = {
        'aysenur@gympro.com': 'Ayse1234*',
        'fatma@gympro.com': 'Fatma1234*',
        'ahmet@gympro.com': 'Uye12345*',
        'zeynep@gympro.com': 'Uye12345*',
        'mehmet@gympro.com': 'Uye12345*'
    };

    for (const [email, plainPassword] of Object.entries(defaultPasswordsByEmail)) {
        const user = await User.findOne({ email });
        if (!user) continue;
        if (!user.password) {
            user.password = plainPassword;
            await user.save(); // pre('save') hook bcrypt ile hashler
        }
    }

    console.log('\n🎉 Veri geri yükleme işlemi tamamlandı!');
    await mongoose.disconnect();
    process.exit(0);
}

restoreData().catch(err => {
    console.error('❌ Hata:', err.message);
    process.exit(1);
});
