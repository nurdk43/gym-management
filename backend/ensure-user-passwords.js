// DB içindeki kullanıcıların "password" alanı eksikse (restore sırasında oluşmayabiliyor),
// demo amaçlı bilinen plaintext şifrelerle doldurur. Şifre varsa dokunmaz.

const mongoose = require('mongoose');
const User = require('./models/User');

async function run() {
    const mongoUri =
        process.env.MONGO_URI || 'mongodb://127.0.0.1:27019/gym-management';

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

    const knownPasswordsByEmail = {
        'aysenur@gympro.com': 'Ayse1234*',
        'fatma@gympro.com': 'Fatma1234*',
        'caner@gympro.com': 'Caner1234*',
        'selin@gympro.com': 'Selin1234*',
        'murat@gympro.com': 'Murat1234*'
    };

    const users = await User.find({ isActive: true }).select('email role password');

    let updated = 0;
    for (const u of users) {
        if (u.password) continue; // password zaten varsa yeniden hashlemeyelim

        const plain =
            knownPasswordsByEmail[u.email] ||
            (u.role === 'member' ? 'Uye12345*' : 'Uye12345*');

        if (!plain) continue;

        u.password = plain; // pre('save') hook bcrypt ile hashleyecek
        await u.save();
        updated += 1;
    }

    console.log(`✅ Kullanıcı şifreleri güncellendi: ${updated} kullanıcı`);
    await mongoose.disconnect();
    process.exit(0);
}

run().catch(err => {
    console.error('❌ Hata:', err.message);
    process.exit(1);
});

