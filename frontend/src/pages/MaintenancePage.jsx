import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { MaintenanceForm } from '../components/forms/MaintenanceForm';
import { Wrench } from 'lucide-react';

export function MaintenancePage({ trucks, onRefetch }) {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Manutenção</CardTitle>
        </CardHeader>
        <CardContent>
          {trucks.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="Nenhum caminhão disponível"
              description="Cadastre pelo menos um caminhão antes de adicionar registros de manutenção"
            />
          ) : (
            <MaintenanceForm trucks={trucks} onSuccess={onRefetch} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
