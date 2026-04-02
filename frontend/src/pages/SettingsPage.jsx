import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import authService from '../services/auth';
import { driversService } from '../services/drivers';
import { User, Lock, Building2, Phone, Mail, Save, Eye, EyeOff, LogOut, Users, Plus, Power, Crown, Zap, Rocket, Check, TrendingUp } from 'lucide-react';

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

      {/* Plan Section (admin only) */}
      {user?.role !== 'motorista' && <PlanSection />}

      {/* Motorista Accounts (admin only) */}
      {user?.role !== 'motorista' && <MotoristaAccountsSection />}

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

function UsageBar({ atual, limite }) {
  if (limite === -1) return <span className="text-xs text-emerald-400">Ilimitado</span>;
  const pct = Math.min((atual / limite) * 100, 100);
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-[var(--color-border)]">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-[var(--color-text-secondary)] whitespace-nowrap">{atual}/{limite}</span>
    </div>
  );
}

function PlanSection() {
  const [planInfo, setPlanInfo] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPlans, setShowPlans] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [info, plans] = await Promise.all([
          authService.getPlanInfo(),
          authService.getPlans(),
        ]);
        setPlanInfo(info.data);
        setAllPlans(plans.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-[var(--color-text-secondary)]">Carregando plano...</p>
      </CardContent>
    </Card>
  );

  if (!planInfo) return null;

  const planIcons = { free: Zap, pro: Rocket, enterprise: Crown };
  const PlanIcon = planIcons[planInfo.plano] || Zap;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PlanIcon className="h-5 w-5 text-amber-400" />
                Plano {planInfo.plano_nome}
              </CardTitle>
              <CardDescription>
                {planInfo.plano_preco > 0 ? `R$ ${planInfo.plano_preco.toFixed(2)}/mes` : 'Gratuito'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPlans(!showPlans)}>
              <TrendingUp className="mr-1.5 h-4 w-4" />
              {showPlans ? 'Ocultar planos' : 'Ver planos'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[var(--color-text)]">Caminhoes</span>
              </div>
              <UsageBar atual={planInfo.uso.caminhoes.atual} limite={planInfo.uso.caminhoes.limite} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[var(--color-text)]">Motoristas</span>
              </div>
              <UsageBar atual={planInfo.uso.motoristas.atual} limite={planInfo.uso.motoristas.limite} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[var(--color-text)]">Viagens este mes</span>
              </div>
              <UsageBar atual={planInfo.uso.viagens_mes.atual} limite={planInfo.uso.viagens_mes.limite} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[var(--color-text)]">Contas de motorista</span>
              </div>
              <UsageBar atual={planInfo.uso.motorista_accounts.atual} limite={planInfo.uso.motorista_accounts.limite} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans comparison */}
      {showPlans && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {allPlans.map(plan => {
            const Icon = planIcons[plan.id] || Zap;
            const isCurrent = plan.id === planInfo.plano;
            return (
              <Card key={plan.id} className={isCurrent ? 'border-amber-500/50 ring-1 ring-amber-500/20' : ''}>
                <CardHeader className="text-center">
                  <Icon className={`mx-auto h-8 w-8 mb-2 ${isCurrent ? 'text-amber-400' : 'text-[var(--color-text-secondary)]'}`} />
                  <CardTitle className="text-lg">{plan.nome}</CardTitle>
                  <CardDescription>
                    {plan.preco > 0 ? (
                      <span className="text-2xl font-bold text-[var(--color-text)]">R$ {plan.preco.toFixed(2)}<span className="text-sm font-normal text-[var(--color-text-secondary)]">/mes</span></span>
                    ) : (
                      <span className="text-2xl font-bold text-[var(--color-text)]">Gratis</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.recursos.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                        <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    {isCurrent ? (
                      <Button variant="outline" className="w-full" disabled>Plano atual</Button>
                    ) : (
                      <Button variant={plan.id === 'pro' ? 'primary' : 'outline'} className="w-full" onClick={() => window.open('https://wa.me/5500000000000?text=Quero+fazer+upgrade+para+o+plano+' + plan.nome, '_blank')}>
                        {plan.preco > planInfo.plano_preco ? 'Fazer upgrade' : 'Selecionar'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function MotoristaAccountsSection() {
  const { addToast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', password: '', motorista_id: '' });

  const fetchData = async () => {
    try {
      const [accRes, drvRes] = await Promise.all([
        authService.getMotoristaAccounts(),
        driversService.getAll(),
      ]);
      setAccounts(accRes.data || []);
      setDrivers(drvRes.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.email || !form.password) {
      addToast('Preencha nome, email e senha', 'error');
      return;
    }
    if (form.password.length < 6) {
      addToast('Senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }
    setCreating(true);
    try {
      await authService.createMotoristaAccount({
        nome: form.nome,
        email: form.email,
        password: form.password,
        motorista_id: form.motorista_id ? Number(form.motorista_id) : null,
      });
      addToast('Conta de motorista criada', 'success');
      setForm({ nome: '', email: '', password: '', motorista_id: '' });
      setShowCreate(false);
      fetchData();
    } catch (err) {
      addToast(err.message || 'Erro ao criar conta', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (account) => {
    try {
      await authService.toggleMotoristaAccount(account.id, !account.is_active);
      addToast(account.is_active ? 'Conta desativada' : 'Conta ativada', 'success');
      fetchData();
    } catch (err) {
      addToast(err.message || 'Erro ao alterar status', 'error');
    }
  };

  // Drivers not yet linked to an account
  const linkedIds = accounts.map(a => a.motorista_id).filter(Boolean);
  const availableDrivers = drivers.filter(d => !linkedIds.includes(d.id));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contas de Motorista
            </CardTitle>
            <CardDescription>Crie logins para seus motoristas acessarem o app</CardDescription>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nova Conta
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create form */}
        {showCreate && (
          <form onSubmit={handleCreate} className="space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Nome"
                placeholder="Nome do motorista"
                value={form.nome}
                onChange={(e) => setForm(prev => ({ ...prev, nome: e.target.value }))}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              <Input
                label="Senha"
                type="password"
                placeholder="Min. 6 caracteres"
                value={form.password}
                onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                required
              />
              <Select
                label="Vincular ao motorista (opcional)"
                value={form.motorista_id}
                onChange={(e) => setForm(prev => ({ ...prev, motorista_id: e.target.value }))}
              >
                <option value="">Sem vinculo</option>
                {availableDrivers.map(d => (
                  <option key={d.id} value={d.id}>{d.nome}</option>
                ))}
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancelar</Button>
              <Button type="submit" variant="primary" size="sm" disabled={creating}>
                {creating ? 'Criando...' : 'Criar Conta'}
              </Button>
            </div>
          </form>
        )}

        {/* Accounts list */}
        {loading ? (
          <p className="text-sm text-[var(--color-text-secondary)]">Carregando...</p>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">Nenhuma conta de motorista criada</p>
        ) : (
          <div className="space-y-2">
            {accounts.map(acc => {
              const linkedDriver = drivers.find(d => d.id === acc.motorista_id);
              return (
                <div key={acc.id} className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--color-text)]">{acc.nome}</span>
                      <Badge variant={acc.is_active ? 'success' : 'default'}>
                        {acc.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {acc.email}
                      {linkedDriver && <span className="ml-2">| Vinculado: {linkedDriver.nome}</span>}
                    </p>
                  </div>
                  <Button
                    variant={acc.is_active ? 'danger' : 'success'}
                    size="sm"
                    onClick={() => handleToggle(acc)}
                  >
                    <Power className="mr-1.5 h-3.5 w-3.5" />
                    {acc.is_active ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
