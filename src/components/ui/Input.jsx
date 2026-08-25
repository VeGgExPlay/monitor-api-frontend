export default function Input({ label, type = 'text', className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
      <input type={type} className="input" {...props} />
    </div>
  );
}
