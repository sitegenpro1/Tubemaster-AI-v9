
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  
  const navItems = [
    { name: 'Home', id: 'home' },
    { name: 'Keywords', id: 'keywords' },
    { name: 'Thumbnails', id: 'thumbnail-gen' },
    { name: 'Script Writer', id: 'script' },
    { name: 'Compare', id: 'compare' },
    { name: 'Competitors', id: 'competitors' },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-300 to-white hover:opacity-80 transition-opacity">
                TubeMaster
              </span>
            </div>
            
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentView === item.id
                      ? 'bg-slate-800 text-brand-300'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <span className="text-xs font-mono text-slate-500 border border-slate-800 px-2 py-1 rounded bg-slate-900">
                  PRO v2.0
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0b1120] py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} TubeMaster AI Suite. Commercial Grade Tool.</p>
        </div>
      </footer>
    </div>
  );
};
