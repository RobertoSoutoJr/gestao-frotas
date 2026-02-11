require('dotenv').config();
const { Client } = require('pg');

async function runMigration() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  const projectRef = match[1];
  const password = process.env.DATABASE_PASSWORD;

  const connectionString = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔌 Conectado ao PostgreSQL\n');

    console.log('📝 Criando tabela de usuários...');

    // Criar tabela de usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        empresa VARCHAR(100),
        telefone VARCHAR(20),
        avatar_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tabela users criada!\n');

    // Criar índices
    console.log('📊 Criando índices...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);`);
    console.log('✅ Índices criados!\n');

    // Adicionar RLS
    console.log('🔒 Configurando RLS para users...');
    await client.query(`ALTER TABLE users ENABLE ROW LEVEL SECURITY;`);

    try {
      await client.query(`
        CREATE POLICY "Users podem ver apenas seus próprios dados" ON users
        FOR SELECT
        USING (auth.uid()::text::int = id);
      `);
    } catch (err) {
      if (err.code !== '42710') throw err;
    }

    try {
      await client.query(`
        CREATE POLICY "Service role tem acesso total" ON users
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
      `);
    } catch (err) {
      if (err.code !== '42710') throw err;
    }
    console.log('✅ RLS configurado!\n');

    // Adicionar user_id às tabelas existentes
    console.log('🔄 Adicionando multi-tenancy às tabelas existentes...\n');

    const tables = ['caminhoes', 'motoristas', 'abastecimentos', 'manutencoes'];

    for (const table of tables) {
      console.log(`  📋 Processando tabela: ${table}`);

      // Adicionar coluna user_id se não existir
      try {
        await client.query(`
          ALTER TABLE ${table}
          ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
        `);
        console.log(`    ✅ Coluna user_id adicionada`);
      } catch (err) {
        console.log(`    ⚠️  Coluna user_id já existe`);
      }

      // Criar índice
      try {
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_${table}_user_id ON ${table}(user_id);
        `);
        console.log(`    ✅ Índice criado`);
      } catch (err) {
        console.log(`    ⚠️  Índice já existe`);
      }

      // Atualizar RLS
      await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);

      try {
        await client.query(`
          CREATE POLICY "Users veem apenas seus dados" ON ${table}
          FOR SELECT
          USING (auth.uid()::text::int = user_id);
        `);
      } catch (err) {
        if (err.code !== '42710') console.log(`    ⚠️  Policy SELECT já existe`);
      }

      try {
        await client.query(`
          CREATE POLICY "Users inserem com seu user_id" ON ${table}
          FOR INSERT
          WITH CHECK (auth.uid()::text::int = user_id);
        `);
      } catch (err) {
        if (err.code !== '42710') console.log(`    ⚠️  Policy INSERT já existe`);
      }

      try {
        await client.query(`
          CREATE POLICY "Users atualizam apenas seus dados" ON ${table}
          FOR UPDATE
          USING (auth.uid()::text::int = user_id)
          WITH CHECK (auth.uid()::text::int = user_id);
        `);
      } catch (err) {
        if (err.code !== '42710') console.log(`    ⚠️  Policy UPDATE já existe`);
      }

      try {
        await client.query(`
          CREATE POLICY "Users deletam apenas seus dados" ON ${table}
          FOR DELETE
          USING (auth.uid()::text::int = user_id);
        `);
      } catch (err) {
        if (err.code !== '42710') console.log(`    ⚠️  Policy DELETE já existe`);
      }

      try {
        await client.query(`
          CREATE POLICY "Service role acesso total" ON ${table}
          FOR ALL
          TO service_role
          USING (true)
          WITH CHECK (true);
        `);
      } catch (err) {
        if (err.code !== '42710') console.log(`    ⚠️  Policy service role já existe`);
      }

      console.log(`    ✅ RLS configurado\n`);
    }

    // Criar tabela de sessions para JWT
    console.log('📝 Criando tabela de sessões...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        refresh_token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        ip_address VARCHAR(50),
        user_agent TEXT
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON user_sessions(refresh_token);`);
    console.log('✅ Tabela user_sessions criada!\n');

    console.log('🎉 Migração concluída com sucesso!');
    console.log('\n📊 Resumo:');
    console.log('  ✅ Tabela users criada');
    console.log('  ✅ Tabela user_sessions criada');
    console.log('  ✅ Multi-tenancy implementado em 4 tabelas');
    console.log('  ✅ RLS configurado para todas as tabelas');
    console.log('  ✅ Índices criados para performance\n');

  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

runMigration();
