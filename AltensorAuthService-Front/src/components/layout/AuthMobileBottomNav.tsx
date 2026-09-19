import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface AuthMobileBottomNavProps {
  onOpenMobileMenu: () => void;
}

export const AuthMobileBottomNav: React.FC<AuthMobileBottomNavProps> = ({ onOpenMobileMenu }) => {
  const { t } = useLanguage();
  const { isSuperAdmin } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: t('nav.dashboard', {}, 'Dashboard'),
      icon: 'dashboard'
    },
    ...(isSuperAdmin
      ? [
          {
            to: '/tenants',
            label: t('nav.tenants', {}, 'Tenants'),
            icon: 'domain'
          }
        ]
      : []),
    {
      to: '/users',
      label: t('nav.users', {}, 'Users'),
      icon: 'vpn_key'
    },
    {
      to: '/roles',
      label: t('nav.roles', {}, 'Roles'),
      icon: 'security'
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#18181B]/95 backdrop-blur-xl border-t border-[#27272A] px-3 py-2 flex items-center justify-around shadow-2xl safe-area-bottom">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 flex-1 py-1 text-[11px] font-medium transition-all ${
              isActive
                ? 'text-[#D946EF] font-bold scale-105'
                : 'text-[#A1A1AA] hover:text-white'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
          <span className="truncate max-w-[64px] text-center text-[10px]">{item.label}</span>
        </NavLink>
      ))}

      {/* Menu / Drawer Button */}
      <button
        type="button"
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center justify-center gap-1 flex-1 py-1 text-[11px] font-medium text-[#A1A1AA] hover:text-white transition-all cursor-pointer"
      >
        <span className="material-symbols-outlined text-[20px]">menu</span>
        <span className="truncate max-w-[64px] text-center text-[10px]">{t('common.menu', {}, 'Menyu')}</span>
      </button>
    </nav>
  );
};

export default AuthMobileBottomNav;
