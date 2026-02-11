import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { MaintenanceForm } from '../components/forms/MaintenanceForm';
import { Wrench } from 'lucide-react';

export function MaintenancePage({ trucks, onRefetch }) {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Register Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          {trucks.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No trucks available"
              description="Register at least one truck before adding maintenance records"
            />
          ) : (
            <MaintenanceForm trucks={trucks} onSuccess={onRefetch} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
