import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { formatDate } from '../utils';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const FILTERS = [
  { key: '', label: 'Todas' },
  { key: 'open', label: 'Abiertas' },
  { key: 'read', label: 'Leídas' },
  { key: 'closed', label: 'Cerradas' },
];

const STATUS_COLORS = {
  open: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  read: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  closed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.status = filter;
      const data = await api.alerts.list(params);
      setAlerts(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  useEffect(() => {
    api.alerts.markAllRead().catch(() => {});
  }, []);

  const handleMarkRead = async (id) => {
    setActionLoading(true);
    try {
      await api.alerts.markRead(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'read' } : a));
    } catch {
      // ignore
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async (id) => {
    setActionLoading(true);
    try {
      await api.alerts.close(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'closed', closed_at: new Date().toISOString() } : a));
    } catch {
      // ignore
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await api.alerts.markAllRead();
      setAlerts(prev => prev.map(a => ({ ...a, status: 'read' })));
    } catch {
      // ignore
    } finally {
      setActionLoading(false);
    }
  };

  const activeAlerts = useMemo(() => alerts.filter(a => a.status === 'open'), [alerts]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Alertas</h1>
        {activeAlerts.length > 0 && (
          <Button variant="secondary" onClick={handleMarkAllRead} disabled={actionLoading}>
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              filter === f.key
                ? 'bg-slate-900 dark:bg-slate-700 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-3 rounded text-sm">{error}</div>}

      {loading ? (
        <div className="text-slate-400 text-center py-12">Cargando alertas...</div>
      ) : alerts.length === 0 ? (
        <Card>
          <p className="text-slate-400 text-center py-12 text-sm">No hay alertas.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Monitor</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Mensaje</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Estado</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Fecha</th>
              <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Acciones</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {alerts.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                  <td className="py-3 px-4 text-xs font-medium truncate max-w-[200px]">{a.monitor_name || '-'}</td>
                  <td className="py-3 px-4 text-xs">{a.message}</td>
                  <td className="py-3 px-4">
                    <Badge className={STATUS_COLORS[a.status] || STATUS_COLORS.closed}>{a.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">{formatDate(a.fired_at)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {a.status === 'open' && (
                        <Button variant="ghost" onClick={() => handleMarkRead(a.id)} disabled={actionLoading} className="text-xs px-2 py-1">Leer</Button>
                      )}
                      {a.status !== 'closed' && (
                        <Button variant="ghost" onClick={() => handleClose(a.id)} disabled={actionLoading} className="text-xs px-2 py-1 text-red-600 dark:text-red-400">Cerrar</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
