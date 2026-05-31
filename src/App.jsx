import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Toast from './components/UI/Toast';
import { Sun, Moon } from 'lucide-react';
import {
  initDb,
  getProducts,
  saveProduct,
  deleteProduct,
  getDashboardStats,
  registerSale,
  getSettings,
  saveSettings
} from './db/localDb';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalVendidoHoy: 0,
    gananciaHoy: 0,
    transaccionesHoy: 0,
    alerts: [],
    last7Days: [],
    alertLimit: 5
  });
  
  // Estado para notificaciones Toast
  const [toast, setToast] = useState(null);
  
  // Estado para Dark Mode (Persistente)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('pos_dark_mode') === 'true';
  });

  // Inicializar base de datos al montar la app
  useEffect(() => {
    initDb();
    refreshData();
  }, []);

  // Manejar el tema de color oscuro/claro
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('pos_dark_mode', darkMode);
  }, [darkMode]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Refrescar todos los datos del estado local
  const refreshData = () => {
    setProducts(getProducts());
    setStats(getDashboardStats());
  };

  // Operaciones de Producto
  const handleSaveProduct = (productData) => {
    saveProduct(productData);
    refreshData();
    showToast(
      productData.id 
        ? `Producto "${productData.nombre}" actualizado con éxito.` 
        : `Producto "${productData.nombre}" creado con éxito.`,
      'success'
    );
  };

  const handleDeleteProduct = (id) => {
    try {
      deleteProduct(id);
      refreshData();
      showToast('Producto eliminado del inventario.', 'info');
    } catch (err) {
      showToast(err.message || 'Error al eliminar el producto.', 'error');
    }
  };

  // Restock rápido desde Dashboard
  const handleQuickRestock = (productId, amount) => {
    const productsList = getProducts();
    const prod = productsList.find(p => p.id === productId);
    if (prod) {
      prod.stockActual += amount;
      saveProduct(prod);
      refreshData();
      showToast(`Se agregaron +${amount} unidades a "${prod.nombre}".`, 'success');
    }
  };

  // Actualizar límite de stock bajo
  const handleUpdateStockLimit = (newLimit) => {
    const currentSettings = getSettings();
    saveSettings({ ...currentSettings, stockAlertLimit: newLimit });
    refreshData();
    showToast(`Límite de alerta actualizado a ${newLimit} unidades.`, 'info');
  };

  // Realizar Cobro en el POS
  const handleCheckout = (cartItems) => {
    try {
      registerSale(cartItems);
      refreshData();
      showToast('Venta cobrada con éxito. El inventario ha sido actualizado.', 'success');
    } catch (err) {
      showToast(err.message || 'Error al procesar la venta.', 'error');
      throw err; // Relanzar para que el POS sepa que falló
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-250">
      
      {/* Sidebar de navegación */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        lowStockCount={stats.alerts.length}
      />

      {/* Panel Principal */}
      <main className="flex-1 px-4 py-6 pb-24 md:pb-6 md:px-8 overflow-y-auto max-h-screen">
        
        {/* Cabecera superior con botón de Dark Mode */}
        <div className="flex justify-end items-center mb-6">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/80 shadow-sm"
            title={darkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Carga dinámica de vistas */}
        {currentView === 'dashboard' && (
          <Dashboard 
            stats={stats} 
            onUpdateStockLimit={handleUpdateStockLimit} 
            onQuickRestock={handleQuickRestock} 
            onNavigateToInventory={() => setCurrentView('inventory')}
          />
        )}

        {currentView === 'pos' && (
          <POS 
            products={products} 
            onCheckout={handleCheckout} 
          />
        )}

        {currentView === 'inventory' && (
          <Inventory 
            products={products} 
            alertLimit={stats.alertLimit}
            onSaveProduct={handleSaveProduct} 
            onDeleteProduct={handleDeleteProduct} 
          />
        )}

      </main>

      {/* Notificación Toast flotante */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

    </div>
  );
}
