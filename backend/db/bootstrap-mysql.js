const mysql = require('mysql2/promise');

async function ensureDatabaseExists() {
  if ((process.env.DB_DIALECT || 'mysql') !== 'mysql') return;

  const host = process.env.DB_HOST || '127.0.0.1';
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASS || '';
  const database = process.env.DB_NAME || 'gym_management';

  const connection = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await connection.end();
}

module.exports = { ensureDatabaseExists };

