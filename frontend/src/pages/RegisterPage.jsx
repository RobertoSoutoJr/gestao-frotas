import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Truck, Mail, Lock, User, Building, Phone, ArrowRight, Check } from 'lucide-react';

export function RegisterPage({ onToggle }) {
  const [formData, setFormData] = useState({
    nome: '', email: '', password: '', empresa: '', telefone: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { error: showError, success } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      success('Conta criada!', 'Sua conta foi criada com sucesso');
    } catch (err) {
      showError('Erro ao criar conta', err.message || 'Tente novamente mais tarde');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const features = [
    'Controle completo de caminhões e motoristas',
    'Relatórios e estatísticas em tempo real',
    'Gestão de abastecimentos e manutenções'
  ];

  return (
    <div className="min-h-screen flex bg-[#090014]">
      <div className="vw-grid-bg" />
      <div className="vw-chromatic" />

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-b from-[#FF9900] to-[#FF00FF] opacity-15 blur-[100px]" />
        <div className="relative z-10 flex flex-col px-16 max-w-xl">
          <div className="flex items-center gap-4 mb-12">
            <div className="flex h-16 w-16 items-center justify-center border-2 border-[#FF00FF] rotate-45 bg-[#FF00FF]/10 shadow-[0_0_30px_rgba(255,0,255,0.3)]">
              <Truck className="h-8 w-8 text-[#FF00FF] -rotate-45" />
            </div>
            <div>
              <h1 className="font-[Orbitron] text-4xl font-black tracking-wider text-gradient-sunset">FROTAPRO</h1>
              <p className="font-mono text-sm text-[#00FFFF]/60">&gt; Registro de Operador</p>
            </div>
          </div>

          <h2 className="font-[Orbitron] text-4xl font-black leading-tight mb-6 text-[#E0E0E0] text-glow-white">
            REGISTRE-SE<br /><span className="text-[#FF00FF] text-glow-magenta">AGORA</span>
          </h2>

          <div className="space-y-4 mt-4">
            {features.map((feat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 border border-[#00FFFF] flex items-center justify-center bg-[#00FFFF]/10">
                  <Check className="h-4 w-4 text-[#00FFFF]" />
                </div>
                <span className="font-mono text-sm text-[#E0E0E0]/70">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-[#FF00FF] rotate-45 bg-[#FF00FF]/10">
              <Truck className="h-5 w-5 text-[#FF00FF] -rotate-45" />
            </div>
            <span className="font-[Orbitron] text-2xl font-black text-gradient-sunset">FROTAPRO</span>
          </div>

          <div className="border-2 border-[#FF00FF] bg-black/80 shadow-[0_0_30px_rgba(255,0,255,0.15)]">
            <div className="flex items-center gap-3 border-b border-[#FF00FF]/30 bg-[#FF00FF]/5 px-4 py-3">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-[#FF00FF]" />
                <div className="h-3 w-3 rounded-full bg-[#00FFFF]" />
                <div className="h-3 w-3 rounded-full bg-[#FF9900]" />
              </div>
              <span className="font-mono text-xs text-[#FF00FF]/60">&gt; register_user.exe</span>
            </div>

            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="font-[Orbitron] text-2xl font-bold uppercase tracking-wider text-[#FF00FF] drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]">
                  Criar Conta
                </h2>
                <p className="font-mono text-sm text-[#E0E0E0]/50 mt-2">&gt; Preencha os dados abaixo</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input type="text" name="nome" label="Nome" placeholder="Seu nome" value={formData.nome} onChange={handleChange} required icon={User} />
                <Input type="email" name="email" label="Email" placeholder="email@email.com" value={formData.email} onChange={handleChange} required icon={Mail} />
                <Input type="password" name="password" label="Senha" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={handleChange} required icon={Lock} />
                <Input type="text" name="empresa" label="Empresa (opcional)" placeholder="Nome da empresa" value={formData.empresa} onChange={handleChange} icon={Building} />
                <Input type="tel" name="telefone" label="Telefone (opcional)" placeholder="(11) 98765-4321" value={formData.telefone} onChange={handleChange} icon={Phone} />

                <Button type="submit" variant="danger" loading={loading} className="w-full py-3 text-base">
                  <span className="inline-flex items-center gap-2 skew-x-12">
                    Criar Conta <ArrowRight className="h-5 w-5" />
                  </span>
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="font-mono text-sm text-[#E0E0E0]/50">
                  Já tem conta?{' '}
                  <button onClick={onToggle} className="text-[#00FFFF] hover:text-[#FF00FF] font-semibold transition-colors uppercase tracking-wider">
                    Login
                  </button>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="font-mono text-xs text-[#E0E0E0]/30">&gt; © 2026 FrotaPro</p>
          </div>
        </div>
      </div>
    </div>
  );
}
