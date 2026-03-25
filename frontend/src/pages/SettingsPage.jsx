import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import authService from '../services/auth';
import { User, Lock, Building2, Phone, Mail, Save, Eye, EyeOff, LogOut } from 'lucide-react';

export function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const { addToast } = useToast();

  // Profile form
  const [profile, setProfile] = useState({
    nome: user?.nome || '',
    empresa: user?.empresa || '',
    telefone: user?.telefone || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleProfileChange = (e) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile.nome.trim()) {
      addToast('Nome e obrigatorio', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      const response = await authService.updateProfile({
        nome: profile.nome.trim(),
        empresa: profile.empresa.trim() || null,
        telefone: profile.telefone.trim() || null,
      });
      updateUser(response.data);
      addToast('Perfil atualizado', 'success');
    } catch (err) {
      addToast(err.message || 'Erro ao atualizar perfil', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwords.currentPassword || !passwords.newPassword) {
      addToast('Preencha todos os campos', 'error');
      return;
    }

    if (passwords.newPassword.length < 6) {
      addToast('A nova senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      addToast('As senhas nao coincidem', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      await authService.changePassword(passwords.currentPassword, passwords.newPassword);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      addToast('Senha alterada com sucesso', 'success');
    } catch (err) {
      addToast(err.message || 'Erro ao alterar senha', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-[var(--color-text)]">Configuracoes</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Gerencie seu perfil e seguranca</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil
          </CardTitle>
          <CardDescription>Informacoes da sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                Email
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text-secondary)]">
                <Mail className="h-4 w-4 shrink-0" />
                <span>{user?.email}</span>
              </div>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">O email nao pode ser alterado</p>
            </div>

            <Input
              label="Nome"
              name="nome"
              value={profile.nome}
              onChange={handleProfileChange}
              placeholder="Seu nome completo"
              icon={User}
              required
            />

            <Input
              label="Empresa"
              name="empresa"
              value={profile.empresa}
              onChange={handleProfileChange}
              placeholder="Nome da empresa (opcional)"
              icon={Building2}
            />

            <Input
              label="Telefone"
              name="telefone"
              value={profile.telefone}
              onChange={handleProfileChange}
              placeholder="(00) 00000-0000"
              icon={Phone}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" disabled={savingProfile}>
                <Save className="mr-2 h-4 w-4" />
                {savingProfile ? 'Salvando...' : 'Salvar alteracoes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription>Mantenha sua conta segura</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="relative">
              <Input
                label="Senha atual"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Digite sua senha atual"
                icon={Lock}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-[38px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                tabIndex={-1}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Nova senha"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                placeholder="Minimo 6 caracteres"
                icon={Lock}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-[38px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Input
              label="Confirmar nova senha"
              name="confirmPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Repita a nova senha"
              icon={Lock}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" disabled={savingPassword}>
                <Lock className="mr-2 h-4 w-4" />
                {savingPassword ? 'Alterando...' : 'Alterar senha'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-400">Sessao</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Sair da conta</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Encerrar sessao neste dispositivo</p>
            </div>
            <Button variant="danger" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
