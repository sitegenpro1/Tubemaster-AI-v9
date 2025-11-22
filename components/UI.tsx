import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; description?: string; noPadding?: boolean }> = ({ children, className = "", title, description, noPadding = false }) => (
  <div className={`bg-slate-900/60 border border-slate-800/60 rounded-2xl backdrop-blur-md hover:border-brand-500/30 hover:shadow-2xl hover:shadow-brand-900/20 transition-all duration-300 group relative overflow-hidden ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    <div className={`${noPadding ? '' : 'p-6'} relative z-10`}>
      {(title || description) && (
        <div className="mb-6 border-b border-slate-800/50 pb-4">
          {title && <h3 className="text-xl font-bold text-white group-hover:text-brand-100 transition-colors">{title}</h3>}
          {description && <p className="text-sm text-slate-400 mt-1 leading-relaxed">{description}</p>}
        </div>
      )}
      {children}
    </div>
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'glow' }> = ({ 
  children, 
  variant = 'primary', 
  className = "", 
  ...props 
}) => {
  const baseStyles = "px-5 py-2.5 rounded-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 tracking-wide";
  const variants = {
    primary: "bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700",
    outline: "border border-slate-600 text-slate-300 hover:border-brand-400 hover:text-brand-400 hover:bg-brand-500/5",
    glow: "bg-white text-brand-900 hover:bg-brand-50 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
  };
  
  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all placeholder:text-slate-600 hover:border-slate-600" 
    {...props} 
  />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <div className="relative">
    <select 
      className="w-full appearance-none bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 pr-10 text-slate-200 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all hover:border-slate-600" 
      {...props} 
    >
      {props.children}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
    </div>
  </div>
);

export const Spinner: React.FC = () => (
  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'yellow' | 'blue' | 'brand' | 'purple' }> = ({ children, color = 'blue' }) => {
  const colors = {
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    brand: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };
  return (
    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${colors[color]} uppercase tracking-wider shadow-sm`}>
      {children}
    </span>
  );
};

export const SectionTitle: React.FC<{ title: string; subtitle?: string; center?: boolean }> = ({ title, subtitle, center }) => (
  <div className={`mb-10 ${center ? 'text-center' : ''} animate-fade-in`}>
    <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
      {title}
    </h2>
    {subtitle && <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">{subtitle}</p>}
  </div>
);