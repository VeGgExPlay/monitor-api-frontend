export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}
