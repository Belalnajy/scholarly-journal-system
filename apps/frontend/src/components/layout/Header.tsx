import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useSiteSettings } from '../../contexts';

interface NavigationItem {
  label: string;
  href: string;
}

interface HeaderProps {
  navigation: NavigationItem[];
  logoSrc?: string;
}

export function Header({ navigation, logoSrc = '../../public/journal-logo.png' }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();

  // Use settings for logo and site name
  const displayLogo = settings?.logo_url || logoSrc;
  const siteName = settings?.site_name || 'مجلة البحوث والدراسات';

  // Check if user is logged in
  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    setIsUserLoggedIn(!!token);
  };

  // Check login status on mount and location change
  useEffect(() => {
    checkLoginStatus();
  }, [location.pathname]);

  // Handle submit research click
  const handleSubmitResearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isUserLoggedIn) {
      // If logged in, go to dashboard submit page
      navigate('/dashboard/submit-research');
    } else {
      // If not logged in, go to register page
      navigate('/register');
    }
    setIsMenuOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsUserLoggedIn(false);
    setIsMenuOpen(false);
    // Force full page reload to clear all state
    window.location.href = '/';
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header ref={menuRef} className="fixed left-1/2 top-0 z-50 w-full -translate-x-1/2 bg-white shadow-[0px_0px_4px_0px_RGBA(0,0,0,0.25)]">
      <div className="container mx-auto px-4 font-bold">
        <div className="flex w-full max-w-[1360px] mx-auto items-center justify-between py-4 lg:py-0">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden flex items-center justify-center p-2 text-[#093059]"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>

          {/* Desktop Navigation and Buttons */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {/* Dashboard Button (only when logged in) */}
            {isUserLoggedIn && (
              <Link 
                to="/dashboard"
                className="flex h-12 items-center justify-center gap-2 rounded-[40px] bg-[#b2823e] px-4 xl:px-6 transition-colors hover:bg-[#9a6f35] group"
              >
                <LayoutDashboard className="size-4 text-white" />
                <span className="text-nowrap text-sm xl:text-base text-white" dir="auto">
                  لوحة التحكم
                </span>
              </Link>
            )}
            
            {/* Login/Logout Button */}
            {isUserLoggedIn ? (
              <button 
                onClick={handleLogout}
                className="flex h-12 items-center justify-center gap-2 rounded-[40px] border-2 border-[#093059] px-4 xl:px-6 transition-colors hover:bg-[#093059] hover:text-white group"
              >
                <LogOut className="size-4 text-[#093059] group-hover:text-white transition-colors" />
                <span className="text-nowrap text-sm xl:text-base text-[#093059] group-hover:text-white transition-colors" dir="auto">
                  تسجيل الخروج
                </span>
              </button>
            ) : (
              <Link to="/login" className="flex h-12 items-center justify-center gap-2 rounded-[40px] border-2 border-[#093059] px-4 xl:px-6 transition-colors hover:bg-[#093059] hover:text-white group">
                <span className="text-nowrap text-sm xl:text-base text-[#093059] group-hover:text-white transition-colors" dir="auto">
                  تسجيل الدخول
                </span>
              </Link>
            )}

            {/* Navigation Links */}
            <nav className="flex items-center gap-6 xl:gap-16 " dir="rtl">
              {navigation.map((item, index) => {
                const isActive = location.pathname === item.href;
                const isSubmitResearch = item.label === 'تقديم بحث';
                
                if (isSubmitResearch) {
                  return (
                    <button
                      key={index}
                      onClick={handleSubmitResearchClick}
                      className={`relative text-nowrap text-[20px] transition-all duration-300 hover:text-[#b2823e] py-2 text-[#093059]`}
                    >
                      {item.label}
                    </button>
                  );
                }
                
                return (
                  <Link
                    key={index}
                    to={item.href}
                    className={`relative text-nowrap text-[20px] transition-all duration-300 hover:text-[#b2823e] py-2 ${
                      isActive 
                        ? 'text-[#b2823e] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#b2823e] after:transition-all after:duration-300' 
                        : 'text-[#093059]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Logo */}
          <Link to="/" className="relative h-[80px] w-[106px] sm:h-[100px] sm:w-[132px] lg:h-[141px] lg:w-[186px]">
            <div className="absolute inset-0 overflow-hidden">
              <img
                alt={siteName}
                src={displayLogo}
                className="h-full w-full object-contain"
              />
            </div>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`lg:hidden border-t border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-[500px] opacity-100 py-4' : 'max-h-0 opacity-0 py-0'
          }`}
        >
          <nav className="flex flex-col gap-4" dir="rtl">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              const isSubmitResearch = item.label === 'تقديم بحث';
              
              if (isSubmitResearch) {
                return (
                  <button
                    key={index}
                    onClick={handleSubmitResearchClick}
                    className={`text-right px-4 py-2 text-[#093059] transition-all duration-300 hover:bg-gray-50 hover:text-[#b2823e]`}
                  >
                    {item.label}
                  </button>
                );
              }
              
              return (
                <Link
                  key={index}
                  to={item.href}
                  className={`text-right px-4 py-2 text-[#093059] transition-all duration-300 hover:bg-gray-50 hover:text-[#b2823e] ${
                    isActive ? 'bg-gray-50 text-[#b2823e] border-r-4 border-[#b2823e]' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            {/* Mobile Dashboard Button (only when logged in) */}
            {isUserLoggedIn && (
              <Link 
                to="/dashboard"
                className="mx-4 mt-2 flex h-12 items-center justify-center gap-2 rounded-[40px] bg-[#b2823e] px-4 transition-colors hover:bg-[#9a6f35]"
                onClick={() => setIsMenuOpen(false)}
              >
                <LayoutDashboard className="size-4 text-white" />
                <span className="text-nowrap text-white" dir="auto">
                  لوحة التحكم
                </span>
              </Link>
            )}
            
            {/* Mobile Login/Logout Button */}
            {isUserLoggedIn ? (
              <button 
                onClick={handleLogout}
                className="mx-4 mt-2 flex h-12 items-center justify-center gap-2 rounded-[40px] border-2 border-[#093059] px-4 transition-colors hover:bg-[#093059] hover:text-white group"
              >
                <LogOut className="size-4 text-[#093059] group-hover:text-white transition-colors" />
                <span className="text-nowrap text-[#093059] group-hover:text-white transition-colors" dir="auto">
                  تسجيل الخروج
                </span>
              </button>
            ) : (
              <Link 
                to="/login" 
                className="mx-4 mt-2 flex h-12 items-center justify-center gap-2 rounded-[40px] border-2 border-[#093059] px-4 transition-colors hover:bg-[#093059] hover:text-white group" 
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-nowrap text-[#093059] group-hover:text-white transition-colors" dir="auto">
                  تسجيل الدخول
                </span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
