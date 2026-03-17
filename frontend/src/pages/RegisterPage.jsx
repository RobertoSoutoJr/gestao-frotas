import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Fuel, Mail, Lock, User, Building, Phone, ArrowRight, Check } from 'lucide-react';

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
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      <div className="linear-bg" />
      <div className="linear-grid" />

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[var(--color-accent)] opacity-[0.08] blur-[120px] pointer-events-none" />
        <div className="relative z-10 flex flex-col px-16 max-w-xl">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/25">
              <Fuel className="h-6 w-6 text-[var(--color-accent)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                <span className="text-[var(--color-text)]">Fuel</span>
                <span className="text-[var(--color-accent)]">Track</span>
              </h1>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-6 text-[var(--color-text)]">
            Comece agora,<br />
            <span className="text-[var(--color-accent)]">é gratuito.</span>
          </h2>

          <div className="space-y-4 mt-4">
            {features.map((feat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/25 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                </div>
                <span className="text-sm text-[var(--color-text-secondary)]">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/25">
              <Fuel className="h-4 w-4 text-[var(--color-accent)]" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-[var(--color-text)]">Fuel</span>
              <span className="text-[var(--color-accent)]">Track</span>
            </span>
          </div>

          <div className="bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border-hover)] p-8 shadow-[0_24px_64px_var(--color-shadow)]">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-[var(--color-text)]">
                Criar conta
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">Preencha os dados abaixo</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input type="text" name="nome" label="Nome" placeholder="Seu nome" value={formData.nome} onChange={handleChange} required icon={User} />
              <Input type="email" name="email" label="Email" placeholder="email@email.com" value={formData.email} onChange={handleChange} required icon={Mail} />
              <Input type="password" name="password" label="Senha" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={handleChange} required icon={Lock} />
              <Input type="text" name="empresa" label="Empresa (opcional)" placeholder="Nome da empresa" value={formData.empresa} onChange={handleChange} icon={Building} />
              <Input type="tel" name="telefone" label="Telefone (opcional)" placeholder="(11) 98765-4321" value={formData.telefone} onChange={handleChange} icon={Phone} />

              <Button type="submit" variant="primary" loading={loading} className="w-full h-10">
                Criar conta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Já tem uma conta?{' '}
                <button onClick={onToggle} className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium transition-colors cursor-pointer">
                  Entrar
                </button>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-[var(--color-text-secondary)]/50">© 2026 FuelTrack</p>
          </div>
        </div>
      </div>
    </div>
  );
}
