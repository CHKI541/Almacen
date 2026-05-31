import React, { useState } from 'react';
import { DollarSign, TrendingUp, ShoppingBag, AlertTriangle, ShieldAlert, Check, Plus } from 'lucide-react';

export default function Dashboard({ stats, onUpdateStockLimit, onQuickRestock, onNavigateToInventory }) {
  const [tempLimit, setTempLimit] = useState(stats.alertLimit.toString());
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveLimit = (e) => {
    e.preventDefault();
    const val = parseInt(tempLimit, 10);
    if (!isNaN(val) && val >= 0) {
      onUpdateStockLimit(val);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  // Encontrar el valor máximo de ventas en los últimos 7 días para escalar el gráfico SVG
  const maxTotal = Math.max(...stats.last7Days.map(d => d.total), 1000);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Resumen del Almacén</h2>
          <p className="text-slate-500 dark:text-slate-400">Estadísticas clave y alertas de inventario en tiempo real.</p>
        </div>
        
        {/* Configuración del límite */}
        <form onSubmit={handleSaveLimit} className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-sm">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 pl-2">Alerta stock bajo:</label>
          <input
            type="number"
            min="0"
            max="100"
            value={tempLimit}
            onChange={(e) => setTempLimit(e.target.value)}
            className="w-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center text-sm font-semibold rounded-lg py-1 px-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className={`flex items-center justify-center rounded-lg p-1.5 transition-colors ${
              isSaved
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isSaved ? <Check size={16} /> : <Plus size={16} />}
          </button>
        </form>
      </div>

      {/* Tarjetas de Estadísticas (KPIs) */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-3">
        {/* Card 1: Ventas Hoy */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-4 -translate-y-4 rounded-full bg-indigo-50 dark:bg-indigo-950/20" />
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-md shadow-indigo-100 dark:shadow-none">
              <ShoppingBag size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Ventas de Hoy</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                ${stats.totalVendidoHoy.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 2: Ganancia Hoy */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-4 -translate-y-4 rounded-full bg-emerald-50 dark:bg-emerald-950/20" />
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-100 dark:shadow-none">
              <TrendingUp size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Ganancia Neta</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                ${stats.gananciaHoy.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 3: Transacciones Hoy */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-4 -translate-y-4 rounded-full bg-amber-50 dark:bg-amber-950/20" />
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-100 dark:shadow-none">
              <DollarSign size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Transacciones</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                {stats.transaccionesHoy} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">operaciones</span>
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico y Alertas */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
        {/* Gráfico de Ventas de los últimos 7 días */}
        <div className="rounded-2xl border border-slate-150 bg-white p-6 shadow-sm lg:col-span-3 dark:border-slate-800 dark:bg-slate-900">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Ventas de los Últimos 7 Días</h4>
          <div className="relative flex h-52 items-end justify-between gap-2 pt-6">
            {/* Eje Y guía */}
            <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-400 select-none pointer-events-none pb-8 pt-2">
              <div className="border-b border-dashed border-slate-100 dark:border-slate-800 w-full flex justify-between">
                <span>${maxTotal.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="border-b border-dashed border-slate-100 dark:border-slate-800 w-full flex justify-between">
                <span>${(maxTotal / 2).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="w-full flex justify-between border-b border-slate-200 dark:border-slate-800">
                <span>$0</span>
              </div>
            </div>

            {/* Columnas del gráfico */}
            {stats.last7Days.map((day, idx) => {
              // Altura en porcentaje para la columna
              const heightPercent = maxTotal > 0 ? (day.total / maxTotal) * 100 : 0;
              const heightProfitPercent = maxTotal > 0 ? (day.ganancia / maxTotal) * 100 : 0;

              return (
                <div key={idx} className="group relative flex flex-col items-center flex-1 h-full justify-end z-10">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden flex-col items-center group-hover:flex z-20">
                    <div className="rounded-lg bg-slate-950 px-2 py-1 text-[10px] font-semibold text-white shadow-md dark:bg-slate-800">
                      <p className="leading-tight">Total: ${day.total.toLocaleString('es-AR')}</p>
                      <p className="leading-tight text-emerald-400">Ganancia: ${day.ganancia.toLocaleString('es-AR')}</p>
                    </div>
                    <div className="-mt-1 h-2 w-2 rotate-45 bg-slate-950 dark:bg-slate-800" />
                  </div>

                  {/* Barras de datos */}
                  <div className="relative w-full max-w-[28px] bg-slate-50 dark:bg-slate-800 rounded-t-lg h-[80%] overflow-hidden flex items-end">
                    {/* Barra de Ventas */}
                    <div 
                      style={{ height: `${Math.max(heightPercent, 3)}%` }} 
                      className="absolute inset-x-0 bottom-0 bg-indigo-500/80 group-hover:bg-indigo-600 rounded-t-lg transition-all duration-300"
                    />
                    {/* Barra de Ganancias encajada adentro para contraste */}
                    <div 
                      style={{ height: `${Math.max(heightProfitPercent, 2)}%` }} 
                      className="absolute inset-x-0 bottom-0 bg-emerald-400/90 rounded-t-lg border-t border-emerald-500/30 transition-all duration-300"
                    />
                  </div>

                  {/* Etiqueta */}
                  <span className="text-[10px] font-medium text-slate-400 mt-2 block h-6 leading-none text-center">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sección de Alertas */}
        <div className="rounded-2xl border border-slate-150 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="text-amber-500 stroke-[2.5]" size={18} />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Alertas de Stock Bajo</h4>
            <span className="ml-auto rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold px-2 py-0.5">
              {stats.alerts.length}
            </span>
          </div>

          {stats.alerts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <Check className="text-emerald-500 bg-emerald-100 dark:bg-emerald-950/40 rounded-full p-2 mb-2" size={40} />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Todo en orden</p>
              <p className="text-xs text-slate-400 mt-1">Todos los productos superan el stock mínimo configurado.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto max-h-56 pr-1 space-y-3">
              {stats.alerts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{product.nombre}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-semibold">
                      <span>Cód: {product.barcode}</span>
                      <span>•</span>
                      <span className={`px-1.5 py-0.5 rounded-full font-bold ${
                        product.stockActual === 0
                          ? 'bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                      }`}>
                        Stock: {product.stockActual}
                      </span>
                    </div>
                  </div>

                  {/* Acción rápida de reabastecimiento */}
                  <button
                    onClick={() => onQuickRestock(product.id, 10)}
                    title="Añadir 10 unidades al stock"
                    className="ml-3 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white shadow-sm"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))}
              
              <button
                onClick={onNavigateToInventory}
                className="w-full text-center text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 py-2 border border-dashed border-indigo-200 dark:border-indigo-900 rounded-lg hover:bg-indigo-50/30 transition-colors"
              >
                Ver inventario completo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
