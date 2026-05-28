import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import logoGreen from '../assets/images/logo-fueltrack-green.png';
import logoDark from '../assets/images/logoFuelTrack_black-removebg.png';

export function LoginPage({ onToggle }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { error: showError, success } = useToast();
  const { isDark } = useTheme();

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
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      {/* Background */}
      <div className="linear-bg" />
      <div className="linear-grid" />

      {/* Left Panel — Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[var(--color-accent)] opacity-[0.08] blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col px-16 max-w-xl">
          <div className="flex items-center mb-12">
            <img
              src={isDark ? logoDark : logoGreen}
              alt="FuelTrack"
              className="h-28 w-auto"
            />
          </div>

          <h2 className="text-5xl font-bold leading-tight mb-6 text-[var(--color-text)]">
            Controle total<br />
            <span className="text-[var(--color-accent)]">da sua frota.</span>
          </h2>

          <p className="text-lg text-[var(--color-text-secondary)] mb-10 leading-relaxed">
            Gerencie caminhões, motoristas, abastecimentos e manutenções em uma única plataforma.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5">
              <div className="text-3xl font-bold text-[var(--color-text)]">100%</div>
              <div className="text-sm text-[var(--color-text-secondary)] mt-1">Controle Operacional</div>
            </div>
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5">
              <div className="text-3xl font-bold text-[var(--color-text)]">24/7</div>
              <div className="text-sm text-[var(--color-text-secondary)] mt-1">Acesso aos Dados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img
              src={isDark ? logoDark : logoGreen}
              alt="FuelTrack"
              className="h-16 w-auto"
            />
          </div>

          {/* Form Card */}
          <div className="bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border-hover)] p-8 shadow-[0_24px_64px_var(--color-shadow)]">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-[var(--color-text)]">
                Entrar na conta
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
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
              <p className="text-sm text-[var(--color-text-secondary)]">
                Não tem uma conta?{' '}
                <button
                  onClick={onToggle}
                  className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium transition-colors cursor-pointer"
                >
                  Criar conta
                </button>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-[var(--color-text-secondary)]/50">
              © 2026 FuelTrack — Gestão Inteligente de Frotas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
