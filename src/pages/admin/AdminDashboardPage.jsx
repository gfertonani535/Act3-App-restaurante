import { useNavigate } from 'react-router-dom';
import {
  Banknote,
  CircleCheck,
  ClipboardList,
  DollarSign,
  Eye,
  ListOrdered,
  PackagePlus,
  Pencil,
  Plus,
  Receipt,
  Users,
  Utensils,
  Wallet,
} from 'lucide-react';
import { AdminPageContainer } from '@/components/common/AdminPageContainer.jsx';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { cn } from '@/lib/utils';

const dashboardMetrics = [
  {
    title: 'Ventas del d\u00eda',
    value: '$12.450',
    helper: '+12% vs ayer',
    helperTone: 'success',
    icon: Banknote,
  },
  {
    title: '\u00d3rdenes abiertas',
    value: '24',
    helper: '8 en preparaci\u00f3n',
    icon: ClipboardList,
  },
  {
    title: 'Ticket promedio',
    value: '$18.40',
    helper: 'Basado en \u00f3rdenes pagadas',
    icon: Receipt,
  },
  {
    title: 'Mesas activas',
    value: '12',
    helper: '4 listas para cobrar',
    icon: Utensils,
  },
];

const tableStatuses = [
  { id: 'T-01', status: 'FREE' },
  { id: 'T-02', status: 'OCCUPIED' },
  { id: 'T-03', status: 'READY_TO_CHARGE' },
  { id: 'T-04', status: 'PAID' },
  { id: 'T-05', status: 'FREE' },
  { id: 'T-06', status: 'OCCUPIED' },
  { id: 'T-07', status: 'FREE' },
  { id: 'T-08', status: 'READY_TO_CHARGE' },
  { id: 'T-09', status: 'OCCUPIED' },
  { id: 'T-10', status: 'PAID' },
  { id: 'T-11', status: 'FREE' },
  { id: 'T-12', status: 'OCCUPIED' },
  { id: 'T-13', status: 'FREE' },
  { id: 'T-14', status: 'READY_TO_CHARGE' },
  { id: 'T-15', status: 'FREE' },
];

const tableStatusMeta = {
  FREE: {
    label: 'Libre',
    icon: Utensils,
    className: 'border-neutral-200 bg-white text-neutral-950',
    iconClassName: 'bg-neutral-100 text-neutral-500',
    legendClassName: 'bg-neutral-200',
  },
  OCCUPIED: {
    label: 'Ocupada',
    icon: Users,
    className: 'border-neutral-200 bg-neutral-50 text-neutral-950',
    iconClassName: 'bg-white text-neutral-500',
    legendClassName: 'bg-neutral-400',
  },
  READY_TO_CHARGE: {
    label: 'Lista para cobrar',
    icon: Receipt,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    iconClassName: 'bg-emerald-100 text-emerald-700',
    legendClassName: 'bg-emerald-500',
  },
  PAID: {
    label: 'Pagada',
    icon: CircleCheck,
    className: 'border-neutral-950 bg-neutral-950 text-white',
    iconClassName: 'bg-neutral-900 text-white',
    legendClassName: 'bg-neutral-950',
  },
};

const recentOrders = [
  {
    id: '4829',
    table: 'M-12',
    customerOrWaiter: 'Carlos Ruiz',
    paymentStatus: 'UNPAID',
    total: 33.5,
    time: '12:45',
  },
  {
    id: '4828',
    table: 'M-04',
    customerOrWaiter: 'Ana Bel\u00e9n',
    paymentStatus: 'PAID',
    total: 18.2,
    time: '12:38',
  },
  {
    id: '4827',
    table: 'M-15',
    customerOrWaiter: 'Grupo Rossi',
    paymentStatus: 'PARTIAL',
    total: 127,
    time: '12:30',
  },
];

const paymentStatusMeta = {
  UNPAID: { label: 'No pagado', variant: 'destructive' },
  PAID: { label: 'Pagado', variant: 'success' },
  PARTIAL: { label: 'Parcial', variant: 'warning' },
};

function formatCurrency(value) {
  return `$${Number(value).toFixed(2)}`;
}

