import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Truck, Mail, Lock, User, Building, Phone, ArrowRight, Check } from 'lucide-react';

export function RegisterPage({ onToggle }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    empresa: '',
    telefone: ''
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

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Imagem/Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
              <Truck className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">FrotaPro</h1>
              <p className="text-purple-200 text-sm">Gestão Inteligente de Frotas</p>
            </div>
          </div>
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            Comece gratuitamente hoje
          </h2>
          <p className="text-xl text-purple-100 mb-8 leading-relaxed">
            Cadastre-se agora e tenha acesso completo à plataforma mais moderna de gestão de frotas.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Check className="h-5 w-5" />
              </div>
              <span className="text-lg">Controle completo de caminhões e motoristas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Check className="h-5 w-5" />
              </div>
              <span className="text-lg">Relatórios e estatísticas em tempo real</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Check className="h-5 w-5" />
              </div>
              <span className="text-lg">Gestão de abastecimentos e manutenções</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-zinc-50 dark:bg-zinc-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <Truck className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">FrotaPro</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Crie sua conta
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Preencha os dados abaixo para começar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              name="nome"
              label="Nome completo"
              placeholder="João Silva"
              value={formData.nome}
              onChange={handleChange}
              required
              icon={User}
            />

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

            <Input
              type="password"
              name="password"
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
              icon={Lock}
            />

            <Input
              type="text"
              name="empresa"
              label="Empresa (opcional)"
              placeholder="Nome da sua empresa"
              value={formData.empresa}
              onChange={handleChange}
              icon={Building}
            />

            <Input
              type="tel"
              name="telefone"
              label="Telefone (opcional)"
              placeholder="(11) 98765-4321"
              value={formData.telefone}
              onChange={handleChange}
              icon={Phone}
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full py-3 text-base font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Criar conta
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
              Já tem uma conta?{' '}
              <button
                onClick={onToggle}
                className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
              >
                Fazer login
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
