import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  MapPin, ArrowRight, Truck, Users, Package, DollarSign,
  Calendar, CheckCircle, GripVertical, Clock, Route
} from 'lucide-react';
import { Badge } from './Badge';
import { formatCurrency, formatDate } from '../../lib/utils';

const COLUMNS = [
  { id: 'cadastrada', label: 'Em Andamento', color: 'emerald', icon: Clock },
  { id: 'finalizada', label: 'Finalizadas', color: 'blue', icon: CheckCircle },
];

// ─── Draggable Trip Card ───
function TripCard({ trip, onClick, isDragging }) {
  const custoTotal = (Number(trip.custo_combustivel) || 0) + (Number(trip.custo_pedagio) || 0) +
    (Number(trip.custo_manutencao) || 0) + (Number(trip.custo_outros) || 0);
  const receita = Number(trip.valor_total_frete) || 0;
  const lucro = receita - custoTotal;

  return (
    <div
      className={`group rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3.5 cursor-pointer transition-all duration-150 ${
        isDragging
          ? 'shadow-lg shadow-[var(--color-shadow)] border-[var(--color-accent)] scale-[1.02] rotate-1'
          : 'hover:border-[var(--color-border-hover)] hover:shadow-sm'
      }`}
      onClick={() => onClick?.(trip)}
    >
      {/* Route */}
      <div className="flex items-center gap-1.5 text-sm">
        <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        <span className="font-medium text-[var(--color-text)] truncate">
          {trip.fornecedores?.nome?.split(' ').slice(0, 2).join(' ') || '?'}
        </span>
        <ArrowRight className="h-3 w-3 text-[var(--color-text-secondary)] shrink-0" />
        <span className="font-medium text-[var(--color-text)] truncate">
          {trip.clientes?.nome?.split(' ').slice(0, 2).join(' ') || '?'}
        </span>
      </div>

      {/* Cities */}
      {(trip.fornecedores?.cidade || trip.clientes?.cidade) && (
        <p className="mt-1 text-[11px] text-[var(--color-text-secondary)] truncate">
          {trip.fornecedores?.cidade || '?'} → {trip.clientes?.cidade || '?'}
          {trip.distancia_km ? ` · ${trip.distancia_km}km` : ''}
        </p>
      )}

      {/* Meta row */}
      <div className="mt-2.5 flex items-center gap-3 text-[11px] text-[var(--color-text-secondary)]">
        <span className="flex items-center gap-1">
          <Truck className="h-3 w-3" />
          {trip.caminhoes?.placa || '?'}
        </span>
        <span className="flex items-center gap-1">
          <Package className="h-3 w-3" />
          {trip.quantidade_sacas}sc
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(trip.data_viagem || trip.created_at).split('/').slice(0, 2).join('/')}
        </span>
      </div>

      {/* Financial row */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-emerald-400">
          {formatCurrency(receita)}
        </span>
        {trip.status === 'finalizada' && custoTotal > 0 && (
          <span className={`text-[11px] font-medium ${lucro >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
            Lucro: {formatCurrency(lucro)}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Sortable Wrapper ───
function SortableTripCard({ trip, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: trip.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TripCard trip={trip} onClick={onClick} isDragging={isDragging} />
    </div>
  );
}

// ─── Column ───
function KanbanColumn({ column, trips, onTripClick }) {
  const Icon = column.icon;
  const colorMap = {
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-500' },
  };
  const c = colorMap[column.color] || colorMap.emerald;

  // Sum financials
  const totalFrete = trips.reduce((s, t) => s + (Number(t.valor_total_frete) || 0), 0);

  return (
    <div className="flex flex-col min-w-[320px] flex-1 max-w-lg">
      {/* Column header */}
      <div className={`flex items-center justify-between rounded-lg ${c.bg} border ${c.border} px-4 py-2.5 mb-3`}>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${c.dot}`} />
          <span className={`text-sm font-semibold ${c.text}`}>{column.label}</span>
          <span className={`text-xs ${c.text} opacity-60`}>({trips.length})</span>
        </div>
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
          {formatCurrency(totalFrete)}
        </span>
      </div>

      {/* Cards area */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1 pb-4" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--color-text-secondary)]">
            <Icon className="h-8 w-8 opacity-30 mb-2" />
            <p className="text-sm">Nenhuma viagem</p>
          </div>
        ) : (
          trips.map(trip => (
            <SortableTripCard key={trip.id} trip={trip} onClick={onTripClick} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Kanban Board ───
export function TripKanbanView({ trips, onTripClick, onFinalize }) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const columns = useMemo(() => {
    return COLUMNS.map(col => ({
      ...col,
      trips: trips
        .filter(t => t.status === col.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    }));
  }, [trips]);

  const activeTrip = activeId ? trips.find(t => t.id.toString() === activeId) : null;

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const tripId = active.id;
    const trip = trips.find(t => t.id.toString() === tripId);
    if (!trip) return;

    // Check if dropped over a trip in the "finalizada" column
    const overTrip = trips.find(t => t.id.toString() === over.id);
    const targetStatus = overTrip?.status;

    // If the trip is "cadastrada" and dropped onto a "finalizada" area, trigger finalize
    if (trip.status === 'cadastrada' && targetStatus === 'finalizada') {
      onFinalize?.(trip);
    }
  };

  const handleDragOver = (event) => {
    // Allow visual feedback when dragging between columns
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map(col => (
          <KanbanColumn
            key={col.id}
            column={col}
            trips={col.trips}
            onTripClick={onTripClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTrip ? (
          <div className="w-[320px]">
            <TripCard trip={activeTrip} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
