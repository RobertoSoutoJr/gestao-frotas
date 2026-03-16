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
    <div className="min-h-screen flex bg-[#050506]">
      {/* Background */}
      <div className="linear-bg" />
      <div className="linear-grid" />

      {/* Left Panel — Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        {/* Accent blob */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#5E6AD2] opacity-[0.08] blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col px-16 max-w-xl">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5E6AD2]/15 border border-[#5E6AD2]/25">
              <Truck className="h-6 w-6 text-[#5E6AD2]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                <span className="text-[#EDEDEF]">Frota</span>
                <span className="text-[#5E6AD2]">Pro</span>
              </h1>
              <p className="text-sm text-[#8A8F98] mt-0.5">Gestão Inteligente de Frotas</p>
            </div>
          </div>

          <h2 className="text-5xl font-bold leading-tight mb-6 text-[#EDEDEF]">
            Controle total<br />
            <span className="text-[#5E6AD2]">da sua frota.</span>
          </h2>

          <p className="text-lg text-[#8A8F98] mb-10 leading-relaxed">
            Gerencie caminhões, motoristas, abastecimentos e manutenções em uma única plataforma.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.05] rounded-2xl border border-white/[0.06] p-5">
              <div className="text-3xl font-bold text-[#EDEDEF]">100%</div>
              <div className="text-sm text-[#8A8F98] mt-1">Controle Operacional</div>
            </div>
            <div className="bg-white/[0.05] rounded-2xl border border-white/[0.06] p-5">
              <div className="text-3xl font-bold text-[#EDEDEF]">24/7</div>
              <div className="text-sm text-[#8A8F98] mt-1">Acesso aos Dados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5E6AD2]/15 border border-[#5E6AD2]/25">
              <Truck className="h-4 w-4 text-[#5E6AD2]" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-[#EDEDEF]">Frota</span>
              <span className="text-[#5E6AD2]">Pro</span>
            </span>
          </div>

          {/* Form Card */}
          <div className="bg-[#0a0a0c] rounded-2xl border border-white/[0.08] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-[#EDEDEF]">
                Entrar na conta
              </h2>
              <p className="text-sm text-[#8A8F98] mt-1">
                Insira suas credenciais para acessar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full h-10"
              >
                Entrar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#8A8F98]">
                Não tem uma conta?{' '}
                <button
                  onClick={onToggle}
                  className="text-[#5E6AD2] hover:text-[#6872D9] font-medium transition-colors"
                >
                  Criar conta
                </button>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#8A8F98]/50">
              © 2026 FrotaPro — Sistema de Gestão de Frotas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
