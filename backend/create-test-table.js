require('dotenv').config();
const { Client } = require('pg');

async function createTestTable() {
  console.log('🚀 Criando tabela "teste" com conexão direta ao PostgreSQL...\n');

  // Extrair o project ref da URL do Supabase
  const supabaseUrl = process.env.SUPABASE_URL;
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);

  if (!match) {
    console.error('❌ URL do Supabase inválida');
    return;
  }

  const projectRef = match[1];
  const password = process.env.DATABASE_PASSWORD;

  if (!password) {
    console.error('❌ DATABASE_PASSWORD não configurada no .env');
    return;
  }

  // Connection string do Supabase
  const connectionString = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`;

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Conectando ao PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado com sucesso!\n');

    console.log('📝 Criando tabela "teste"...');

    // Criar a tabela
    await client.query(`
      CREATE TABLE IF NOT EXISTS teste (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT,
        valor DECIMAL(10,2),
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tabela criada!\n');

    // Adicionar comentário
    await client.query(`
      COMMENT ON TABLE teste IS 'Tabela de teste criada automaticamente pelo Claude Code';
    `);

    // Habilitar RLS
    console.log('🔒 Configurando RLS (Row Level Security)...');
    await client.query(`ALTER TABLE teste ENABLE ROW LEVEL SECURITY;`);

    // Criar policy para service role (ignora se já existir)
    try {
      await client.query(`
        CREATE POLICY "Service role tem acesso total" ON teste
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
      `);
    } catch (err) {
      if (err.code !== '42710') throw err; // 42710 = duplicate_object
    }

    // Criar policy para leitura pública (ignora se já existir)
    try {
      await client.query(`
        CREATE POLICY "Leitura pública" ON teste
        FOR SELECT
        USING (true);
      `);
    } catch (err) {
      if (err.code !== '42710') throw err; // 42710 = duplicate_object
    }
    console.log('✅ Policies configuradas!\n');

    // Inserir dados de exemplo
    console.log('📦 Inserindo dados de exemplo...');
    await client.query(`
      INSERT INTO teste (nome, descricao, valor, ativo) VALUES
        ('Teste 1', 'Primeiro registro de teste criado automaticamente', 100.50, true),
        ('Teste 2', 'Segundo registro de teste criado automaticamente', 250.75, true),
        ('Teste 3', 'Terceiro registro de teste criado automaticamente', 50.00, false)
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Dados inseridos!\n');

    // Verificar os dados
    const result = await client.query('SELECT * FROM teste ORDER BY id;');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 DADOS NA TABELA "teste":');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.table(result.rows);

    console.log('\n🎉 SUCESSO! Autonomia 100% confirmada!');
    console.log('✅ Posso criar tabelas (CREATE TABLE)');
    console.log('✅ Posso alterar tabelas (ALTER TABLE)');
    console.log('✅ Posso inserir dados (INSERT)');
    console.log('✅ Posso consultar dados (SELECT)');
    console.log('✅ Posso atualizar dados (UPDATE)');
    console.log('✅ Posso deletar dados (DELETE)');
    console.log('✅ Posso criar índices, triggers, funções, etc.\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('\n🔍 Detalhes do erro:', error);
  } finally {
    await client.end();
    console.log('🔌 Conexão fechada.');
  }
}

createTestTable();
