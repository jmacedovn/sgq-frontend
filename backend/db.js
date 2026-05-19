const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD || ''),
  port: process.env.DB_PORT,
  // Desabilitado SSL pois o servidor local pode não suportar
  // ssl: {
  //   rejectUnauthorized: false
  // }
});

pool.on('error', (err, client) => {
  console.error('Erro inesperado no cliente do banco de dados', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
