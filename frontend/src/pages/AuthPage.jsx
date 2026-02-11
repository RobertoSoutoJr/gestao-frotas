import { useState } from 'react';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return isLogin ? (
    <LoginPage onToggle={toggleMode} />
  ) : (
    <RegisterPage onToggle={toggleMode} />
  );
}
