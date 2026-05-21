const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

let sequelize;

function getSequelize() {
  if (sequelize) return sequelize;

  const dialect = process.env.DB_DIALECT || 'sqlite';

  if (dialect === 'sqlite') {
    const storage = process.env.DB_STORAGE || path.join(__dirname, '..', 'data', 'dev.sqlite');
    fs.mkdirSync(path.dirname(storage), { recursive: true });

    sequelize = new Sequelize({
      dialect,
      storage,
      logging: false
    });
    return sequelize;
  }

  // Varsayılan: MySQL
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
  const user = process.env.DB_USER || 'root';
  const pass = process.env.DB_PASS || '';
  const db = process.env.DB_NAME || 'gym_management';

  sequelize = new Sequelize(db, user, pass, {
    dialect: 'mysql',
    host,
    port,
    logging: false
  });

  return sequelize;
}

async function initDB() {
  const db = getSequelize();
  await db.authenticate();
  return db;
}

module.exports = { getSequelize, initDB };

