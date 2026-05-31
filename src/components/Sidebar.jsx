import React from 'react';
import { LayoutDashboard, ShoppingBag, Package, BadgeAlert } from 'lucide-react';

export default function Sidebar({ currentView, onViewChange, lowStockCount }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', name: 'Punto de Venta', icon: ShoppingBag },
    { id: 'inventory', name: 'Inventario', icon: Package, badge: lowStockCount > 0 ? lowStockCount : null }
  ];

  return (
    <aside className="fixed bottom-0 left-0 z-20 flex h-16 w-full border-t border-slate-200 bg-white px-4 py-2 shadow-lg md:sticky md:top-0 md:h-screen md:w-64 md:flex-col md:border-r md:border-t-0 md:py-6 md:px-6 md:shadow-none dark:bg-slate-900 dark:border-slate-800">
      {/* Brand logo/title */}
      <div className="hidden items-center gap-3 px-2 mb-8 md:flex">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none">
          <ShoppingBag size={20} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white leading-none">Almacén POS</h1>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Panel de Control</span>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex w-full items-center justify-around gap-1 md:flex-col md:items-stretch md:justify-start md:gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 w-full justify-center md:justify-start ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={20} className={`${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              <span className="hidden md:inline">{item.name}</span>
              
              {/* Optional stock warning badge */}
              {item.badge && (
                <span className="absolute top-2 right-6 md:top-auto md:right-4 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer info (Desktop only) */}
      <div className="hidden mt-auto border-t border-slate-100 pt-4 px-2 md:block dark:border-slate-800">
        <p className="text-xs text-slate-400 dark:text-slate-500">Sistema POS v1.0.0</p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Modo Local (localStorage)</p>
      </div>
    </aside>
  );
}
