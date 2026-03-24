const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import all models
require('./models/User');
require('./models/Package');
require('./models/Payment');
require('./models/Enrollment');
require('./models/Program');
require('./models/Attendance');

async function exportDB() {
    try {
        await mongoose.connect('mongodb://localhost:27017/gym-management', {
            serverSelectionTimeoutMS: 3000
        });
        console.log('MongoDB bağlantısı başarılı');

        const outDir = path.join(__dirname, '..', 'db-backup');
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

        const collections = await mongoose.connection.db.listCollections().toArray();

        for (const col of collections) {
            const data = await mongoose.connection.db.collection(col.name).find({}).toArray();
            const filePath = path.join(outDir, `${col.name}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`✅ ${col.name}: ${data.length} kayıt exported → ${col.name}.json`);
        }

        console.log('\n🎉 Tüm veriler başarıyla dışa aktarıldı!');
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Hata:', err.message);
        process.exit(1);
    }
}

exportDB();