function DashboardMetricCard({ helper, helperTone, icon: Icon, title, value }) {
  return (
    <Card className="rounded-none border-neutral-200 bg-white">
      <CardContent className="flex min-h-[128px] items-center gap-5 p-5 sm:p-6">
        <div className="grid size-14 shrink-0 place-items-center rounded-full bg-neutral-100 text-neutral-950">
          <Icon className="size-6" strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-5 text-neutral-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold leading-none text-neutral-950">{value}</p>
          <p className={cn('mt-2 text-sm font-medium text-neutral-500', helperTone === 'success' && 'text-emerald-600')}>
            {helper}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function TableStatusGrid() {
  return (
    <Card className="rounded-none border-neutral-200 bg-white">
      <CardHeader className="border-neutral-200 px-5 sm:px-6">
        <CardTitle>Estado de mesas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {tableStatuses.map((table) => {
            const meta = tableStatusMeta[table.status];
            const Icon = meta.icon;

            return (
              <div
                className={cn('flex min-h-16 items-center gap-3 border px-3 py-3 transition-colors', meta.className)}
                key={table.id}
              >
                <span className={cn('grid size-9 shrink-0 place-items-center rounded-full', meta.iconClassName)}>
                  <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold leading-5">{table.id}</span>
                  <span className="block text-xs font-medium leading-4">{meta.label}</span>
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {Object.entries(tableStatusMeta).map(([status, meta]) => (
            <span className="inline-flex items-center gap-2 text-sm text-neutral-500" key={status}>
              <span className={cn('size-3 rounded-sm', meta.legendClassName)} aria-hidden="true" />
              {meta.label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionsCard({ onNavigate }) {
  return (
    <Card className="rounded-none border-neutral-200 bg-white">
      <CardHeader className="border-neutral-200 px-5 sm:px-6">
        <CardTitle>{'Accesos r\u00e1pidos'}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 p-5 sm:p-6">
        <Button className="w-full" onClick={() => onNavigate('/admin/pedidos')} type="button">
          <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
          Nueva orden
        </Button>
        <Button className="w-full" onClick={() => onNavigate('/admin/pedidos')} type="button" variant="secondary">
          <ListOrdered className="size-4" strokeWidth={2} aria-hidden="true" />
          {'Ver \u00f3rdenes'}
        </Button>
        <Button className="w-full" onClick={() => onNavigate('/admin/cierre-de-caja')} type="button" variant="secondary">
          <Wallet className="size-4" strokeWidth={2} aria-hidden="true" />
          Cerrar caja
        </Button>
        <Button className="w-full" onClick={() => onNavigate('/admin/productos/nuevo')} type="button" variant="secondary">
          <PackagePlus className="size-4" strokeWidth={2} aria-hidden="true" />
          {'A\u00f1adir producto'}
        </Button>
      </CardContent>
    </Card>
  );
}

function PaymentStatusBadge({ status }) {
  const meta = paymentStatusMeta[status];

  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

function OrderActions({ orderId }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        aria-label={`Ver orden ${orderId}`}
        className="size-9 min-h-9 p-0"
        size="icon"
        type="button"
        variant="secondary"
      >
        <Eye className="size-4" strokeWidth={2} aria-hidden="true" />
      </Button>
      <Button
        aria-label={`Editar orden ${orderId}`}
        className="size-9 min-h-9 p-0"
        size="icon"
        type="button"
        variant="secondary"
      >
        <Pencil className="size-4" strokeWidth={2} aria-hidden="true" />
      </Button>
      <Button
        aria-label={`Cobrar orden ${orderId}`}
        className="size-9 min-h-9 p-0"
        size="icon"
        type="button"
        variant="secondary"
      >
        <DollarSign className="size-4" strokeWidth={2} aria-hidden="true" />
      </Button>
    </div>
  );
}

function RecentOrdersTable() {
  return (
    <Card className="rounded-none border-neutral-200 bg-white">
      <CardHeader className="border-neutral-200 px-5 sm:px-6">
        <CardTitle>{'\u00d3rdenes recientes'}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50 hover:bg-neutral-50">
              <TableHead>Orden</TableHead>
                <TableHead>Mesa</TableHead>
                <TableHead>Cliente/Mozo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-bold text-neutral-950">#{order.id}</TableCell>
                  <TableCell>{order.table}</TableCell>
                  <TableCell>{order.customerOrWaiter}</TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </TableCell>
                  <TableCell className="font-semibold text-neutral-950">{formatCurrency(order.total)}</TableCell>
                  <TableCell>{order.time}</TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <OrderActions orderId={order.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="grid gap-3 p-4 md:hidden">
          {recentOrders.map((order) => (
            <article className="border border-neutral-200 bg-white p-4" key={order.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-neutral-950">#{order.id}</h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    {order.table} · {order.customerOrWaiter}
                  </p>
                </div>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[0.05em] text-neutral-400">Total</span>
                  <span className="font-semibold text-neutral-950">{formatCurrency(order.total)}</span>
                </span>
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[0.05em] text-neutral-400">Hora</span>
                  <span>{order.time}</span>
                </span>
              </div>
              <div className="mt-4">
                <OrderActions orderId={order.id} />
              </div>
            </article>
          ))}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-50 px-5 py-4 sm:px-6">
          <span className="text-sm text-neutral-500">{'Mostrando 1 a 3 de 3 \u00f3rdenes'}</span>
          <div className="flex items-center gap-1">
            <Button className="size-9 min-h-9 p-0" disabled size="icon" type="button" variant="secondary">
              <span aria-hidden="true">‹</span>
            </Button>
            <Button className="size-9 min-h-9 p-0" size="icon" type="button">
              1
            </Button>
            <Button className="size-9 min-h-9 p-0" disabled size="icon" type="button" variant="secondary">
              <span aria-hidden="true">›</span>
            </Button>
          </div>
        </footer>
      </CardContent>
    </Card>
  );
}

export function AdminDashboardPage() {
  const navigate = useNavigate();

  return (
    <AdminPageContainer>
      <PageHeader
        title="Dashboard"
        description="Resumen operativo del turno actual"
        primaryAction={
          <Button onClick={() => navigate('/admin/pedidos')} type="button">
            <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
            Nueva orden
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="M\u00e9tricas del turno">
        {dashboardMetrics.map((metric) => (
          <DashboardMetricCard key={metric.title} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <TableStatusGrid />
        <QuickActionsCard onNavigate={navigate} />
      </section>

      <RecentOrdersTable />
    </AdminPageContainer>
  );
}
