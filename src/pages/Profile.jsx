import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Profile() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="text-2xl font-semibold">Perfil</h1>
      <Card className="max-w-lg space-y-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
          <p className="text-sm font-medium">{user?.email}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Rol</p>
          <p className="text-sm font-medium capitalize">{user?.role}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Tema</p>
          <Button onClick={toggle} variant="secondary">{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</Button>
        </div>
      </Card>
    </motion.div>
  );
}
