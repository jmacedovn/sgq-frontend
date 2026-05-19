-- SCRIPT DE MIGRAÇÃO DE DADOS: records -> tabelas especializadas
-- Este script move os dados da tabela unificada para as tabelas individuais de cada formulário.

DO $$
DECLARE
    r RECORD;
    target_table TEXT;
    migrated_count INTEGER := 0;
    skipped_count INTEGER := 0;
BEGIN
    
    FOR r IN SELECT * FROM records LOOP
        
        target_table := replace(r.form_type, '-', '_');
        
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = target_table) THEN
            
            
            EXECUTE format('
                INSERT INTO %I (id, user_id, user_name, timestamp, data, sync_status)
                VALUES (%L, %L, %L, %L, %L, %L)
                ON CONFLICT (id) DO UPDATE SET
                    user_id = EXCLUDED.user_id,
                    user_name = EXCLUDED.user_name,
                    timestamp = EXCLUDED.timestamp,
                    data = EXCLUDED.data,
                    sync_status = EXCLUDED.sync_status;
            ', target_table, r.id, r.user_id, r.user_name, r.timestamp, r.data, r.sync_status);
            
            migrated_count := migrated_count + 1;
        ELSE
            RAISE NOTICE 'Aviso: Tabela % não encontrada. Registro % não migrado.', target_table, r.id;
            skipped_count := skipped_count + 1;
        END IF;
    END FOR;

    RAISE NOTICE 'Migração concluída: % registros migrados, % ignorados.', migrated_count, skipped_count;
END $$;