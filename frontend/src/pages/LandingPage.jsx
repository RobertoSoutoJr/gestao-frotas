import { useNavigate } from 'react-router-dom';
import { Fuel, Truck, Route, BarChart3, Shield, Smartphone, ArrowRight, Check } from 'lucide-react';
import logoLight from '../assets/images/logoFuelTrack_light-removebg.png';
import logoDark from '../assets/images/logoFuelTrack_black-removebg.png';

const FEATURES = [
  {
    icon: Truck,
    title: 'Gestão de Frota',
    description: 'Controle caminhões, motoristas, abastecimentos e manutenções em um só lugar.',
  },
  {
    icon: Route,
    title: 'Rotas Inteligentes',
    description: 'Visualize rotas reais no mapa, capture GPS no campo e acompanhe viagens em tempo real.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios e DRE',
    description: 'Fluxo de caixa, rentabilidade por cliente, custo por km e exportação em PDF/Excel.',
  },
  {
    icon: Shield,
    title: 'Alertas Automáticos',
    description: 'Notificações de CNH vencendo, licenciamento, revisão por km e consumo anômalo.',
  },
  {
    icon: Smartphone,
    title: 'App Instalável (PWA)',
    description: 'Funciona no celular como app nativo, com captura GPS offline em fazendas sem internet.',
  },
  {
    icon: Fuel,
    title: 'Controle Financeiro',
    description: 'Estoque com pagamento parcial, cheques, e dashboard com visão completa do negócio.',
  },
];

const PLANS = [
  {
    name: 'Starter',
    price: 'Grátis',
    period: '',
    description: 'Para quem está começando',
    features: ['Até 5 caminhões', 'Dashboard completo', 'Relatórios básicos', 'App PWA'],
    highlight: false,
  },
  {
    name: 'Pro',
    price: 'R$ 97',
    period: '/mês',
    description: 'Para frotas em crescimento',
    features: ['Caminhões ilimitados', 'Rotas com GPS', 'Alertas push', 'Exportação PDF/Excel', 'Contas de motorista', 'Suporte prioritário'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    period: '',
    description: 'Para grandes operações',
    features: ['Tudo do Pro', 'API para integrações', 'Multi-empresa', 'SLA dedicado', 'Implantação assistida'],
    highlight: false,
  },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0C0C0E] text-white">
      {/* Nav — solid bg, no blur */}
      <nav className="border-b border-white/5 bg-[#0C0C0E] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img src={logoDark} alt="FuelTrack" className="h-20 w-auto" />
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
              className="px-5 py-2 text-sm font-medium bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg transition-colors"
            >
              Criar conta grátis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero — clean, no gradient blobs */}
      <section className="relative">
        <div className="container mx-auto px-4 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-[#D97706] mb-8">
            Novo: Rotas reais com GPS offline
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Gestão de frotas{' '}
            <span className="text-[#D97706]">simples e inteligente</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            Controle sua frota de caminhões, viagens, abastecimentos e financeiro em um único sistema.
            Feito para transportadoras que querem crescer.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/auth?register=1')}
              className="group flex items-center gap-2 px-8 py-3.5 text-base font-semibold bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg transition-colors"
            >
              Comece grátis agora
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="px-8 py-3.5 text-base font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
            >
              Já tenho conta
            </button>
          </div>
        </div>
      </section>

      {/* Features — alternating 2-col layout instead of 3x3 grid */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Tudo que você precisa para{' '}
              <span className="text-[#D97706]">gerenciar sua frota</span>
            </h2>
            <p className="mt-4 text-lg text-white/40 max-w-xl mx-auto">
              Do abastecimento ao relatório financeiro, numa única plataforma.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-10">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              const isEven = i % 2 === 0;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-5 ${isEven ? '' : 'flex-row-reverse text-right'}`}
                >
                  <Icon className="h-6 w-6 text-[#D97706] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                    <p className="mt-1 text-sm text-white/40 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing — no scale, no colored shadow */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Planos para cada tamanho de <span className="text-[#D97706]">operação</span>
            </h2>
            <p className="mt-4 text-lg text-white/40">
              Comece grátis, escale quando precisar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {PLANS.map((plan, i) => (
              <div
                key={i}
                className={`rounded-xl p-6 transition-colors ${
                  plan.highlight
                    ? 'border-2 border-[#D97706] bg-[#D97706]/5'
                    : 'border border-white/5 bg-white/[0.02] hover:border-white/10'
                }`}
              >
                {plan.highlight && (
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#D97706] mb-3">
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
                      <Check className="h-4 w-4 text-[#D97706] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/auth?register=1')}
                  className={`mt-6 w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? 'bg-[#D97706] hover:bg-[#B45309] text-white'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  {plan.price === 'Sob consulta' ? 'Fale conosco' : 'Começar agora'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/5">
        <div className="container mx-auto px-4 flex flex-col items-center gap-4">
          <img src={logoDark} alt="FuelTrack" className="h-9 w-auto" />
          <p className="text-sm text-white/30">
            Gestão de frotas inteligente para transportadoras.
          </p>
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} FuelTrack. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
