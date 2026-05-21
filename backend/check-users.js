const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function checkUsers() {
    try {
        const dbPath = path.join(__dirname, 'data', 'db');
        const mongod = await MongoMemoryServer.create({
            instance: { dbPath, storageEngine: 'wiredTiger' }
        });
        await mongoose.connect(mongod.getUri());
        
        const count = await User.countDocuments();
        console.log(`User count: ${count}`);
        
        const users = await User.find({}, 'name email role');
        console.log('Users in DB:');
        console.log(JSON.stringify(users, null, 2));
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
