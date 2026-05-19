const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD || ''),
  port: process.env.DB_PORT,
  // ssl: {
  //   rejectUnauthorized: false
  // }
});

async function test() {
  try {
    console.log('Tentando conectar ao banco...');
    const res = await pool.query('SELECT NOW()');
    console.log('Conexão bem-sucedida:', res.rows[0]);
    
    console.log('Testando inserção na tabela users...');
    const testUser = {
      name: 'Teste AI',
      username: 'test_ai_' + Date.now(),
      password: 'password123',
      role: 'OPERADOR',
      permissions: '[]'
    };
    
    const insertQuery = 'INSERT INTO users (name, username, password, role, permissions) VALUES ($1, $2, $3, $4, $5::jsonb) RETURNING *';
    const insertRes = await pool.query(insertQuery, [testUser.name, testUser.username, testUser.password, testUser.role, testUser.permissions]);
    console.log('Inserção bem-sucedida:', insertRes.rows[0]);
    
    console.log('Limpando usuário de teste...');
    await pool.query('DELETE FROM users WHERE id = $1', [insertRes.rows[0].id]);
    console.log('Limpeza concluída.');
    
  } catch (err) {
    console.error('Erro no teste:', err);
  } finally {
    await pool.end();
  }
}

test();
