import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Truck, Mail, Lock, ArrowRight } from 'lucide-react';

export function LoginPage({ onToggle }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { error: showError, success } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      success('Bem-vindo!', 'Login realizado com sucesso');
    } catch (err) {
      showError('Erro ao fazer login', err.message || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex bg-[#090014]">
      {/* Background */}
      <div className="vw-grid-bg" />
      <div className="vw-chromatic" />

      {/* Left Panel — Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        {/* Floating Sun */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-b from-[#FF9900] to-[#FF00FF] opacity-15 blur-[100px]" />

        <div className="relative z-10 flex flex-col px-16 text-white max-w-xl">
          <div className="flex items-center gap-4 mb-12">
            <div className="flex h-16 w-16 items-center justify-center border-2 border-[#00FFFF] rotate-45 bg-[#00FFFF]/10 shadow-[0_0_30px_rgba(0,255,255,0.3)]">
              <Truck className="h-8 w-8 text-[#00FFFF] -rotate-45" />
            </div>
            <div>
              <h1 className="font-[Orbitron] text-4xl font-black tracking-wider">
                <span className="text-[#E0E0E0]">FROTA</span>
                <span className="text-gradient-sunset">PRO</span>
              </h1>
              <p className="font-mono text-sm text-[#FF00FF]/60">&gt; Gestão Inteligente de Frotas</p>
            </div>
          </div>

          <h2 className="font-[Orbitron] text-5xl font-black leading-tight mb-6 text-glow-white">
            CONTROLE
            <br />
            <span className="text-gradient-sunset drop-shadow-[0_0_30px_rgba(255,0,255,0.6)]">
              TOTAL
            </span>
            <br />
            DA SUA FROTA
          </h2>

          <p className="font-mono text-lg text-[#E0E0E0]/60 mb-10 leading-relaxed">
            &gt; Gerencie caminhões, motoristas, abastecimentos e manutenções em uma única plataforma.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-[#00FFFF]/30 border-t-2 border-t-[#00FFFF] bg-[#1a103c]/60 p-5">
              <div className="font-[Orbitron] text-3xl font-black text-[#00FFFF] text-glow-cyan">100%</div>
              <div className="font-mono text-sm text-[#E0E0E0]/50 mt-1">&gt; Controle Operacional</div>
            </div>
            <div className="border border-[#FF00FF]/30 border-t-2 border-t-[#FF00FF] bg-[#1a103c]/60 p-5">
              <div className="font-[Orbitron] text-3xl font-black text-[#FF00FF] text-glow-magenta">24/7</div>
              <div className="font-mono text-sm text-[#E0E0E0]/50 mt-1">&gt; Acesso aos Dados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-[#00FFFF] rotate-45 bg-[#00FFFF]/10">
              <Truck className="h-5 w-5 text-[#00FFFF] -rotate-45" />
            </div>
            <span className="font-[Orbitron] text-2xl font-black text-gradient-sunset">FROTAPRO</span>
          </div>

          {/* Terminal Window */}
          <div className="border-2 border-[#00FFFF] bg-black/80 shadow-[0_0_30px_rgba(0,255,255,0.15)]">
            {/* Title Bar */}
            <div className="flex items-center gap-3 border-b border-[#00FFFF]/30 bg-[#00FFFF]/5 px-4 py-3">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-[#FF00FF]" />
                <div className="h-3 w-3 rounded-full bg-[#00FFFF]" />
                <div className="h-3 w-3 rounded-full bg-[#FF9900]" />
              </div>
              <span className="font-mono text-xs text-[#00FFFF]/60">&gt; login_session.exe</span>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="font-[Orbitron] text-2xl font-bold uppercase tracking-wider text-[#00FFFF] drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
                  Acessar Sistema
                </h2>
                <p className="font-mono text-sm text-[#E0E0E0]/50 mt-2">
                  &gt; Insira suas credenciais
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="email"
                  name="email"
                  label="Email"
                  placeholder="usuario@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  icon={Mail}
                />
                <Input
                  type="password"
                  name="password"
                  label="Senha"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  icon={Lock}
                />
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="w-full py-3 text-base"
                >
                  <span className="inline-flex items-center gap-2 skew-x-12">
                    Acessar
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="font-mono text-sm text-[#E0E0E0]/50">
                  Sem conta?{' '}
                  <button
                    onClick={onToggle}
                    className="text-[#FF00FF] hover:text-[#00FFFF] font-semibold transition-colors uppercase tracking-wider"
                  >
                    Registrar
                  </button>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="font-mono text-xs text-[#E0E0E0]/30">
              &gt; © 2026 FrotaPro — Sistema de Gestão de Frotas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
