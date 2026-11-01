import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  Home,
  BarChart3,
  Package,
  Receipt,
  Truck,
  CornerDownLeft,
  ListChecks,
  Wrench,
  Database,
  FileSpreadsheet,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
} from 'lucide-react';
import stockLogo from '../assets/Stock-Logo.svg';
import { useTheme } from '../context';

interface SidebarProps {
  onOpenSearch: () => void;
  onOpenNotification: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenSearch,
  onOpenNotification,
  isCollapsed,
  setIsCollapsed,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    tools: false,
    setup: false,
    reports: false,
    settings: false,
  });

  const brandMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (brandMenuRef.current && !brandMenuRef.current.contains(e.target as Node)) {
        setIsBrandMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleGroup = (groupKey: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
    }
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const desktopUrl = (import.meta.env.VITE_INFO_WEB_URL || 'http://localhost:5173') + '/desktop';
  const crmUrl = import.meta.env.VITE_CRM_WEB_URL || 'http://localhost:5175';
  const tmsUrl = import.meta.env.VITE_TMS_WEB_URL || 'http://localhost:3000';
  const accUrl = import.meta.env.VITE_ACC_WEB_URL || 'http://localhost:5176';

  const apps = [
    { name: 'Desktop', url: desktopUrl, color: 'bg-slate-600' },
    { name: 'Task Management', url: tmsUrl, color: 'bg-indigo-600' },
    { name: 'Altensor CRM', url: crmUrl, color: 'bg-fuchsia-600' },
    { name: 'Accounting', url: accUrl, color: 'bg-emerald-600' },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-56'
      } h-screen sticky top-0 bg-white dark:bg-[#18181B] text-slate-700 dark:text-[#A1A1AA] border-r border-slate-200 dark:border-[#27272A] flex flex-col justify-between p-2.5 select-none z-40 shrink-0 font-sans transition-all duration-200`}
    >
      {/* Upper Section */}
      <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
        {/* Brand Header with Theme-based White/Black Background (like Desktop) */}
        <div className="relative mb-1" ref={brandMenuRef}>
          <div
            onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
            className={`flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#27272A] cursor-pointer transition-all ${
              isCollapsed ? 'justify-center p-1' : ''
            }`}
            title={isCollapsed ? 'Stock - Altensor ERP' : undefined}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Theme-based squircle: White in light mode, Black (#0B0F17) in dark mode, matching Desktop */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 p-1.5 transition-colors ${
                  isDark
                    ? 'bg-[#0B0F17] border border-slate-800/90 shadow-sm'
                    : 'bg-white border border-slate-200/90 shadow-xs'
                }`}
              >
                <img
                  src={stockLogo}
                  alt="Stock Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              {!isCollapsed && (
                <div className="flex flex-col text-left min-w-0 leading-tight">
                  <span className="font-semibold text-slate-900 dark:text-white text-[13.5px] tracking-tight truncate">
                    Stock
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-[#71717A] truncate font-normal">
                    Altensor ERP
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 stroke-[1.75]" />
            )}
          </div>

          {/* App Switcher Dropdown */}
          {isBrandMenuOpen && (
            <div className="absolute top-12 left-0 w-52 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-2xl shadow-xl p-1.5 z-50 text-xs text-slate-700 dark:text-[#D4D4D8] animate-in fade-in duration-100">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Ecosystem Apps
              </div>
              {apps.map((app) => (
                <a
                  key={app.name}
                  href={app.url}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${app.color}`}></span>
                    <span className="text-xs">{app.name}</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Search with Ctrl+K */}
        <button
          onClick={onOpenSearch}
          className={`flex items-center ${
            isCollapsed ? 'justify-center px-0 py-2' : 'justify-between px-2.5 py-1.5'
          } rounded-lg text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-100 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white text-xs font-normal transition-all group mb-0.5`}
          title={isCollapsed ? 'Search (Ctrl+K)' : undefined}
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 stroke-[1.75] text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white shrink-0" />
            {!isCollapsed && <span className="text-[13px]">Search</span>}
          </div>
          {!isCollapsed && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-slate-200 dark:border-[#2E2E33] bg-slate-50 dark:bg-[#242427] text-slate-400 pointer-events-none">
              Ctrl+K
            </span>
          )}
        </button>

        {/* Notification */}
        <button
          onClick={onOpenNotification}
          className={`flex items-center ${
            isCollapsed ? 'justify-center px-0 py-2' : 'gap-2.5 px-2.5 py-1.5'
          } rounded-lg text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-100 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white text-xs font-normal transition-all group mb-1.5`}
          title={isCollapsed ? 'Notification' : undefined}
        >
          <Bell className="w-4 h-4 stroke-[1.75] text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white shrink-0" />
          {!isCollapsed && <span className="text-[13px]">Notification</span>}
        </button>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto pr-0.5 space-y-0.5">
          {/* Home */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'gap-2.5 px-2.5 py-1.5'
              } rounded-lg text-[13px] transition-all duration-150 ${
                isActive
                  ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white font-medium'
                  : 'text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white font-normal'
              }`
            }
            title={isCollapsed ? 'Home' : undefined}
          >
            <Home className="w-4 h-4 stroke-[1.75] shrink-0" />
            {!isCollapsed && <span>Home</span>}
          </NavLink>

          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'gap-2.5 px-2.5 py-1.5'
              } rounded-lg text-[13px] transition-all duration-150 ${
                isActive
                  ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white font-medium'
                  : 'text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white font-normal'
              }`
            }
            title={isCollapsed ? 'Dashboard' : undefined}
          >
            <BarChart3 className="w-4 h-4 stroke-[1.75] shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          {/* Stock Entry */}
          <NavLink
            to="/stock-entry"
            className={({ isActive }) =>
              `flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'gap-2.5 px-2.5 py-1.5'
              } rounded-lg text-[13px] transition-all duration-150 ${
                isActive
                  ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white font-medium'
                  : 'text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white font-normal'
              }`
            }
            title={isCollapsed ? 'Stock Entry' : undefined}
          >
            <Package className="w-4 h-4 stroke-[1.75] shrink-0" />
            {!isCollapsed && <span>Stock Entry</span>}
          </NavLink>

          {/* Purchase Receipt */}
          <NavLink
            to="/purchase-receipt"
            className={({ isActive }) =>
              `flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'gap-2.5 px-2.5 py-1.5'
              } rounded-lg text-[13px] transition-all duration-150 ${
                isActive
                  ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white font-medium'
                  : 'text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white font-normal'
              }`
            }
            title={isCollapsed ? 'Purchase Receipt' : undefined}
          >
            <Receipt className="w-4 h-4 stroke-[1.75] shrink-0" />
            {!isCollapsed && <span>Purchase Receipt</span>}
          </NavLink>

          {/* Delivery Note */}
          <NavLink
            to="/delivery-note"
            className={({ isActive }) =>
              `flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'gap-2.5 px-2.5 py-1.5'
              } rounded-lg text-[13px] transition-all duration-150 ${
                isActive
                  ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white font-medium'
                  : 'text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white font-normal'
              }`
            }
            title={isCollapsed ? 'Delivery Note' : undefined}
          >
            <Truck className="w-4 h-4 stroke-[1.75] shrink-0" />
            {!isCollapsed && <span>Delivery Note</span>}
          </NavLink>

          {/* Material Request */}
          <NavLink
            to="/material-request"
            className={({ isActive }) =>
              `flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'gap-2.5 px-2.5 py-1.5'
              } rounded-lg text-[13px] transition-all duration-150 ${
                isActive
                  ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white font-medium'
                  : 'text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white font-normal'
              }`
            }
            title={isCollapsed ? 'Material Request' : undefined}
          >
            <CornerDownLeft className="w-4 h-4 stroke-[1.75] shrink-0" />
            {!isCollapsed && <span>Material Request</span>}
          </NavLink>

          {/* Pick List */}
          <NavLink
            to="/pick-list"
            className={({ isActive }) =>
              `flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'gap-2.5 px-2.5 py-1.5'
              } rounded-lg text-[13px] transition-all duration-150 ${
                isActive
                  ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white font-medium'
                  : 'text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white font-normal'
              }`
            }
            title={isCollapsed ? 'Pick List' : undefined}
          >
            <ListChecks className="w-4 h-4 stroke-[1.75] shrink-0" />
            {!isCollapsed && <span>Pick List</span>}
          </NavLink>

          {/* Tools */}
          <div>
            <button
              onClick={() => toggleGroup('tools')}
              className={`flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'justify-between px-2.5 py-1.5'
              } w-full rounded-lg text-[13px] text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors`}
              title={isCollapsed ? 'Tools' : undefined}
            >
              <div className="flex items-center gap-2.5">
                <Wrench className="w-4 h-4 stroke-[1.75] shrink-0" />
                {!isCollapsed && <span>Tools</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    expandedGroups.tools ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              )}
            </button>
            {!isCollapsed && expandedGroups.tools && (
              <div className="pl-9 pr-1 py-0.5 space-y-0.5 text-xs">
                <NavLink to="/tools/reconciliation" className="block py-1 text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white text-[12.5px]">
                  Stock Reconciliation
                </NavLink>
                <NavLink to="/tools/landed-cost" className="block py-1 text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white text-[12.5px]">
                  Landed Cost Voucher
                </NavLink>
                <NavLink to="/tools/repost-valuation" className="block py-1 text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white text-[12.5px]">
                  Repost Item Valuation
                </NavLink>
                <NavLink to="/tools/packing-slip" className="block py-1 text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white text-[12.5px]">
                  Packing Slip
                </NavLink>
                <NavLink to="/tools/quality-inspection" className="block py-1 text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white text-[12.5px]">
                  Quality Inspection
                </NavLink>
              </div>
            )}
          </div>

          {/* Setup */}
          <div>
            <button
              onClick={() => toggleGroup('setup')}
              className={`flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'justify-between px-2.5 py-1.5'
              } w-full rounded-lg text-[13px] text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors`}
              title={isCollapsed ? 'Setup' : undefined}
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 stroke-[1.75] shrink-0" />
                {!isCollapsed && <span>Setup</span>}
              </div>
              {!isCollapsed && (
                <ChevronRight
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    expandedGroups.setup ? 'rotate-90' : ''
                  }`}
                />
              )}
            </button>
            {!isCollapsed && expandedGroups.setup && (
              <div className="pl-9 pr-1 py-0.5 space-y-0.5 text-xs">
                <NavLink to="/warehouses" className="block py-1 text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white text-[12.5px]">
                  Warehouse
                </NavLink>
                <NavLink to="/setup/uom" className="block py-1 text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white text-[12.5px]">
                  Unit of Measure (UOM)
                </NavLink>
              </div>
            )}
          </div>

          {/* Reports */}
          <div>
            <button
              onClick={() => toggleGroup('reports')}
              className={`flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'justify-between px-2.5 py-1.5'
              } w-full rounded-lg text-[13px] text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors`}
              title={isCollapsed ? 'Reports' : undefined}
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 stroke-[1.75] shrink-0" />
                {!isCollapsed && <span>Reports</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    expandedGroups.reports ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              )}
            </button>
            {!isCollapsed && expandedGroups.reports && (
              <div className="pl-9 pr-1 py-0.5 space-y-0.5 text-xs">
                <NavLink to="/reports/ledger" className="block py-1 text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white text-[12.5px]">
                  Stock Ledger
                </NavLink>
                <NavLink to="/reports/balance" className="block py-1 text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white text-[12.5px]">
                  Stock Balance
                </NavLink>
              </div>
            )}
          </div>

          {/* Settings */}
          <div>
            <button
              onClick={() => toggleGroup('settings')}
              className={`flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'justify-between px-2.5 py-1.5'
              } w-full rounded-lg text-[13px] text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors`}
              title={isCollapsed ? 'Settings' : undefined}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 stroke-[1.75] shrink-0" />
                {!isCollapsed && <span>Settings</span>}
              </div>
              {!isCollapsed && (
                <ChevronRight
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    expandedGroups.settings ? 'rotate-90' : ''
                  }`}
                />
              )}
            </button>
            {!isCollapsed && expandedGroups.settings && (
              <div className="pl-9 pr-1 py-0.5 space-y-0.5 text-xs">
                <NavLink to="/settings" className="block py-1 text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white text-[12.5px]">
                  Stock Settings
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Collapse / Expand Toggle Button (Exact CRM Replica) */}
      <div className="pt-2 border-t border-slate-100 dark:border-[#27272A]">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-[13px] font-normal text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer w-full ${
            isCollapsed ? 'justify-center px-0 py-2' : ''
          }`}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 stroke-[1.75] shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 stroke-[1.75] shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
