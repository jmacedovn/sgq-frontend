const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./db');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Permitir payloads grandes por causa de imagens/base64

const JSONB_COLUMNS = new Set(['permissions', 'data', 'timestamps_etapas', 'items_manutencao', 'items_limpeza', 'fotos']);
const NUMERIC_COLUMNS = new Set([
  'peso_medio',
  'peso_carga',
  'qtd_madura_kg',
  'qtd_mesclada_kg',
  'qtd_verde_kg',
  'brix_1',
  'brix_2',
  'brix_3',
  'media_brix'
]);
const INTEGER_COLUMNS = new Set(['numero_ordem', 'quantidade_caixas', 'posicao_kanban']);
const TIMESTAMP_COLUMNS = new Set([
  'created_at',
  'horario_entrada',
  'horario_saida',
  'ultima_atualizacao',
  'horario_checklist',
  'timestamp'
]);

const REQUIRED_QUALITY_FIELDS = [
  'numero_ordem',
  'motorista',
  'placa',
  'produtor_rural',
  'tipo_fruta',
  'variedade',
  'horario_entrada',
  'horario_checklist',
  'peso_carga',
  'analise_maturacao',
  'prioridade',
  'qtd_madura_kg',
  'qtd_mesclada_kg',
  'qtd_verde_kg'
];

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
  }
}

const parseNumber = (key, value, integer = false) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new BadRequestError(`Valor numérico inválido no campo "${key}"`);
    }
    return integer ? Math.trunc(value) : value;
  }

  const raw = String(value).trim();
  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : raw;
  if (normalized === '') return null;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    throw new BadRequestError(`Valor numérico inválido no campo "${key}": ${value}`);
  }

  return integer ? Math.trunc(parsed) : parsed;
};

const normalizeTimestamp = (key, value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestError(`Data/hora inválida no campo "${key}": ${value}`);
  }

  return date.toISOString();
};

const normalizeQualityPayload = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return data;
  }

  const normalized = { ...data };
  const pesoCarga = parseNumber('peso_carga', normalized.peso_carga);
  const madura = parseNumber('qtd_madura_kg', normalized.qtd_madura_kg);
  const mesclada = parseNumber('qtd_mesclada_kg', normalized.qtd_mesclada_kg);
  const verde = parseNumber('qtd_verde_kg', normalized.qtd_verde_kg);

  normalized.peso_carga = pesoCarga;
  normalized.qtd_madura_kg = madura;
  normalized.qtd_mesclada_kg = mesclada;
  normalized.qtd_verde_kg = verde;

  const totalRateio = [madura, mesclada, verde].reduce((sum, value) => sum + (value || 0), 0);

  // A tela de check-in pode enviar o rateio em percentual. A tabela guarda kg.
  if (pesoCarga > 0 && totalRateio > 0 && totalRateio <= 100 && pesoCarga > 100) {
    normalized.qtd_madura_kg = Number(((pesoCarga * madura) / 100).toFixed(3));
    normalized.qtd_mesclada_kg = Number(((pesoCarga * mesclada) / 100).toFixed(3));
    normalized.qtd_verde_kg = Number(((pesoCarga * verde) / 100).toFixed(3));
  }

  REQUIRED_QUALITY_FIELDS.forEach((field) => {
    const value = normalized[field];
    if (value === null || value === undefined || value === '') {
      throw new BadRequestError(`Campo obrigatório ausente no check-in qualidade: "${field}"`);
    }
  });

  return normalized;
};

const normalizePayloadForTable = (table, data) => {
  const prepared = table === 'chkmatp_qualidade' ? normalizeQualityPayload(data) : { ...data };
  if (table === 'chkmatp_registros') {
    prepared.ultima_atualizacao = prepared.ultima_atualizacao || new Date().toISOString();
  }
  return prepared;
};

const normalizeValue = (key, value) => {
  if (!JSONB_COLUMNS.has(key) || value === null || value === undefined) {
    if (NUMERIC_COLUMNS.has(key)) {
      return parseNumber(key, value);
    }

    if (INTEGER_COLUMNS.has(key)) {
      return parseNumber(key, value, true);
    }

    if (TIMESTAMP_COLUMNS.has(key)) {
      return normalizeTimestamp(key, value);
    }

    return value === '' ? null : value;
  }

  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value));
    } catch (error) {
      throw new Error(`JSON inválido no campo "${key}"`);
    }
  }

  return JSON.stringify(value);
};

const placeholderFor = (key, index) => {
  const placeholder = `$${index + 1}`;
  return JSONB_COLUMNS.has(key) ? `${placeholder}::jsonb` : placeholder;
};

