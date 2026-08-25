import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Card>
          <h1 className="text-2xl font-semibold mb-1">API Monitor</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Inicia sesión para continuar</p>
          {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Cargando...' : 'Entrar'}</Button>
          </form>
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded text-xs text-slate-500 dark:text-slate-400">
            <p className="font-medium mb-1">Credenciales demo:</p>
            <p>admin@demo.com / admin123</p>
            <p>viewer@demo.com / viewer123</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
