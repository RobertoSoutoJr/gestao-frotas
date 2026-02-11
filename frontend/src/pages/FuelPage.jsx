import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { FuelForm } from '../components/forms/FuelForm';
import { Fuel } from 'lucide-react';

export function FuelPage({ trucks, drivers, onRefetch }) {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Register Fuel Record</CardTitle>
        </CardHeader>
        <CardContent>
          {trucks.length === 0 || drivers.length === 0 ? (
            <EmptyState
              icon={Fuel}
              title="Missing data"
              description="You need to register at least one truck and one driver before adding fuel records"
            />
          ) : (
            <FuelForm trucks={trucks} drivers={drivers} onSuccess={onRefetch} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
