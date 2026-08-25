import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { formatDate, formatLatency } from '../utils';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function MonitorDetail() {
  const { id } = useParams();
  const [monitor, setMonitor] = useState(null);
  const [checks, setChecks] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [m, c, h] = await Promise.all([
        api.monitors.get(id),
        api.checks.list(id, { limit: 50 }),
        api.history.list(id),
      ]);
      setMonitor(m);
      setChecks(c.data);
      setHistory(h);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [id]);

  const latencyData = {
    labels: checks.slice().reverse().map(c => formatDate(c.checked_at).split(' ')[1] || formatDate(c.checked_at)),
    datasets: [
      {
        label: 'Latencia (ms)',
        data: checks.slice().reverse().map(c => c.latency_ms),
        borderColor: '#0f172a',
        backgroundColor: 'rgba(15,23,42,0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
      },
    ],
  };

  if (loading) return <div className="text-slate-400 text-center py-12">Cargando...</div>;
  if (error) return <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-3 rounded text-sm">{error}</div>;
  if (!monitor) return <div className="text-slate-400 text-center py-12">Monitor no encontrado</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/monitors" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">← Monitores</Link>
        <h1 className="text-2xl font-semibold">{monitor.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><p className="text-xs text-slate-500 dark:text-slate-400">URL</p><p className="text-sm font-medium truncate">{monitor.url}</p></Card>
        <Card><p className="text-xs text-slate-500 dark:text-slate-400">Método</p><p className="text-sm font-medium">{monitor.method}</p></Card>
        <Card><p className="text-xs text-slate-500 dark:text-slate-400">Intervalo</p><p className="text-sm font-medium">{monitor.interval_seconds}s</p></Card>
      </div>

      <Card>
        <h3 className="font-medium mb-4">Latencia en el tiempo</h3>
        <div className="h-72">
          <Line data={latencyData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } } } }} />
        </div>
      </Card>

      <Card>
        <h3 className="font-medium mb-4">Checks recientes</h3>
        {checks.length === 0 ? <p className="text-slate-400 text-center py-8 text-sm">Sin checks aún</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 px-3 font-medium text-slate-500 dark:text-slate-400 text-xs">Fecha</th>
                <th className="text-left py-2 px-3 font-medium text-slate-500 dark:text-slate-400 text-xs">Status</th>
                <th className="text-left py-2 px-3 font-medium text-slate-500 dark:text-slate-400 text-xs">Latencia</th>
                <th className="text-left py-2 px-3 font-medium text-slate-500 dark:text-slate-400 text-xs">Tamaño</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {checks.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                    <td className="py-2 px-3 text-xs">{formatDate(c.checked_at)}</td>
                    <td className="py-2 px-3"><Badge className={c.status_code === 200 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}>{c.status_code || 'ERR'}</Badge></td>
                    <td className="py-2 px-3 text-xs">{formatLatency(c.latency_ms)}</td>
                    <td className="py-2 px-3 text-xs">{(c.response_size / 1024).toFixed(1)} KB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-medium mb-4">Historial de cambios</h3>
        {history.length === 0 ? <p className="text-slate-400 text-center py-8 text-sm">Sin historial</p> : (
          <div className="space-y-3">
            {history.map(h => (
              <div key={h.id} className="flex items-start justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <div>
                  <p className="text-sm font-medium capitalize">{h.action}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(h.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