// Endpoint para buscar todos os registros (substitui supabase.from('view_all_records').select('*'))
app.get('/api/view_all_records', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM view_all_records ORDER BY timestamp DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar view_all_records:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message, stack: error.stack });
  }
});

// Endpoint genérico para SELECT (substitui supabase.from(table).select(...))
app.get('/api/:table', async (req, res) => {
  const { table } = req.params;
  
  let query = `SELECT * FROM "${table}"`;
  let values = [];
  let conditions = [];
  
  // Filtros simples
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (['limit', 'order', 'orderDirection'].includes(key)) return;
      values.push(req.query[key]);
      conditions.push(`"${key}" = $${values.length}`);
    });
  }
  
  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(' AND ');
  }
  
  if (req.query.order) {
    const direction = req.query.orderDirection === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY "${req.query.order}" ${direction}`;
  }
  
  if (req.query.limit) {
    values.push(parseInt(req.query.limit));
    query += ` LIMIT $${values.length}`;
  }
  
  try {
    const { rows } = await db.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error(`Erro ao buscar na tabela ${table}:`, error);
    res.status(500).json({ error: 'Erro na busca', details: error.message, stack: error.stack });
  }
});

// Endpoint genérico para INSERT (substitui supabase.from(table).insert(payload))
app.post('/api/:table', async (req, res) => {
  const { table } = req.params;
  const payload = req.body; // No frontend enviamos um array com 1 objeto: [supabasePayload]
  
  try {
    const data = normalizePayloadForTable(table, Array.isArray(payload) ? payload[0] : payload);
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({ error: 'Payload inválido para inserção' });
    }
    
    // Obter as chaves e valores
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return res.status(400).json({ error: 'Payload vazio para inserção' });
    }
    const values = keys.map(key => normalizeValue(key, data[key]));
    
    // Preparar a query dinamicamente
    const placeholders = keys.map((key, i) => placeholderFor(key, i)).join(', ');
    const query = `INSERT INTO "${table}" ("${keys.join('", "')}") VALUES (${placeholders}) RETURNING *`;
    
    const { rows } = await db.query(query, values);
    res.status(201).json(rows);
  } catch (error) {
    console.error(`Erro ao inserir na tabela ${table}:`, error);
    const status = error.statusCode || (error.code === '23505' ? 409 : ['23502', '22P02'].includes(error.code) ? 400 : 500);
    res.status(status).json({
      error: 'Erro ao inserir registro',
      details: error.detail || error.message,
      code: error.code,
      constraint: error.constraint
    });
  }
});

// Endpoint genérico para UPDATE (substitui supabase.from(table).update(payload).eq('id', id))
app.put('/api/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  
  try {
    const data = normalizePayloadForTable(table, req.body);
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return res.status(400).json({ error: 'Payload vazio para atualização' });
    }
    const values = keys.map(key => normalizeValue(key, data[key]));
    
    // Set clause: key1 = $1, key2 = $2...
    const setClause = keys.map((key, i) => `"${key}" = ${placeholderFor(key, i)}`).join(', ');
    const query = `UPDATE "${table}" SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    
    // Adicionar o ID no final do array de valores
    const { rows } = await db.query(query, [...values, id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    
    res.json(rows);
  } catch (error) {
    console.error(`Erro ao atualizar na tabela ${table}:`, error);
    const status = error.code === '23505' ? 409 : ['23502', '22P02'].includes(error.code) ? 400 : 500;
    res.status(status).json({
      error: 'Erro ao atualizar registro',
      details: error.detail || error.message,
      code: error.code,
      constraint: error.constraint
    });
  }
});

// Endpoint genérico para DELETE tudo (substitui supabase.from(table).delete().neq('id', '0'))
app.delete('/api/:table', async (req, res) => {
  const { table } = req.params;
  try {
    const query = `DELETE FROM "${table}" RETURNING *`;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error(`Erro ao deletar tudo da tabela ${table}:`, error);
    res.status(500).json({ error: 'Erro ao deletar registros', details: error.message });
  }
});

// Endpoint genérico para DELETE por ID (substitui supabase.from(table).delete().eq('id', id))
app.delete('/api/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  
  try {
    const query = `DELETE FROM "${table}" WHERE id = $1 RETURNING *`;
    const { rows } = await db.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    
    res.json(rows);
  } catch (error) {
    console.error(`Erro ao deletar da tabela ${table}:`, error);
    res.status(500).json({ error: 'Erro ao deletar registro', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend rodando na porta ${port}`);
});
