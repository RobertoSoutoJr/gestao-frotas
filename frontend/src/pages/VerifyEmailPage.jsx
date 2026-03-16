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

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

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

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit quando todos preenchidos
    if (value && index === 5) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleSubmit(fullCode);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      handleSubmit(pasted);
    }
  };

  const handleSubmit = async (fullCode) => {
    const codeStr = fullCode || code.join('');
    if (codeStr.length !== 6) {
      showError('Erro', 'Digite o código completo de 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(email, codeStr);
      success('Conta verificada!', 'Seu email foi verificado com sucesso');
    } catch (err) {
      showError('Código inválido', err.message || 'Verifique o código e tente novamente');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendCode(email);
      success('Código reenviado!', 'Verifique seu email');
      setCountdown(60);
    } catch (err) {
      showError('Erro', err.message || 'Não foi possível reenviar o código');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo */}
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
            Verifique seu email
          </h2>
          <p className="text-xl text-purple-100 leading-relaxed">
            Enviamos um código de 6 dígitos para o seu email. Digite-o abaixo para ativar sua conta.
          </p>
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
            <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Verifique seu email
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Enviamos um código de 6 dígitos para
            </p>
            <p className="text-indigo-600 font-semibold mt-1">{email}</p>
          </div>

          {/* Input de código */}
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
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-zinc-300 dark:border-zinc-600 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              />
            ))}
          </div>

          <Button
            onClick={() => handleSubmit()}
            variant="primary"
            loading={loading}
            className="w-full py-3 text-base font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Verificar email
          </Button>

          <div className="mt-6 text-center space-y-4">
            <div>
              {countdown > 0 ? (
                <p className="text-zinc-500 text-sm">
                  Reenviar código em <span className="font-semibold text-indigo-600">{countdown}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-2 mx-auto transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
                  Reenviar código
                </button>
              )}
            </div>

            <button
              onClick={onBack}
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm flex items-center gap-1 mx-auto transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao cadastro
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-center text-sm text-zinc-500">
              &copy; 2026 FrotaPro. Gestão profissional de frotas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
