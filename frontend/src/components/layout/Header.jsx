import { Truck } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Fleet<span className="text-blue-600">Pro</span>
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Financial & Operational Control
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
