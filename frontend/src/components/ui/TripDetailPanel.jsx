import {
  MapPin, ArrowRight, Truck, Users, Package, DollarSign,
  Calendar, CheckCircle, Clock, Route, FileText, Trash2
} from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';
import { Drawer } from './Drawer';
import { TripMapDetail } from './TripMapDetail';
import { TripCostsPanel } from './TripCostsPanel';
import { DocumentGallery } from './DocumentGallery';
import { formatCurrency, formatDate } from '../../lib/utils';

function InfoRow({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color || 'text-[var(--color-text-secondary)]'}`} />}
      <div className="min-w-0">
        <p className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-[var(--color-text)] truncate">{value || '—'}</p>
      </div>
    </div>
  );
}

function FinancialBlock({ label, value, variant }) {
  const colors = {
    revenue: 'text-emerald-400',
    cost: 'text-red-400',
    profit: '',
    neutral: 'text-[var(--color-text)]',
  };
  const textColor = variant === 'profit'
    ? (Number(value) >= 0 ? 'text-emerald-400' : 'text-red-400')
    : colors[variant] || colors.neutral;

  const formatted = typeof value === 'number' ? formatCurrency(value) : value;

  return (
    <div className="text-center">
      <p className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-bold ${textColor}`}>{formatted}</p>
    </div>
  );
}

export function TripDetailPanel({ trip, isOpen, onClose, onFinalize, onDelete, onRefetch, formasPagamento }) {
  if (!trip) return null;

  const custoTotal = (Number(trip.custo_combustivel) || 0) + (Number(trip.custo_pedagio) || 0) +
    (Number(trip.custo_manutencao) || 0) + (Number(trip.custo_outros) || 0);
  const receita = Number(trip.valor_total_frete) || 0;
  const lucro = receita - custoTotal;
  const margem = receita > 0 ? (lucro / receita) * 100 : 0;

  const title = `${trip.fornecedores?.cidade || trip.fornecedores?.nome || '?'} → ${trip.clientes?.cidade || trip.clientes?.nome || '?'}`;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={title} width="max-w-xl">
      <div className="space-y-6">
        {/* Status + Date header */}
        <div className="flex items-center justify-between">
          <Badge variant={trip.status === 'finalizada' ? 'success' : 'warning'}>
            {trip.status === 'finalizada' ? 'Finalizada' : 'Em Andamento'}
          </Badge>
          <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(trip.data_viagem || trip.created_at)}
          </span>
        </div>

        {/* Route */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Route className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-[var(--color-text)]">Rota</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex-1">
              <p className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider">Origem</p>
              <p className="font-medium text-[var(--color-text)]">{trip.fornecedores?.nome}</p>
              {trip.fornecedores?.cidade && (
                <p className="text-xs text-[var(--color-text-secondary)]">{trip.fornecedores.cidade}/{trip.fornecedores.estado}</p>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-[var(--color-text-secondary)] shrink-0" />
            <div className="flex-1 text-right">
              <p className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider">Destino</p>
              <p className="font-medium text-[var(--color-text)]">{trip.clientes?.nome}</p>
              {trip.clientes?.cidade && (
                <p className="text-xs text-[var(--color-text-secondary)]">{trip.clientes.cidade}/{trip.clientes.estado}</p>
              )}
            </div>
          </div>
          {trip.distancia_km > 0 && (
            <p className="mt-2 text-xs text-[var(--color-text-secondary)] text-center">
              {trip.distancia_km} km · {trip.eixos || '?'} eixos
            </p>
          )}
        </div>

        {/* Map */}
        <TripMapDetail
          trip={{
            ...trip,
            origem_cidade: trip.origem_cidade || trip.fornecedores?.cidade,
            origem_estado: trip.origem_estado || trip.fornecedores?.estado,
            destino_cidade: trip.destino_cidade || trip.clientes?.cidade,
            destino_estado: trip.destino_estado || trip.clientes?.estado,
          }}
        />

        {/* Truck + Driver + Product */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <InfoRow label="Caminhao" value={`${trip.caminhoes?.placa} · ${trip.caminhoes?.modelo || ''}`} icon={Truck} color="text-emerald-400" />
          <InfoRow label="Motorista" value={trip.motoristas?.nome} icon={Users} color="text-blue-400" />
          <InfoRow label="Produto" value={`${trip.produto} · ${trip.quantidade_sacas} sacas`} icon={Package} color="text-purple-400" />
          <InfoRow label="Peso Total" value={`${((trip.quantidade_sacas || 0) * 60).toLocaleString('pt-BR')} kg`} icon={Package} color="text-[var(--color-text-secondary)]" />
        </div>

        {/* Financial summary */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="grid grid-cols-3 gap-4">
            <FinancialBlock label="Receita" value={receita} variant="revenue" />
            <FinancialBlock label="Custos" value={custoTotal} variant="cost" />
            <FinancialBlock label="Lucro" value={lucro} variant="profit" />
          </div>
          {receita > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--color-border)] text-center">
              <span className={`text-sm font-semibold ${margem >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                Margem: {margem.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Detailed Costs */}
        <TripCostsPanel
          tripId={trip.id}
          readOnly={trip.status === 'finalizada'}
          onTotalsChange={() => onRefetch?.()}
        />

        {/* Payment info */}
        {trip.forma_pagamento && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <DollarSign className="h-4 w-4" />
            Pago via: {formasPagamento?.find(f => f.value === trip.forma_pagamento)?.label || trip.forma_pagamento}
          </div>
        )}

        {/* Observations */}
        {trip.observacoes && (
          <div className="rounded-lg bg-[var(--color-surface)] p-3">
            <p className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Observacoes</p>
            <p className="text-sm text-[var(--color-text)]">{trip.observacoes}</p>
          </div>
        )}

        {/* Documents */}
        <div>
          <p className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">Documentos</p>
          <DocumentGallery entidadeTipo="viagem" entidadeId={trip.id} />
        </div>

        {/* Actions */}
        {trip.status === 'cadastrada' && (
          <div className="flex gap-3 pt-2 border-t border-[var(--color-border)]">
            <Button
              variant="success"
              className="flex-1"
              onClick={() => onFinalize?.(trip)}
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Finalizar Viagem
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete?.(trip)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  );
}
