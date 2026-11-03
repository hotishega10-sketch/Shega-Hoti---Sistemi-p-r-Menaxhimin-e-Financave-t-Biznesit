const mysql = require('mysql2/promise');

// Pool lidhjesh: ripërdor lidhjet në vend që të hapë një të re për çdo kërkesë.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  dateStrings: true, // datat kthehen si 'YYYY-MM-DD', pa konvertim zone kohore
});

module.exports = pool;
