import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import * as Icons from "../ui/icons/Icons";
import AlertBadge from "./AlertBadge";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/monitors", label: "Monitores" },
    { to: "/alerts", label: "Alertas", admin: true },
    { to: "/profile", label: "Perfil" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link
              to="/dashboard"
              className="text-xl font-semibold text-slate-900 dark:text-slate-100"
            >
              API Monitor
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {links.filter(l => !l.admin || user?.role === 'admin').map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive(link.to)
                      ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user?.role === 'admin' && <AlertBadge />}
            <button
              onClick={toggle}
              className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              {theme === "dark" ? <Icons.SunIcon /> : <Icons.MoonIcons />}
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
              {user?.email}
            </span>
            <button
              onClick={logout}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
            >
              Salir
            </button>
            <button
              className="md:hidden p-2"
              onClick={() => setOpen(!open)}
              aria-label="Abrir menú"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
             <div className="px-4 py-3 space-y-1">
              {links.filter(l => !l.admin || user?.role === 'admin').map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(link.to)
                      ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
