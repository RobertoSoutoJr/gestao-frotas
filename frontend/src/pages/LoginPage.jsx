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
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Imagem/Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
              <Truck className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">FrotaPro</h1>
              <p className="text-blue-200 text-sm">Gestão Inteligente de Frotas</p>
            </div>
          </div>
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            Controle total da sua frota
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Gerencie caminhões, motoristas, abastecimentos e manutenções em uma única plataforma profissional.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold mb-1">100%</div>
              <div className="text-sm text-blue-200">Controle Operacional</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold mb-1">24/7</div>
              <div className="text-sm text-blue-200">Acesso aos Dados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-zinc-50 dark:bg-zinc-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <Truck className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">FrotaPro</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Entre com suas credenciais para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div>
                <Input
                  type="email"
                  name="email"
                  label="Email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  icon={Mail}
                />
              </div>

              <div>
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
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full py-3 text-base font-semibold flex items-center justify-center gap-2"
            >
              Entrar
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
              Não tem uma conta?{' '}
              <button
                onClick={onToggle}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Criar conta gratuita
              </button>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-center text-sm text-zinc-500">
              © 2026 FrotaPro. Gestão profissional de frotas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
