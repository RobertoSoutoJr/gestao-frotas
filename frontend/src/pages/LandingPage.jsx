import { useNavigate } from 'react-router-dom';
import { Fuel, Truck, Route, BarChart3, Shield, Smartphone, ArrowRight, Check } from 'lucide-react';

const FEATURES = [
  {
    icon: Truck,
    title: 'Gestao de Frota',
    description: 'Controle caminhoes, motoristas, abastecimentos e manutencoes em um so lugar.',
  },
  {
    icon: Route,
    title: 'Rotas Inteligentes',
    description: 'Visualize rotas reais no mapa, capture GPS no campo e acompanhe viagens em tempo real.',
  },
  {
    icon: BarChart3,
    title: 'Relatorios e DRE',
    description: 'Fluxo de caixa, rentabilidade por cliente, custo por km e exportacao em PDF/Excel.',
  },
  {
    icon: Shield,
    title: 'Alertas Automaticos',
    description: 'Notificacoes de CNH vencendo, licenciamento, revisao por km e consumo anomalo.',
  },
  {
    icon: Smartphone,
    title: 'App Instalavel (PWA)',
    description: 'Funciona no celular como app nativo, com captura GPS offline em fazendas sem internet.',
  },
  {
    icon: Fuel,
    title: 'Controle Financeiro',
    description: 'Estoque com pagamento parcial, cheques, e dashboard com visao completa do negocio.',
  },
];

const PLANS = [
  {
    name: 'Starter',
    price: 'Gratis',
    period: '',
    description: 'Para quem esta comecando',
    features: ['Ate 5 caminhoes', 'Dashboard completo', 'Relatorios basicos', 'App PWA'],
    highlight: false,
  },
  {
    name: 'Pro',
    price: 'R$ 97',
    period: '/mes',
    description: 'Para frotas em crescimento',
    features: ['Caminhoes ilimitados', 'Rotas com GPS', 'Alertas push', 'Exportacao PDF/Excel', 'Contas de motorista', 'Suporte prioritario'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    period: '',
    description: 'Para grandes operacoes',
    features: ['Tudo do Pro', 'API para integracoes', 'Multi-empresa', 'SLA dedicado', 'Implantacao assistida'],
    highlight: false,
  },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5E6AD2]/15 border border-[#5E6AD2]/25">
              <Fuel className="h-4 w-4 text-[#5E6AD2]" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-white">Fuel</span>
              <span className="text-[#5E6AD2]">Track</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate('/auth?register=1')}
              className="px-5 py-2 text-sm font-medium bg-[#5E6AD2] hover:bg-[#4F5BC3] text-white rounded-xl transition-colors"
            >
              Criar conta gratis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#5E6AD2]/8 via-transparent to-transparent" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(94,106,210,0.12) 0%, transparent 60%)' }} />

        <div className="relative container mx-auto px-4 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5E6AD2]/20 bg-[#5E6AD2]/10 px-4 py-1.5 text-xs font-medium text-[#5E6AD2] mb-8">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5E6AD2] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#5E6AD2]"></span></span>
            Novo: Rotas reais com GPS offline
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Gestao de frotas{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5E6AD2] to-[#8B5CF6]">
              simples e inteligente
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            Controle sua frota de caminhoes, viagens, abastecimentos e financeiro em um unico sistema.
            Feito para transportadoras que querem crescer.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/auth?register=1')}
              className="group flex items-center gap-2 px-8 py-3.5 text-base font-semibold bg-[#5E6AD2] hover:bg-[#4F5BC3] text-white rounded-xl transition-all shadow-lg shadow-[#5E6AD2]/25 hover:shadow-[#5E6AD2]/40"
            >
              Comece gratis agora
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="px-8 py-3.5 text-base font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all"
            >
              Ja tenho conta
            </button>
          </div>

          <p className="mt-6 text-sm text-white/30">
            Sem cartao de credito. Comece em 30 segundos.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Tudo que voce precisa para{' '}
              <span className="text-[#5E6AD2]">gerenciar sua frota</span>
            </h2>
            <p className="mt-4 text-lg text-white/40 max-w-xl mx-auto">
              Do abastecimento ao relatorio financeiro, numa unica plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 p-6 transition-all duration-300"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 mb-4 group-hover:bg-[#5E6AD2]/15 transition-colors">
                    <Icon className="h-5 w-5 text-[#5E6AD2]" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Planos para cada tamanho de <span className="text-[#5E6AD2]">operacao</span>
            </h2>
            <p className="mt-4 text-lg text-white/40">
              Comece gratis, escale quando precisar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {PLANS.map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 transition-all duration-300 ${
                  plan.highlight
                    ? 'border-2 border-[#5E6AD2] bg-[#5E6AD2]/5 shadow-lg shadow-[#5E6AD2]/10 scale-[1.02]'
                    : 'border border-white/5 bg-white/[0.02] hover:border-white/10'
                }`}
              >
                {plan.highlight && (
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#5E6AD2] mb-3">
                    Mais popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <p className="text-sm text-white/40 mt-1">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-sm text-white/40">{plan.period}</span>}
                </div>
                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-white/60">
                      <Check className="h-4 w-4 text-[#5E6AD2] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/auth?register=1')}
                  className={`mt-6 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? 'bg-[#5E6AD2] hover:bg-[#4F5BC3] text-white'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  {plan.price === 'Sob consulta' ? 'Fale conosco' : 'Comecar agora'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Fuel className="h-4 w-4 text-[#5E6AD2]" />
            <span className="font-bold">
              <span className="text-white">Fuel</span>
              <span className="text-[#5E6AD2]">Track</span>
            </span>
          </div>
          <p className="text-sm text-white/30">
            Gestao de frotas inteligente para transportadoras.
          </p>
        </div>
      </footer>
    </div>
  );
}
