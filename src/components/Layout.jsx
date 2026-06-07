// components/Layout.jsx
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import anonaLogo from '../assets/icons/anona_logo.svg';

export default function Layout({ children }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/poll/create', label: 'PollNa', icon: PlusCircle },
    { path: '/draw/create', label: 'DrawNa', icon: Gift },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D8F3DC] shadow-sm">
        <div className="max-w-lg mx-auto px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
          <Link to="/" className="flex items-center gap-2 group">
            <img src={anonaLogo} alt="AnoNa" className="w-8 h-8 object-contain" />
            <span className="text-xl font-extrabold bg-gradient-to-r from-[#1B4D3E] to-[#52B788] bg-clip-text text-transparent">
              AnoNa
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#52B788]/10 text-[#2D6A4F]'
                      : 'text-[#84A98C] hover:text-[#2D6A4F] hover:bg-[#E9F5E8]'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden xs:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area - adds bottom padding for floating button */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#F5FEF7] border-t border-[#D8F3DC] py-5 mt-auto">
        <div className="max-w-lg mx-auto px-5 text-center">
          <p className="text-xs text-[#84A98C]">
            © {new Date().getFullYear()} AnoNa — Quick group decisions, anonymously.
          </p>
          <p className="text-[11px] text-[#84A98C]/70 mt-1">
            PollNa • DrawNa • SolbNa
          </p>
        </div>
      </footer>
    </div>
  );
}