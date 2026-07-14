/**
 * Backup completo dos dados do Supabase para arquivos JSON locais.
 *
 * - Descobre TODAS as tabelas automaticamente (via OpenAPI do PostgREST),
 *   entao continua funcionando mesmo que voce crie tabelas novas.
 * - Salva cada tabela num arquivo JSON dentro de /backups/backup-DATA-HORA/
 * - Usa paginacao, entao funciona mesmo com milhares de registros.
 *
 * Uso:  a partir da pasta backend/ ->  node scripts/backup.js
 * Ou pelo atalho:  backup.bat  (na raiz do projeto)
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!URL || !KEY) {
  console.error('\n[ERRO] Faltam SUPABASE_URL / SUPABASE_SERVICE_KEY no arquivo backend/.env\n');
  process.exit(1);
}

const supabase = createClient(URL, KEY);
const PAGE = 1000;

function pad(n) { return String(n).padStart(2, '0'); }
function timestamp() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

async function descobrirTabelas() {
  const res = await fetch(URL + '/rest/v1/', { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY } });
  const spec = await res.json();
  const defs = spec.definitions || (spec.components && spec.components.schemas) || {};
  return Object.keys(defs);
}

async function baixarTabela(tabela) {
  let todos = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase.from(tabela).select('*').range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    todos = todos.concat(data);
    if (!data || data.length < PAGE) break;
    from += PAGE;
  }
  return todos;
}

(async () => {
  console.log('\n=== Backup FuelTrack ===');
  const destino = path.join(__dirname, '..', '..', 'backups', 'backup-' + timestamp());
  fs.mkdirSync(destino, { recursive: true });

  const tabelas = await descobrirTabelas();
  const resumo = {};
  let total = 0;

  for (const t of tabelas) {
    try {
      const linhas = await baixarTabela(t);
      fs.writeFileSync(path.join(destino, t + '.json'), JSON.stringify(linhas, null, 2));
      resumo[t] = linhas.length;
      total += linhas.length;
      console.log(`  [ok] ${t.padEnd(20)} ${linhas.length} registros`);
    } catch (e) {
      resumo[t] = 'ERRO: ' + e.message;
      console.log(`  [!!] ${t.padEnd(20)} ${e.message}`);
    }
  }

  fs.writeFileSync(path.join(destino, '_resumo.json'),
    JSON.stringify({ data: new Date().toISOString(), total_registros: total, tabelas: resumo }, null, 2));

  console.log(`\nConcluido: ${total} registros salvos em:\n  ${destino}\n`);
})().catch((e) => { console.error('\n[FALHOU]', e.message, '\n'); process.exit(1); });
