import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Truck, Mail, ArrowLeft, RefreshCw } from 'lucide-react';

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
    <div className="min-h-screen flex bg-[#050506]">
      <div className="linear-bg" />
      <div className="linear-grid" />

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#5E6AD2] opacity-[0.08] blur-[120px] pointer-events-none" />
        <div className="relative z-10 flex flex-col px-16 max-w-xl">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5E6AD2]/15 border border-[#5E6AD2]/25">
              <Truck className="h-6 w-6 text-[#5E6AD2]" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-[#EDEDEF]">Frota</span>
              <span className="text-[#5E6AD2]">Pro</span>
            </h1>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-6 text-[#EDEDEF]">
            Verificação<br />
            <span className="text-[#5E6AD2]">de email.</span>
          </h2>
          <p className="text-lg text-[#8A8F98] leading-relaxed">
            Enviamos um código de 6 dígitos para o seu email. Digite-o para ativar sua conta.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5E6AD2]/15 border border-[#5E6AD2]/25">
              <Truck className="h-4 w-4 text-[#5E6AD2]" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-[#EDEDEF]">Frota</span>
              <span className="text-[#5E6AD2]">Pro</span>
            </span>
          </div>

          <div className="bg-[#0a0a0c] rounded-2xl border border-white/[0.08] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
            <div className="text-center mb-8">
              <div className="mx-auto w-14 h-14 rounded-xl bg-[#5E6AD2]/15 border border-[#5E6AD2]/25 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-[#5E6AD2]" />
              </div>
              <h2 className="text-xl font-semibold text-[#EDEDEF]">
                Verificar email
              </h2>
              <p className="text-sm text-[#8A8F98] mt-1">Código enviado para</p>
              <p className="text-sm font-medium text-[#5E6AD2] mt-0.5">{email}</p>
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
                  className="w-11 h-13 text-center font-mono text-xl font-semibold rounded-lg border border-white/10 bg-[#0F0F12] text-gray-100 focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/20 outline-none transition-all"
                  style={{ height: '52px' }}
                />
              ))}
            </div>

            <Button onClick={() => handleSubmit()} variant="primary" loading={loading} className="w-full h-10">
              Verificar código
            </Button>

            <div className="mt-6 text-center space-y-3">
              {countdown > 0 ? (
                <p className="text-sm text-[#8A8F98]">
                  Reenviar em <span className="text-[#EDEDEF] font-medium">{countdown}s</span>
                </p>
              ) : (
                <button onClick={handleResend} disabled={resending} className="text-sm text-[#5E6AD2] hover:text-[#6872D9] flex items-center gap-1.5 mx-auto transition-colors font-medium">
                  <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
                  Reenviar código
                </button>
              )}
              <button onClick={onBack} className="text-sm text-[#8A8F98] hover:text-[#EDEDEF] flex items-center gap-1 mx-auto transition-colors">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
