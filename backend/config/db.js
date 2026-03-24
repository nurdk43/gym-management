const mongoose = require('mongoose');
const path = require('path');

const connectDB = async () => {
  try {
    // Önce normal MongoDB'ye bağlanmayı dene
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('Local MongoDB bulunamadı, kalıcı embedded MongoDB başlatılıyor...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const dbPath = path.join(__dirname, '..', 'data', 'db');

      // Kalıcı dbPath ile MongoMemoryServer oluştur
      const mongod = await MongoMemoryServer.create({
        instance: {
          dbPath: dbPath,
          storageEngine: 'wiredTiger'
        }
      });

      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ Kalıcı MongoDB Connected: ${conn.connection.host}`);
      console.log(`📁 Veriler kalıcı olarak şurada saklanıyor: ${dbPath}`);

      // Sunucu kapanırken MongoDB'yi düzgün kapat
      process.on('SIGINT', async () => {
        await mongoose.disconnect();
        await mongod.stop();
        process.exit(0);
      });
      process.on('SIGTERM', async () => {
        await mongoose.disconnect();
        await mongod.stop();
        process.exit(0);
      });
    } catch (memError) {
      console.error(`MongoDB Connection Error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
