import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  // --- 1. ESTADOS DE NAVEGAÇÃO E DADOS ---
  const [abaAtiva, setAbaAtiva] = useState('caminhoes')
  const [tipoLancamento, setTipoLancamento] = useState('abastecimento')
  
  const [caminhoes, setCaminhoes] = useState([])
  const [motoristas, setMotoristas] = useState([])
  const [listaAbast, setListaAbast] = useState([])
  const [listaManut, setListaManut] = useState([])

  // --- 2. ESTADOS DOS FORMULÁRIOS ---
  const [formCaminhao, setFormCaminhao] = useState({ placa: '', modelo: '', ano: '', km_atual: '', capacidade_silo_ton: '' })
  const [formMotorista, setFormMotorista] = useState({ nome: '', cpf: '', telefone: '' })
  const [formAbast, setFormAbast] = useState({ caminhao_id: '', motorista_id: '', km_registro: '', litros: '', valor_total: '', posto: '' })
  const [formManut, setFormManut] = useState({ caminhao_id: '', descricao: '', tipo_manutencao: 'Preventiva', valor_total: '', km_manutencao: '', data_manutencao: '' })

  // --- 3. BUSCA DE DADOS NO BACKEND ---
  const buscarDados = async () => {
    try {
      const [resCam, resMot, resAbast, resManut] = await Promise.all([
        axios.get('http://localhost:3001/caminhoes'),
        axios.get('http://localhost:3001/motoristas'),
        axios.get('http://localhost:3001/abastecimentos'),
        axios.get('http://localhost:3001/manutencoes')
      ])
      setCaminhoes(resCam.data)
      setMotoristas(resMot.data)
      setListaAbast(resAbast.data)
      setListaManut(resManut.data)
    } catch (err) {
      console.error("Erro ao sincronizar com o servidor:", err)
    }
  }

  useEffect(() => { buscarDados() }, [])

  // --- 4. FUNÇÕES DE ENVIO (SUBMITS) ---
  const handleCaminhaoSubmit = async (e) => {
    e.preventDefault()
    await axios.post('http://localhost:3001/caminhoes', formCaminhao)
    alert('🚚 Caminhão cadastrado!')
    setFormCaminhao({ placa: '', modelo: '', ano: '', km_atual: '', capacidade_silo_ton: '' })
    buscarDados()
  }

  const handleMotoristaSubmit = async (e) => {
    e.preventDefault()
    await axios.post('http://localhost:3001/motoristas', formMotorista)
    alert('👤 Motorista cadastrado!')
    setFormMotorista({ nome: '', cpf: '', telefone: '' })
    buscarDados()
  }

  const handleAbastSubmit = async (e) => {
    e.preventDefault()
    const dados = { ...formAbast, caminhao_id: Number(formAbast.caminhao_id), motorista_id: Number(formAbast.motorista_id), km_registro: Number(formAbast.km_registro), litros: Number(formAbast.litros), valor_total: Number(formAbast.valor_total) }
    await axios.post('http://localhost:3001/abastecimentos', dados)
    alert('⛽ Abastecimento registrado!')
    setFormAbast({ caminhao_id: '', motorista_id: '', km_registro: '', litros: '', valor_total: '', posto: '' })
    buscarDados()
  }

  const handleManutSubmit = async (e) => {
    e.preventDefault()
    const dados = { ...formManut, caminhao_id: Number(formManut.caminhao_id), valor_total: Number(formManut.valor_total), km_manutencao: Number(formManut.km_manutencao) }
    await axios.post('http://localhost:3001/manutencoes', dados)
    alert('🔧 Manutenção registrada!')
    setFormManut({ caminhao_id: '', descricao: '', tipo_manutencao: 'Preventiva', valor_total: '', km_manutencao: '', data_manutencao: '' })
    buscarDados()
  }

  // --- 5. RENDERIZAÇÃO DA INTERFACE ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-5xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Frota Silos <span className="text-blue-600">Pro</span></h1>
          <p className="text-slate-500 mt-2">Controle financeiro e operacional de milho</p>
        </header>

        {/* Menu de Navegação Superior */}
        <nav className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          {[
            { id: 'caminhoes', label: '🚚 Caminhões' },
            { id: 'motoristas', label: '👤 Motoristas' },
            { id: 'financeiro', label: '💰 Lançamentos' },
            { id: 'relatorios', label: '📊 Relatórios' }
          ].map(aba => (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${abaAtiva === aba.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {aba.label}
            </button>
          ))}
        </nav>

        <main className="bg-white shadow-2xl shadow-slate-200/50 rounded-2xl p-6 border border-slate-100">
          
          {/* TELA: CAMINHÕES */}
          {abaAtiva === 'caminhoes' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold mb-6">Gerenciar Frota</h2>
              <form onSubmit={handleCaminhaoSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <input className="p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Placa (Ex: AAA-0000)" value={formCaminhao.placa} onChange={e => setFormCaminhao({...formCaminhao, placa: e.target.value})} required />
                <input className="p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Modelo do Caminhão" value={formCaminhao.modelo} onChange={e => setFormCaminhao({...formCaminhao, modelo: e.target.value})} required />
                <button className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">Cadastrar Veículo</button>
              </form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caminhoes.map(c => (
                  <div key={c.id} className="p-4 border border-slate-200 rounded-xl flex justify-between items-center hover:border-blue-300 transition">
                    <div><p className="font-bold text-lg">{c.placa}</p><p className="text-slate-500 text-sm">{c.modelo}</p></div>
                    <div className="text-right"><p className="text-blue-600 font-mono font-bold">{c.km_atual} KM</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TELA: MOTORISTAS */}
          {abaAtiva === 'motoristas' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold mb-6">Equipe de Motoristas</h2>
              <form onSubmit={handleMotoristaSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <input className="p-3 rounded-lg border border-slate-300 outline-none" placeholder="Nome Completo" value={formMotorista.nome} onChange={e => setFormMotorista({...formMotorista, nome: e.target.value})} required />
                <input className="p-3 rounded-lg border border-slate-300 outline-none" placeholder="CPF" value={formMotorista.cpf} onChange={e => setFormMotorista({...formMotorista, cpf: e.target.value})} required />
                <button className="md:col-span-3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition">Adicionar Motorista</button>
              </form>
              <ul className="space-y-3">
                {motoristas.map(m => <li key={m.id} className="p-4 bg-white border border-slate-200 rounded-xl flex justify-between shadow-sm"><strong>{m.nome}</strong> <span className="text-slate-400 font-mono text-sm">{m.cpf}</span></li>)}
              </ul>
            </div>
          )}

          {/* TELA: FINANCEIRO (LANÇAMENTOS) */}
          {abaAtiva === 'financeiro' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex bg-slate-100 p-1 rounded-lg mb-8 max-w-md mx-auto">
                <button onClick={() => setTipoLancamento('abastecimento')} className={`flex-1 py-2 rounded-md font-bold transition ${tipoLancamento === 'abastecimento' ? 'bg-white text-orange-600 shadow' : 'text-slate-500'}`}>⛽ Abastecer</button>
                <button onClick={() => setTipoLancamento('manutencao')} className={`flex-1 py-2 rounded-md font-bold transition ${tipoLancamento === 'manutencao' ? 'bg-white text-red-600 shadow' : 'text-slate-500'}`}>🔧 Manutenção</button>
              </div>

              {tipoLancamento === 'abastecimento' ? (
                <form onSubmit={handleAbastSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50/50 p-8 rounded-2xl border border-orange-100">
                  <select className="p-3 rounded-lg border border-orange-200 bg-white" value={formAbast.caminhao_id} onChange={e => setFormAbast({...formAbast, caminhao_id: e.target.value})} required>
                    <option value="">Selecione o Caminhão</option>
                    {caminhoes.map(c => <option key={c.id} value={c.id}>{c.placa}</option>)}
                  </select>
                  <select className="p-3 rounded-lg border border-orange-200 bg-white" value={formAbast.motorista_id} onChange={e => setFormAbast({...formAbast, motorista_id: e.target.value})} required>
                    <option value="">Selecione o Motorista</option>
                    {motoristas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                  </select>
                  <input className="p-3 rounded-lg border border-orange-200 bg-white" type="number" placeholder="KM no ato" value={formAbast.km_registro} onChange={e => setFormAbast({...formAbast, km_registro: e.target.value})} required />
                  <input className="p-3 rounded-lg border border-orange-200 bg-white" type="number" step="0.01" placeholder="Litros" value={formAbast.litros} onChange={e => setFormAbast({...formAbast, litros: e.target.value})} required />
                  <input className="p-3 rounded-lg border border-orange-200 bg-white" type="number" step="0.01" placeholder="Valor Total (R$)" value={formAbast.valor_total} onChange={e => setFormAbast({...formAbast, valor_total: e.target.value})} required />
                  <input className="p-3 rounded-lg border border-orange-200 bg-white" placeholder="Posto / Local" value={formAbast.posto} onChange={e => setFormAbast({...formAbast, posto: e.target.value})} />
                  <button className="md:col-span-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 transition">Registrar Abastecimento</button>
                </form>
              ) : (
                <form onSubmit={handleManutSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-red-50/50 p-8 rounded-2xl border border-red-100">
                  <select className="p-3 rounded-lg border border-red-200 bg-white" value={formManut.caminhao_id} onChange={e => setFormManut({...formManut, caminhao_id: e.target.value})} required>
                    <option value="">Selecione o Caminhão</option>
                    {caminhoes.map(c => <option key={c.id} value={c.id}>{c.placa}</option>)}
                  </select>
                  <input className="p-3 rounded-lg border border-red-200 bg-white" placeholder="O que foi feito? (Descrição)" value={formManut.descricao} onChange={e => setFormManut({...formManut, descricao: e.target.value})} required />
                  <input className="p-3 rounded-lg border border-red-200 bg-white" type="number" placeholder="Valor Total (R$)" value={formManut.valor_total} onChange={e => setFormManut({...formManut, valor_total: e.target.value})} required />
                  <input className="p-3 rounded-lg border border-red-200 bg-white" type="number" placeholder="KM da Manutenção" value={formManut.km_manutencao} onChange={e => setFormManut({...formManut, km_manutencao: e.target.value})} required />
                  <input className="p-3 rounded-lg border border-red-200 bg-white md:col-span-2" type="date" value={formManut.data_manutencao} onChange={e => setFormManut({...formManut, data_manutencao: e.target.value})} required />
                  <button className="md:col-span-2 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 transition">Salvar Manutenção</button>
                </form>
              )}
            </div>
          )}

          {/* TELA: RELATÓRIOS (SOMA DOS GASTOS) */}
          {abaAtiva === 'relatorios' && (
            <div className="animate-in slide-in-from-bottom duration-500">
              <h2 className="text-2xl font-bold mb-6">Desempenho Financeiro</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {caminhoes.map(c => {
                  const totalComb = listaAbast.filter(a => a.caminhao_id === c.id).reduce((s, a) => s + Number(a.valor_total), 0)
                  const totalManut = listaManut.filter(m => m.caminhao_id === c.id).reduce((s, m) => s + Number(m.valor_total), 0)
                  const totalGeral = totalComb + totalManut

                  return (
                    <div key={c.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
                      <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                        <span className="font-bold text-xl">{c.placa}</span>
                        <span className="text-slate-400 text-xs uppercase tracking-widest">{c.modelo}</span>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="flex justify-between items-center"><span className="text-slate-500">⛽ Combustível</span><span className="font-bold text-orange-600">R$ {totalComb.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-500">🔧 Manutenção</span><span className="font-bold text-red-600">R$ {totalManut.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                        <div className="pt-4 border-t flex justify-between items-center font-black text-lg"><span className="text-slate-900 text-xl">Total</span><span className="text-blue-700">R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                        <div className="mt-4 bg-slate-50 p-2 rounded text-center text-xs text-slate-400">Rodagem Atual: <strong>{c.km_atual} KM</strong></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default App