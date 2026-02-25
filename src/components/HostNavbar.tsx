import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HostNavbarProps {
  isDarkMode: boolean;
}

/**
 * Navbar for the host/short-stays experience: Realaist Stays branding, Properties, Contact,
 * and either Dashboard+Logout (when authenticated) or Log In / Sign Up (when not).
 * Used on HostsHomePage, PropertyDetails (when host), and ShortStaysPage (for all users).
 */
export function HostNavbar({ isDarkMode }: HostNavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const dark = isDarkMode;
  const navBg = dark ? 'bg-[#0E0E10]/95 border-white/10' : 'bg-white/95 border-gray-200';
  const text = dark ? 'text-white' : 'text-gray-900';
  const muted = dark ? 'text-white/70' : 'text-gray-600';
  const gold = 'text-[#C7A667]';
  const isAuthenticated = !!user;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openAuth = (mode: 'login' | 'signup') => {
    window.dispatchEvent(new Event('realaist:open-auth'));
    const current = new URL(window.location.href);
    current.searchParams.set('auth', mode);
    navigate(`${current.pathname}${current.search}`, { replace: true });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b ${navBg}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logos/realaistlogo.png" alt="Realaist" className="h-8 w-auto" />
          <span className={`font-semibold text-xl ${text}`} style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>
            Realaist <span className={gold}>Stays</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/short-stays"
            className={`text-sm ${muted} hover:text-[#C7A667] transition-colors`}
          >
            Properties
          </Link>
          <Link to="/contact" className={`text-sm ${muted} hover:text-[#C7A667] transition-colors`}>
            Contact
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-lg border border-[#C7A667]/50 text-sm font-medium text-[#C7A667] hover:bg-[#C7A667]/10 transition-colors"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className={`text-sm ${muted} hover:opacity-100 transition-colors`}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openAuth('login')}
                className={`text-sm ${muted} hover:text-[#C7A667] transition-colors`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => openAuth('signup')}
                className="px-4 py-2 rounded-lg bg-[#C7A667] text-black text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          className={`md:hidden p-2 ${text}`}
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className={`md:hidden border-t ${dark ? 'border-white/10 bg-[#0E0E10]' : 'border-gray-200 bg-white'} px-4 pb-4`}>
          <Link
            to="/short-stays"
            className={`block py-3 text-sm ${muted} hover:text-[#C7A667] transition-colors`}
            onClick={() => setOpen(false)}
          >
            Properties
          </Link>
          <Link
            to="/contact"
            className={`block py-3 text-sm ${muted} hover:text-[#C7A667] transition-colors`}
            onClick={() => setOpen(false)}
          >
            Contact
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="block py-3 text-sm font-medium text-[#C7A667]"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => { setOpen(false); handleLogout(); }}
                className={`block w-full text-left py-3 text-sm ${muted} hover:opacity-100`}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setOpen(false); openAuth('login'); }}
                className={`block w-full text-left py-3 text-sm ${muted} hover:text-[#C7A667]`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); openAuth('signup'); }}
                className="block w-full text-left py-3 text-sm font-medium text-[#C7A667]"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
