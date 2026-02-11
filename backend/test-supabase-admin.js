require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testConnection() {
  console.log('🔄 Testando conexão com Supabase (Service Key)...\n');

  try {
    // Tenta listar as tabelas
    const { data, error } = await supabaseAdmin
      .from('caminhoes')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Erro ao conectar:', error.message);
      console.log('\n⚠️  A chave pode estar incorreta ou incompleta.');
      console.log('💡 Service Role Keys do Supabase geralmente são JWTs longos que começam com "eyJ..."');
    } else {
      console.log('✅ Conexão bem-sucedida!');
      console.log('✅ Tenho acesso administrativo ao banco!');
      console.log('\n🚀 Autonomia 100% ativada!');
    }
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

testConnection();
