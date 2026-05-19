-- ============================================================================
-- SCRIPT SQL - Checkin Matéria Prima (ADAPTADO PARA SGQ)
-- ============================================================================

-- Ativar extensões necessárias para UUID, caso não existam
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. DROP DAS TABELAS EXISTENTES (Apenas as do sistema Check-in)
-- ============================================================================
DROP TABLE IF EXISTS public.chkmatp_inspecoes CASCADE;
DROP TABLE IF EXISTS public.chkmatp_qualidade CASCADE;
DROP TABLE IF EXISTS public.chkmatp_registros CASCADE;
DROP TABLE IF EXISTS public.chkmatp_usuarios CASCADE;
DROP TABLE IF EXISTS public.chkmatp_frutas CASCADE;
DROP TABLE IF EXISTS public.chkmatp_embalagens CASCADE;
DROP TABLE IF EXISTS public.chkmatp_motoristas CASCADE;

-- ============================================================================
-- 2. CRIAÇÃO DAS TABELAS
-- ============================================================================

-- Tabela de Usuários específica do Check-in
CREATE TABLE public.chkmatp_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  nome TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'operator')),
  permissions JSONB DEFAULT '[]'::jsonb
);

-- Tabela de Frutas (Prefixada para não conflitar com a 'fruits' do SGQ)
CREATE TABLE public.chkmatp_frutas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE
);

-- Tabela de Embalagens
CREATE TABLE public.chkmatp_embalagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  peso_medio NUMERIC NOT NULL
);

-- Tabela de Motoristas
CREATE TABLE public.chkmatp_motoristas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  telefone TEXT NOT NULL,
  data_nascimento TEXT NOT NULL,
  cep TEXT NOT NULL,
  logradouro TEXT NOT NULL,
  numero TEXT NOT NULL,
  complemento TEXT,
  bairro TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  foto_base64 TEXT NOT NULL
);

-- Tabela de Registros de Check-in
CREATE TABLE public.chkmatp_registros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_ordem INTEGER NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL,
  telefone TEXT NOT NULL,
  foto_base64 TEXT NOT NULL,
  horario_entrada TIMESTAMP WITH TIME ZONE NOT NULL,
  horario_saida TIMESTAMP WITH TIME ZONE,
  ultima_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL,
  placa_veiculo TEXT NOT NULL,
  produtor_rural TEXT NOT NULL,
  tipo_fruta TEXT NOT NULL,
  status TEXT NOT NULL,
  timestamps_etapas JSONB NOT NULL DEFAULT '{}'::jsonb,
  quantidade_caixas INTEGER DEFAULT 0,
  posicao_kanban INTEGER,
  variedade TEXT,
  tipo_embalagem TEXT,
  regiao TEXT,
  brix TEXT
);

-- Tabela de Inspeções
CREATE TABLE public.chkmatp_inspecoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  numero_ordem INTEGER,
  tipo TEXT NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA')),
  data TEXT NOT NULL,
  motorista TEXT NOT NULL,
  placa TEXT NOT NULL,
  marca_modelo TEXT NOT NULL,
  produtor_rural TEXT NOT NULL,
  turno TEXT NOT NULL,
  km TEXT NOT NULL,
  items_manutencao JSONB NOT NULL DEFAULT '[]'::jsonb,
  items_limpeza JSONB NOT NULL DEFAULT '[]'::jsonb,
  nao_conformidades TEXT,
  assinatura_motorista TEXT NOT NULL,
  assinatura_lider TEXT NOT NULL,
  fotos JSONB DEFAULT '[]'::jsonb
);

-- Tabela de Qualidade
CREATE TABLE public.chkmatp_qualidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  numero_ordem INTEGER NOT NULL,
  motorista TEXT NOT NULL,
  placa TEXT NOT NULL,
  produtor_rural TEXT NOT NULL,
  tipo_fruta TEXT NOT NULL,
  variedade TEXT NOT NULL,
  horario_entrada TIMESTAMP WITH TIME ZONE NOT NULL,
  horario_checklist TIMESTAMP WITH TIME ZONE NOT NULL,
  peso_carga NUMERIC NOT NULL,
  analise_maturacao TEXT NOT NULL,
  prioridade TEXT NOT NULL,
  qtd_madura_kg NUMERIC NOT NULL,
  qtd_mesclada_kg NUMERIC NOT NULL,
  qtd_verde_kg NUMERIC NOT NULL,
  brix_1 NUMERIC,
  brix_2 NUMERIC,
  brix_3 NUMERIC,
  media_brix NUMERIC,
  fotos JSONB DEFAULT '[]'::jsonb,
  observacoes TEXT,
  assinatura_digital TEXT
);

-- ============================================================================
-- 3. INSERÇÃO DE DADOS INICIAIS
-- ============================================================================

INSERT INTO public.chkmatp_usuarios (usuario, senha, nome, role, permissions) 
VALUES (
  'admin', 
  'admin', 
  'Administrador Checkin', 
  'admin', 
  '["dashboard", "reports", "users", "config", "checklist", "kanban", "quality"]'::jsonb
) ON CONFLICT (usuario) DO NOTHING;

-- ============================================================================
-- 4. PRIVILÉGIOS (Adaptados para ambiente local)
-- ============================================================================

-- Se estiver usando Supabase, descomente as linhas abaixo:
-- GRANT ALL ON TABLE public.chkmatp_usuarios TO anon, authenticated;
-- GRANT ALL ON TABLE public.chkmatp_frutas TO anon, authenticated;
-- GRANT ALL ON TABLE public.chkmatp_embalagens TO anon, authenticated;
-- GRANT ALL ON TABLE public.chkmatp_motoristas TO anon, authenticated;
-- GRANT ALL ON TABLE public.chkmatp_registros TO anon, authenticated;
-- GRANT ALL ON TABLE public.chkmatp_inspecoes TO anon, authenticated;
-- GRANT ALL ON TABLE public.chkmatp_qualidade TO anon, authenticated;

-- Para PostgreSQL local, os privilégios geralmente são gerenciados pelo dono do banco (dratini).
