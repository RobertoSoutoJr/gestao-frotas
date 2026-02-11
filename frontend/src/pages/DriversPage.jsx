import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { DriverForm } from '../components/forms/DriverForm';
import { Users, Phone, CreditCard } from 'lucide-react';
import { formatCPF } from '../lib/utils';

export function DriversPage({ drivers, onRefetch }) {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Register New Driver</CardTitle>
        </CardHeader>
        <CardContent>
          <DriverForm onSuccess={onRefetch} />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Team ({drivers.length})
        </h2>

        {drivers.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                icon={Users}
                title="No drivers registered"
                description="Add your first driver to start managing the team"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {drivers.map(driver => (
              <Card key={driver.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <Users className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {driver.nome}
                      </h3>
                      <div className="mt-1 flex items-center gap-4 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {formatCPF(driver.cpf)}
                        </span>
                        {driver.telefone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {driver.telefone}
                          </span>
                        )}
                      </div>
                    </div>
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
