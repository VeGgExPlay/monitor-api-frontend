import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { formatDate, formatLatency } from '../utils';
import { STATUS_COLORS, METHOD_COLORS } from '../constants';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentLimit, setRecentLimit] = useState(10);
  const [alertStats, setAlertStats] = useState({ open: 0, read: 0, closed: 0, total: 0 });

  const loadStats = async () => {
    try {
      const data = await api.checks.stats();
      setStats(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAlertStats = async () => {
    try {
      const data = await api.alerts.stats();
      setAlertStats(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadStats();
    loadAlertStats();
    const interval = setInterval(() => { loadStats(); loadAlertStats(); }, 15000);
    return () => clearInterval(interval);
  }, []);

  const latencyData = {
    labels: stats.map(s => s.name),
    datasets: [
      {
        label: 'Latencia promedio (ms)',
        data: stats.map(s => s.avgLatency),
        borderColor: '#0f172a',
        backgroundColor: 'rgba(15,23,42,0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const statusData = {
    labels: ['Exitosos', 'Fallidos'],
    datasets: [
      {
        data: [stats.reduce((a, s) => a + s.successChecks, 0), stats.reduce((a, s) => a + (s.totalChecks - s.successChecks), 0)],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const checksPerMonitor = {
    labels: stats.map(s => s.name),
    datasets: [
      {
        label: 'Checks',
        data: stats.map(s => s.totalChecks),
        backgroundColor: ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8'],
        borderRadius: 6,
      },
    ],
  };

  const globalMetrics = useMemo(() => {
    const totalMonitors = stats.length;
    const activeMonitors = stats.filter(s => s.lastCheck && s.lastCheck.is_success).length;
    const totalChecks = stats.reduce((a, s) => a + s.totalChecks, 0);
    const successChecks = stats.reduce((a, s) => a + s.successChecks, 0);
    const failedChecks = totalChecks - successChecks;
    const avgLatency = totalChecks ? Math.round(stats.reduce((a, s) => a + s.avgLatency * s.totalChecks, 0) / totalChecks) : 0;
    const uptime = totalChecks ? Math.round((successChecks / totalChecks) * 100) : 0;

    return { totalMonitors, activeMonitors, totalChecks, successChecks, failedChecks, avgLatency, uptime };
  }, [stats]);

  const recentChecks = useMemo(() => {
    const all = stats
      .filter(s => s.lastCheck)
      .map(s => ({ ...s.lastCheck, monitorName: s.name, monitorUrl: s.url }))
      .sort((a, b) => new Date(b.checked_at) - new Date(a.checked_at));
    return all.slice(0, recentLimit);
  }, [stats, recentLimit]);

  if (loading) return <div className="text-slate-400 text-center py-12">Cargando dashboard...</div>;
  if (error) return <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-3 rounded text-sm">{error}</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {stats.length === 0 && (
        <Card>
          <p className="text-slate-400 text-center py-12 text-sm">No hay monitores configurados. Ve a la sección Monitores para crear uno.</p>
        </Card>
      )}

      {stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          <Card>
            <p className="text-xs text-slate-500 dark:text-slate-400">Monitores</p>
            <p className="text-2xl font-semibold">{globalMetrics.totalMonitors}</p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500 dark:text-slate-400">Activos</p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{globalMetrics.activeMonitors}</p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500 dark:text-slate-400">Checks</p>
            <p className="text-2xl font-semibold">{globalMetrics.totalChecks}</p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500 dark:text-slate-400">Éxito</p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{globalMetrics.successChecks}</p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500 dark:text-slate-400">Fallos</p>
            <p className="text-2xl font-semibold text-red-600 dark:text-red-400">{globalMetrics.failedChecks}</p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500 dark:text-slate-400">Alertas</p>
            <p className={`text-2xl font-semibold ${alertStats.open > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>{alertStats.open}</p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500 dark:text-slate-400">Uptime</p>
            <p className="text-2xl font-semibold">{globalMetrics.uptime}%</p>
          </Card>
        </div>
      )}

      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map(s => (
            <Card key={s.id} className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium truncate">{s.name}</h3>
                <Badge className={s.uptime >= 95 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}>
                  {s.uptime}%
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-3">{s.url}</p>
              <div className="grid grid-cols-2 gap-3 text-xs mt-auto">
                <div><span className="text-slate-500 dark:text-slate-400">Checks</span><p className="font-medium">{s.totalChecks}</p></div>
                <div><span className="text-slate-500 dark:text-slate-400">Latencia avg</span><p className="font-medium">{formatLatency(s.avgLatency)}</p></div>
              </div>
              {s.lastCheck && (
                <p className="text-xs text-slate-400 mt-3">Último check: {formatDate(s.lastCheck.checked_at)}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {stats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-medium mb-4">Latencia promedio</h3>
            <div className="h-72">
              <Line data={latencyData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } } } }} />
            </div>
          </Card>
          <Card>
            <h3 className="font-medium mb-4">Distribución de status</h3>
            <div className="h-72">
              <Doughnut data={statusData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </Card>
          <Card className='col-span-full'>
            <h3 className="font-medium mb-4">Checks por monitor</h3>
            <div className="h-72">
              <Bar data={checksPerMonitor} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } } } }} />
            </div>
          </Card>
        </div>
      )}

      {stats.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Últimos checks</h3>
            {recentChecks.length > 5 && (
              <Button variant="secondary" onClick={() => setRecentLimit(prev => prev === 10 ? 50 : 10)}>
                {recentLimit === 10 ? 'Ver más' : 'Ver menos'}
              </Button>
            )}
          </div>
          {recentChecks.length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-sm">Sin checks aún</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-3 font-medium text-slate-500 dark:text-slate-400 text-xs">Monitor</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500 dark:text-slate-400 text-xs">Fecha</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500 dark:text-slate-400 text-xs">Status</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500 dark:text-slate-400 text-xs">Latencia</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500 dark:text-slate-400 text-xs">Tamaño</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {recentChecks.map((c, idx) => (
                    <tr key={`${c.monitorName}-${c.id}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                      <td className="py-2 px-3 text-xs">
                        <p className="font-medium truncate max-w-[200px]">{c.monitorName}</p>
                        <p className="text-slate-400 truncate max-w-[200px]">{c.monitorUrl}</p>
                      </td>
                      <td className="py-2 px-3 text-xs">{formatDate(c.checked_at)}</td>
                      <td className="py-2 px-3">
                        <Badge className={c.status_code === 200 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}>
                          {c.status_code || 'ERR'}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-xs">{formatLatency(c.latency_ms)}</td>
                      <td className="py-2 px-3 text-xs">{(c.response_size / 1024).toFixed(1)} KB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </motion.div>
  );
}
