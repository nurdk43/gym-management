// ==========================================
// Veritabanı Bağlantı Yapılandırması
// MongoMemoryServer yerine MONGO_URI üzerinden bağlan
// ==========================================

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function tryStartEmbeddedMongo(mongoUri) {
  const mongoUrl = new URL(mongoUri);
  const port = mongoUrl.port || '27017';

  const dbPath = path.join(__dirname, '..', 'data', 'db');
  fs.mkdirSync(dbPath, { recursive: true });

  // mongodb-memory-server binary cache (node_modules/.cache/mongodb-memory-server/mongod-*)
  const cacheDir = path.join(__dirname, '..', 'node_modules', '.cache', 'mongodb-memory-server');
  const candidates = fs.readdirSync(cacheDir).filter(n => n.startsWith('mongod-'));
  if (!candidates.length) {
    throw new Error(`mongod binary cache bulunamadı: ${cacheDir}`);
  }
  const binaryPath = path.join(cacheDir, candidates[0]);

  const logPath = path.join(__dirname, '..', 'mongod.embedded.log');
  // MongoMemoryServer sandbox'ta /tmp unix socket açamadığı için `--nounixsocket` veriyoruz.
  const child = spawn(
    binaryPath,
    [
      '--dbpath', dbPath,
      '--port', String(port),
      '--bind_ip', '127.0.0.1',
      '--nounixsocket',
      '--storageEngine', 'wiredTiger',
      '--logpath', logPath
    ],
    { detached: true, stdio: 'ignore' }
  );
  child.unref();

  // Başlatıldıktan sonra port açılana kadar birkaç deneme yapıyoruz.
  for (let i = 0; i < 20; i++) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 1000 });
      return;
    } catch {
      await sleep(500);
    }
  }

  throw new Error('Embedded mongod başlatılamadı veya bağlantı kurulamadı.');
}

const connectDB = async () => {
  const mongoUri =
    process.env.MONGO_URI ||
    // Sandbox ortamında /tmp unix socket açma kısıtı nedeniyle
    // Mongo'nun lokalde TCP üzerinden çalıştığı portu varsayılan yapıyoruz.
    'mongodb://127.0.0.1:27019/gym-management';

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB bağlantısı başarılı: ${mongoUri}`);
  } catch (err) {
    console.warn(`⚠️ Mongo bağlantısı kurulamadı, embedded mongod deneniyor. Sebep: ${err.message}`);
    try {
      await mongoose.disconnect().catch(() => {});
      await tryStartEmbeddedMongo(mongoUri);
      console.log(`✅ Embedded MongoDB bağlantısı başarılı: ${mongoUri}`);
    } catch (startErr) {
      console.error('❌ MongoDB Bağlantı Hatası:', startErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
