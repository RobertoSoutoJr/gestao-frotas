import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { FuelForm } from '../components/forms/FuelForm';
import { Fuel } from 'lucide-react';

export function FuelPage({ trucks, drivers, onRefetch }) {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Abastecimento</CardTitle>
        </CardHeader>
        <CardContent>
          {trucks.length === 0 || drivers.length === 0 ? (
            <EmptyState
              icon={Fuel}
              title="Dados faltando"
              description="Você precisa cadastrar pelo menos um caminhão e um motorista antes de adicionar registros de abastecimento"
            />
          ) : (
            <FuelForm trucks={trucks} drivers={drivers} onSuccess={onRefetch} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
