import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Fuel, Mail, ArrowLeft, RefreshCw } from 'lucide-react';

export function VerifyEmailPage({ email, onBack }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);
  const { verifyEmail, resendCode } = useAuth();
  const { error: showError, success } = useToast();

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (value && index === 5) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) handleSubmit(fullCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      inputRefs.current[5]?.focus();
      handleSubmit(pasted);
    }
  };

  const handleSubmit = async (fullCode) => {
    const codeStr = fullCode || code.join('');
    if (codeStr.length !== 6) { showError('Erro', 'Digite o código de 6 dígitos'); return; }
    setLoading(true);
    try {
      await verifyEmail(email, codeStr);
      success('Verificado!', 'Email verificado com sucesso');
    } catch (err) {
      showError('Código inválido', err.message || 'Verifique e tente novamente');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendCode(email);
      success('Reenviado!', 'Verifique seu email');
      setCountdown(60);
    } catch (err) {
      showError('Erro', err.message || 'Não foi possível reenviar');
    } finally { setResending(false); }
  };

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
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-[var(--color-text)]">Fuel</span>
              <span className="text-[var(--color-accent)]">Track</span>
            </h1>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-6 text-[var(--color-text)]">
            Verificação<br />
            <span className="text-[var(--color-accent)]">de email.</span>
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
            Enviamos um código de 6 dígitos para o seu email. Digite-o para ativar sua conta.
          </p>
        </div>
      </div>

      {/* Right Panel */}
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
            <div className="text-center mb-8">
              <div className="mx-auto w-14 h-14 rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/25 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-[var(--color-accent)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--color-text)]">
                Verificar email
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">Código enviado para</p>
              <p className="text-sm font-medium text-[var(--color-accent)] mt-0.5">{email}</p>
            </div>

            {/* Code Inputs */}
            <div className="flex justify-center gap-2 mb-8" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  className="w-11 text-center font-mono text-xl font-semibold rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 outline-none transition-all"
                  style={{ height: '52px' }}
                />
              ))}
            </div>

            <Button onClick={() => handleSubmit()} variant="primary" loading={loading} className="w-full h-10">
              Verificar código
            </Button>

            <div className="mt-6 text-center space-y-3">
              {countdown > 0 ? (
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Reenviar em <span className="text-[var(--color-text)] font-medium tabular-nums">{countdown}s</span>
                </p>
              ) : (
                <button onClick={handleResend} disabled={resending} className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] flex items-center gap-1.5 mx-auto transition-colors font-medium cursor-pointer">
                  <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
                  Reenviar código
                </button>
              )}
              <button onClick={onBack} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] flex items-center gap-1 mx-auto transition-colors cursor-pointer">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
