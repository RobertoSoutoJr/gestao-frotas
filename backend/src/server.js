require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Rota de Teste: Listar todos os caminhões
app.get('/caminhoes', async (req, res) => {
  const { data, error } = await supabase
    .from('caminhoes')
    .select('*');

  if (error) return res.status(400).json(error);
  res.json(data);
});

// Rota para cadastrar um novo caminhão
app.post('/caminhoes', async (req, res) => {
  // Pegamos os dados que o frontend enviou no corpo da requisição
  const { placa, modelo, ano, km_atual, capacidade_silo_ton } = req.body;

  // Comando para inserir no Supabase
  const { data, error } = await supabase
    .from('caminhoes')
    .insert([
      { placa, modelo, ano, km_atual, capacidade_silo_ton }
    ])
    .select(); // O .select() retorna o objeto que acabou de ser criado

  if (error) {
    return res.status(400).json({ mensagem: 'Erro ao cadastrar', detalhe: error });
  }

  res.status(201).json(data);
});

// Rota para cadastrar um novo motorista
app.post('/motoristas', async (req, res) => {
  const { nome, cpf, telefone } = req.body;

  const { data, error } = await supabase
    .from('motoristas')
    .insert([
      { nome, cpf, telefone }
    ])
    .select();

  if (error) {
    return res.status(400).json({ mensagem: 'Erro ao cadastrar motorista', detalhe: error });
  }

  res.status(201).json(data);
});

// Rota para listar todos os motoristas
app.get('/motoristas', async (req, res) => {
  const { data, error } = await supabase
    .from('motoristas')
    .select('*');

  if (error) return res.status(400).json(error);
  res.json(data);
});


// Rota para registrar um abastecimento
app.post('/abastecimentos', async (req, res) => {
  const { 
    caminhao_id, 
    motorista_id, 
    km_registro, 
    litros, 
    valor_total, 
    posto 
  } = req.body;

  const { data, error } = await supabase
    .from('abastecimentos')
    .insert([
      { caminhao_id, motorista_id, km_registro, litros, valor_total, posto }
    ])
    .select();

  if (error) {
    return res.status(400).json({ mensagem: 'Erro ao registrar abastecimento', detalhe: error });
  }

  // BÔNUS: Vamos atualizar a quilometragem atual do caminhão automaticamente?
  // Isso mantém seu cadastro de caminhões sempre em dia.
  await supabase
    .from('caminhoes')
    .update({ km_atual: km_registro })
    .eq('id', caminhao_id);

  res.status(201).json(data);
});


// Rota para registrar uma manutenção
app.post('/manutencoes', async (req, res) => {
  const { 
    caminhao_id, 
    descricao, 
    tipo_manutencao, // Ex: 'Preventiva', 'Corretiva', 'Pneus'
    valor_total, 
    km_manutencao, 
    data_manutencao 
  } = req.body;

  const { data, error } = await supabase
    .from('manutencoes')
    .insert([
      { caminhao_id, descricao, tipo_manutencao, valor_total, km_manutencao, data_manutencao }
    ])
    .select();

  if (error) {
    return res.status(400).json({ mensagem: 'Erro ao registrar manutenção', detalhe: error });
  }

  // Atualiza o KM do caminhão para refletir o momento da manutenção
  await supabase
    .from('caminhoes')
    .update({ km_atual: km_manutencao })
    .eq('id', caminhao_id);

  res.status(201).json(data);
});


// Listar todos os abastecimentos
app.get('/abastecimentos', async (req, res) => {
  const { data, error } = await supabase.from('abastecimentos').select('*');
  if (error) return res.status(400).json(error);
  res.json(data);
});

// Listar todas as manutenções
app.get('/manutencoes', async (req, res) => {
  const { data, error } = await supabase.from('manutencoes').select('*');
  if (error) return res.status(400).json(error);
  res.json(data);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Rodando em: http://localhost:${PORT}`));