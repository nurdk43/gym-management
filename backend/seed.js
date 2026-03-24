require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/User');

async function seed() {
    try {
        // DB bağlantısı (db.js ile aynı mantık)
        try {
            await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
        } catch {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const dbPath = path.join(__dirname, 'data', 'db');
            const mongod = await MongoMemoryServer.create({
                instance: { dbPath, storageEngine: 'wiredTiger' }
            });
            await mongoose.connect(mongod.getUri());
        }
        console.log('DB bağlantısı başarılı');

        const users = [
            { name: 'Ayşenur Dik', email: 'aysenur@gympro.com', password: 'Ayse1234*', role: 'admin', phone: '0555 111 1111' },
            { name: 'Fatma Yılmaz', email: 'fatma@gympro.com', password: 'Fatma1234*', role: 'trainer', phone: '0555 222 2222' },
            { name: 'Ahmet Yıldız', email: 'ahmet@gympro.com', password: 'Uye12345*', role: 'member', phone: '0555 333 3333' },
            { name: 'Zeynep Kaya', email: 'zeynep@gympro.com', password: 'Uye12345*', role: 'member', phone: '0555 444 4444' },
            { name: 'Mehmet Demir', email: 'mehmet@gympro.com', password: 'Uye12345*', role: 'member', phone: '0555 555 5555' }
        ];

        for (const u of users) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) {
                await User.create(u);
                console.log(`✅ ${u.name} (${u.role}) oluşturuldu`);
            } else {
                console.log(`⏭️  ${u.name} zaten mevcut`);
            }
        }

        console.log('\n🎉 Seed tamamlandı!');
        console.log('\n📋 Giriş Bilgileri:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👑 Admin:    aysenur@gympro.com  / Ayse1234*');
        console.log('🏋️ Eğitmen:  fatma@gympro.com    / Fatma1234*');
        console.log('👤 Üye:      ahmet@gympro.com    / Uye12345*');
        console.log('👤 Üye:      zeynep@gympro.com   / Uye12345*');
        console.log('👤 Üye:      mehmet@gympro.com   / Uye12345*');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Hata:', err.message);
        process.exit(1);
    }
}

seed();
