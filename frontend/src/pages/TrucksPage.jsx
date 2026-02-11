import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { TruckForm } from '../components/forms/TruckForm';
import { Truck, Gauge } from 'lucide-react';
import { formatNumber } from '../lib/utils';

export function TrucksPage({ trucks, onRefetch }) {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Register New Truck</CardTitle>
        </CardHeader>
        <CardContent>
          <TruckForm onSuccess={onRefetch} />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Fleet ({trucks.length})
        </h2>

        {trucks.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                icon={Truck}
                title="No trucks registered"
                description="Start by adding your first truck to the fleet"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trucks.map(truck => (
              <Card key={truck.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                        {truck.placa}
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {truck.modelo}
                      </p>
                    </div>
                    {truck.ano && (
                      <Badge variant="default">{truck.ano}</Badge>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Gauge className="h-4 w-4 text-zinc-400" />
                      <span className="font-mono font-medium text-zinc-900 dark:text-zinc-50">
                        {formatNumber(truck.km_atual || 0, 0)} km
                      </span>
                    </div>

                    {truck.capacidade_silo_ton && (
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-zinc-400" />
                        <span className="text-zinc-600 dark:text-zinc-400">
                          Capacity: {formatNumber(truck.capacidade_silo_ton)} tons
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
