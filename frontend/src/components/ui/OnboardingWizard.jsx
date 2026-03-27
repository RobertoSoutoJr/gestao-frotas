import { useState } from 'react';
import { Truck, Users, Fuel, ArrowRight, ArrowLeft, Check, X, Rocket } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { trucksService } from '../../services/trucks';
import { driversService } from '../../services/drivers';

const ONBOARDING_KEY = 'fueltrack_onboarding_done';

export function isOnboardingDone() {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export function markOnboardingDone() {
  localStorage.setItem(ONBOARDING_KEY, 'true');
}

const STEPS = [
  { id: 'welcome', title: 'Bem-vindo ao FuelTrack', icon: Rocket },
  { id: 'truck', title: 'Cadastre seu primeiro caminhao', icon: Truck },
  { id: 'driver', title: 'Cadastre seu primeiro motorista', icon: Users },
  { id: 'done', title: 'Tudo pronto!', icon: Check },
];

export function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [truckData, setTruckData] = useState({ placa: '', modelo: '', ano: '', km_atual: '' });
  const [driverData, setDriverData] = useState({ nome: '', telefone: '', cpf: '' });
  const [truckCreated, setTruckCreated] = useState(false);
  const [driverCreated, setDriverCreated] = useState(false);

  const currentStep = STEPS[step];

  const handleTruckChange = (e) => setTruckData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleDriverChange = (e) => setDriverData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const createTruck = async () => {
    if (!truckData.placa) return;
    setLoading(true);
    try {
      await trucksService.create({
        placa: truckData.placa.toUpperCase(),
        modelo: truckData.modelo,
        ano: truckData.ano ? Number(truckData.ano) : undefined,
        km_atual: truckData.km_atual ? Number(truckData.km_atual) : undefined,
      });
      setTruckCreated(true);
      setStep(2);
    } catch { }
    setLoading(false);
  };

  const createDriver = async () => {
    if (!driverData.nome) return;
    setLoading(true);
    try {
      await driversService.create({
        nome: driverData.nome,
        telefone: driverData.telefone || undefined,
        cpf: driverData.cpf || undefined,
      });
      setDriverCreated(true);
      setStep(3);
    } catch { }
    setLoading(false);
  };

  const finish = () => {
    markOnboardingDone();
    onComplete?.();
  };

  const skip = () => {
    markOnboardingDone();
    onComplete?.();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-[var(--color-surface)]">
          <div
            className="h-full bg-[var(--color-accent)] transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Skip button */}
        {step < 3 && (
          <button onClick={skip} className="absolute top-4 right-4 text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors">
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-surface)]'
                }`}
              />
            ))}
          </div>

          {/* Welcome step */}
          {step === 0 && (
            <div className="text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/25 mx-auto">
                <Rocket className="h-8 w-8 text-[var(--color-accent)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-text)]">Bem-vindo ao FuelTrack!</h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                Vamos configurar sua conta em 2 passos rapidos.<br />
                Cadastre seu primeiro caminhao e motorista para comecar.
              </p>
              <Button variant="primary" className="w-full mt-6" onClick={() => setStep(1)}>
                Vamos comecar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <button onClick={skip} className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]">
                Pular e configurar depois
              </button>
            </div>
          )}

          {/* Truck step */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)]/15">
                  <Truck className="h-5 w-5 text-[var(--color-accent)]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-text)]">Seu primeiro caminhao</h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">Passo 1 de 2</p>
                </div>
              </div>

              <Input name="placa" label="Placa" placeholder="ABC1D23" value={truckData.placa} onChange={handleTruckChange} required />
              <Input name="modelo" label="Modelo" placeholder="Volvo FH 540" value={truckData.modelo} onChange={handleTruckChange} />
              <div className="grid grid-cols-2 gap-3">
                <Input name="ano" label="Ano" type="number" placeholder="2024" value={truckData.ano} onChange={handleTruckChange} />
                <Input name="km_atual" label="KM Atual" type="number" placeholder="0" value={truckData.km_atual} onChange={handleTruckChange} />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button variant="primary" onClick={createTruck} loading={loading} className="flex-1" disabled={!truckData.placa}>
                  Cadastrar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <button onClick={() => setStep(2)} className="w-full text-center text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]">
                Pular este passo
              </button>
            </div>
          )}

          {/* Driver step */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/15">
                  <Users className="h-5 w-5 text-[#8B5CF6]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-text)]">Seu primeiro motorista</h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">Passo 2 de 2</p>
                </div>
              </div>

              {truckCreated && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-sm text-emerald-400">
                  <Check className="h-4 w-4" /> Caminhao {truckData.placa.toUpperCase()} cadastrado!
                </div>
              )}

              <Input name="nome" label="Nome completo" placeholder="Jose da Silva" value={driverData.nome} onChange={handleDriverChange} required />
              <Input name="telefone" label="Telefone" placeholder="(34) 99999-9999" value={driverData.telefone} onChange={handleDriverChange} />
              <Input name="cpf" label="CPF" placeholder="000.000.000-00" value={driverData.cpf} onChange={handleDriverChange} />

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button variant="primary" onClick={createDriver} loading={loading} className="flex-1" disabled={!driverData.nome}>
                  Cadastrar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <button onClick={() => setStep(3)} className="w-full text-center text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]">
                Pular este passo
              </button>
            </div>
          )}

          {/* Done step */}
          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/25 mx-auto">
                <Check className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-text)]">Tudo pronto!</h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                {truckCreated && driverCreated
                  ? 'Caminhao e motorista cadastrados com sucesso. Seu dashboard esta pronto.'
                  : truckCreated
                    ? 'Caminhao cadastrado. Voce pode adicionar motoristas a qualquer momento.'
                    : driverCreated
                      ? 'Motorista cadastrado. Voce pode adicionar caminhoes a qualquer momento.'
                      : 'Voce pode cadastrar caminhoes e motoristas a qualquer momento no menu lateral.'}
              </p>
              <Button variant="primary" className="w-full mt-4" onClick={finish}>
                Ir para o Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
