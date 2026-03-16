import { useState } from 'react';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { VerifyEmailPage } from './VerifyEmailPage';
import { useAuth } from '../hooks/useAuth';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { pendingVerification, cancelVerification } = useAuth();

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  if (pendingVerification) {
    return (
      <VerifyEmailPage
        email={pendingVerification}
        onBack={cancelVerification}
      />
    );
  }

  return isLogin ? (
    <LoginPage onToggle={toggleMode} />
  ) : (
    <RegisterPage onToggle={toggleMode} />
  );
}
