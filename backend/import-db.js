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

async function importDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gym-management', {
            serverSelectionTimeoutMS: 5000
        });
        console.log('MongoDB bağlantısı başarılı');

        const backupDir = path.join(__dirname, '..', 'db-backup');
        if (!fs.existsSync(backupDir)) {
            console.log('db-backup klasörü bulunamadı. Önce export-db.js çalıştırın.');
            process.exit(1);
        }

        const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));

        for (const file of files) {
            const colName = path.basename(file, '.json');
            const data = JSON.parse(fs.readFileSync(path.join(backupDir, file), 'utf8'));
            if (data.length > 0) {
                await mongoose.connection.db.collection(colName).deleteMany({});
                await mongoose.connection.db.collection(colName).insertMany(data);
                console.log(`✅ ${colName}: ${data.length} kayıt imported`);
            }
        }

        console.log('\n🎉 Tüm veriler başarıyla içe aktarıldı!');
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Hata:', err.message);
        process.exit(1);
    }
}

importDB();
