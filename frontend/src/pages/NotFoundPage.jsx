import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { AlertCircle } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-accent)]/15 mb-6">
        <AlertCircle className="h-8 w-8 text-[var(--color-accent)]" />
      </div>
      <h1 className="text-2xl font-bold text-[var(--color-text)]">Pagina nao encontrada</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)] max-w-md">
        A pagina que voce esta procurando nao existe ou foi movida.
      </p>
      <Button
        variant="primary"
        className="mt-6"
        onClick={() => navigate('/dashboard')}
      >
        Voltar ao Dashboard
      </Button>
    </div>
  );
}
