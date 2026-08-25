import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { formatDate, formatLatency, cn } from '../utils';
import { STATUS_COLORS, METHOD_COLORS } from '../constants';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Monitors() {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', method: 'GET', interval_seconds: 60, expected_status: 200 });
  const [formError, setFormError] = useState('');

  const handleIntervalChange = (e) => {
    const val = parseInt(e.target.value) || 60;
    setForm({ ...form, interval_seconds: Math.max(1, val) });
  };

  const handleExpectedChange = (e) => {
    const val = parseInt(e.target.value) || 200;
    setForm({ ...form, expected_status: Math.max(1, val) });
  };
  const [alertCounts, setAlertCounts] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.monitors.list({ page, limit: 20, search, active: '' });
      setMonitors(res.data);
      setTotal(res.total);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAlertCounts = async () => {
    try {
      const alerts = await api.alerts.list({ status: 'open' });
      const counts = {};
      for (const a of alerts) {
        if (a.monitor_id) {
          counts[a.monitor_id] = (counts[a.monitor_id] || 0) + 1;
        }
      }
      setAlertCounts(counts);
    } catch {
      // ignore
    }
  };

  useEffect(() => { load(); }, [page, search]);
  useEffect(() => { loadAlertCounts(); }, [page, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.monitors.create(form);
      setForm({ name: '', url: '', method: 'GET', interval_seconds: 60, expected_status: 200 });
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handlePause = async (id) => { await api.monitors.pause(id); load(); };
  const handleActivate = async (id) => { await api.monitors.activate(id); load(); };
  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este monitor?')) return;
    await api.monitors.delete(id);
    load();
  };

  const statusBadge = (m) => {
    if (m.is_deleted) return <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">Eliminado</Badge>;
    if (!m.is_active) return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Pausado</Badge>;
    if (m.last_status == null) return <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">Sin checks</Badge>;
    const cls = STATUS_COLORS[m.last_status] || STATUS_COLORS.default;
    return <Badge className={cls}>{m.last_status}</Badge>;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Monitores</h1>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancelar' : 'Nuevo monitor'}</Button>
      </div>

      {showForm && (
        <Card>
          <h3 className="font-medium mb-4">Crear monitor</h3>
          {formError && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-3 rounded mb-4 text-sm">{formError}</div>}
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input label="URL" type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} required />
            <select className="input" value={form.method} onChange={e => setForm({ ...form, method: e.target.value })}>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
            <Input label="Intervalo (seg)" type="number" value={form.interval_seconds} onChange={handleIntervalChange} min="1" />
            <Input label="Status esperado" type="number" value={form.expected_status} onChange={handleExpectedChange} min="1" />
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full sm:w-auto">Crear</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="mb-4">
          <Input label="Buscar" placeholder="Buscar por nombre o URL..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        {loading ? <div className="text-slate-400 text-center py-12">Cargando...</div> : monitors.length === 0 ? (
          <p className="text-slate-400 text-center py-12 text-sm">No hay monitores.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Nombre</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Método</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">URL</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Último check</th>
                <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Acciones</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {monitors.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                    <td className="py-3 px-4 font-medium">{m.name}</td>
                    <td className="py-3 px-4"><Badge className={METHOD_COLORS[m.method] || METHOD_COLORS.default}>{m.method}</Badge></td>
                    <td className="py-3 px-4 truncate max-w-[200px]">{m.url}</td>
                     <td className="py-3 px-4">{statusBadge(m)}</td>
                     <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                       {m.last_checked_at ? formatDate(m.last_checked_at) : '-'}
                       {alertCounts[m.id] ? <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">{alertCounts[m.id]} alerta{alertCounts[m.id] > 1 ? 's' : ''}</span> : null}
                     </td>
                     <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/monitors/${m.id}`}><Button variant="ghost" className="text-xs px-2 py-1">Ver</Button></Link>
                        {m.is_active ? (
                          <Button variant="ghost" onClick={() => handlePause(m.id)} className="text-xs px-2 py-1">Pausar</Button>
                        ) : (
                          <Button variant="ghost" onClick={() => handleActivate(m.id)} className="text-xs px-2 py-1">Activar</Button>
                        )}
                        <Button variant="ghost" onClick={() => handleDelete(m.id)} className="text-xs px-2 py-1 text-red-600 dark:text-red-400">Eliminar</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {total > 20 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">Página {page} de {Math.ceil(total / 20)}</span>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
              <Button variant="secondary" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Siguiente</Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
