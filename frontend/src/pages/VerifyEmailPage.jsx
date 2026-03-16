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
    <div className="min-h-screen flex bg-[#090014]">
      <div className="vw-grid-bg" />
      <div className="vw-chromatic" />

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-b from-[#FF9900] to-[#FF00FF] opacity-15 blur-[100px]" />
        <div className="relative z-10 flex flex-col px-16 max-w-xl">
          <div className="flex items-center gap-4 mb-12">
            <div className="flex h-16 w-16 items-center justify-center border-2 border-[#00FFFF] rotate-45 bg-[#00FFFF]/10 shadow-[0_0_30px_rgba(0,255,255,0.3)]">
              <Truck className="h-8 w-8 text-[#00FFFF] -rotate-45" />
            </div>
            <div>
              <h1 className="font-[Orbitron] text-4xl font-black tracking-wider text-gradient-sunset">FROTAPRO</h1>
            </div>
          </div>
          <h2 className="font-[Orbitron] text-4xl font-black leading-tight mb-6 text-[#E0E0E0] text-glow-white">
            VERIFICAÇÃO<br /><span className="text-[#00FFFF] text-glow-cyan">DE EMAIL</span>
          </h2>
          <p className="font-mono text-lg text-[#E0E0E0]/60 leading-relaxed">
            &gt; Enviamos um código de 6 dígitos para o seu email. Digite-o para ativar sua conta.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-[#00FFFF] rotate-45 bg-[#00FFFF]/10">
              <Truck className="h-5 w-5 text-[#00FFFF] -rotate-45" />
            </div>
            <span className="font-[Orbitron] text-2xl font-black text-gradient-sunset">FROTAPRO</span>
          </div>

          <div className="border-2 border-[#00FFFF] bg-black/80 shadow-[0_0_30px_rgba(0,255,255,0.15)]">
            <div className="flex items-center gap-3 border-b border-[#00FFFF]/30 bg-[#00FFFF]/5 px-4 py-3">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-[#FF00FF]" />
                <div className="h-3 w-3 rounded-full bg-[#00FFFF]" />
                <div className="h-3 w-3 rounded-full bg-[#FF9900]" />
              </div>
              <span className="font-mono text-xs text-[#00FFFF]/60">&gt; verify_email.exe</span>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 border-2 border-[#00FFFF] rotate-45 flex items-center justify-center mb-4 bg-[#00FFFF]/10 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                  <Mail className="h-8 w-8 text-[#00FFFF] -rotate-45" />
                </div>
                <h2 className="font-[Orbitron] text-xl font-bold uppercase tracking-wider text-[#00FFFF] drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
                  Verificar Email
                </h2>
                <p className="font-mono text-sm text-[#E0E0E0]/50 mt-2">&gt; Código enviado para</p>
                <p className="font-mono text-sm text-[#FF00FF] mt-1">{email}</p>
              </div>

              {/* Code Inputs */}
              <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
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
                    className="w-12 h-14 text-center font-[Orbitron] text-2xl font-bold border-2 border-[#FF00FF]/50 bg-black/80 text-[#00FFFF] focus:border-[#00FFFF] focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] outline-none transition-all"
                  />
                ))}
              </div>

              <Button onClick={() => handleSubmit()} variant="primary" loading={loading} className="w-full py-3 text-base">
                <span className="inline-flex items-center gap-2 skew-x-12">Verificar</span>
              </Button>

              <div className="mt-6 text-center space-y-4">
                {countdown > 0 ? (
                  <p className="font-mono text-sm text-[#E0E0E0]/40">
                    Reenviar em <span className="text-[#FF00FF] font-semibold">{countdown}s</span>
                  </p>
                ) : (
                  <button onClick={handleResend} disabled={resending} className="font-mono text-sm text-[#00FFFF] hover:text-[#FF00FF] flex items-center gap-2 mx-auto transition-colors uppercase tracking-wider">
                    <RefreshCw className={`h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
                    Reenviar Código
                  </button>
                )}
                <button onClick={onBack} className="font-mono text-sm text-[#E0E0E0]/40 hover:text-[#00FFFF] flex items-center gap-1 mx-auto transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Voltar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
