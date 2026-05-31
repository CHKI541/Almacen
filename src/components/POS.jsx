import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, DollarSign, ArrowRight, Focus, AlertCircle, ShoppingBag, Receipt } from 'lucide-react';

export default function POS({ products, onCheckout, toastMessage, setToastMessage }) {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [cashReceived, setCashReceived] = useState('');
  const [changeAmount, setChangeAmount] = useState(0);
  const [inputFocused, setInputFocused] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  const scannerInputRef = useRef(null);

  // Mantener auto-focus en el input de escaneo
  useEffect(() => {
    focusScanner();
  }, []);

  const focusScanner = () => {
    if (scannerInputRef.current) {
      scannerInputRef.current.focus();
      setInputFocused(true);
    }
  };

  // Calcular vuelto en tiempo real
  const total = cart.reduce((sum, item) => sum + item.product.precioVenta * item.cantidad, 0);

  useEffect(() => {
    if (paymentMethod !== 'Efectivo') {
      setChangeAmount(0);
      return;
    }
    const cash = parseFloat(cashReceived);
    if (!isNaN(cash) && cash >= total) {
      setChangeAmount(cash - total);
    } else {
      setChangeAmount(0);
    }
  }, [cashReceived, total, paymentMethod]);

  // Manejar el escaneo de código de barras
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const code = barcodeInput.trim();
    if (!code) return;

    // Buscar en la lista de productos
    const product = products.find(p => p.barcode === code);
    if (!product) {
      setErrorMessage(`El código "${code}" no corresponde a ningún producto.`);
      setBarcodeInput('');
      // Refocalizar de inmediato
      focusScanner();
      return;
    }

    addToCart(product);
    setBarcodeInput('');
  };

  // Agregar producto al carrito
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex > -1) {
        const currentQty = prevCart[existingItemIndex].cantidad;
        if (product.stockActual <= currentQty) {
          setErrorMessage(`No hay más stock disponible para "${product.nombre}" (Disponibles: ${product.stockActual}).`);
          focusScanner();
          return prevCart;
        }
        
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          cantidad: currentQty + 1
        };
        return newCart;
      } else {
        if (product.stockActual <= 0) {
          setErrorMessage(`El producto "${product.nombre}" no tiene stock disponible.`);
          focusScanner();
          return prevCart;
        }
        return [...prevCart, { product, cantidad: 1 }];
      }
    });
    
    // Refocalizar después del estado
    setTimeout(focusScanner, 50);
  };

  // Modificar cantidad en el carrito
  const updateQuantity = (productId, delta) => {
    setErrorMessage('');
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const newQty = item.cantidad + delta;
          if (newQty <= 0) return null;
          
          if (delta > 0 && item.product.stockActual <= item.cantidad) {
            setErrorMessage(`Límite de stock alcanzado para "${item.product.nombre}".`);
            return item;
          }
          return { ...item, cantidad: newQty };
        }
        return item;
      }).filter(Boolean);
    });
    setTimeout(focusScanner, 50);
  };

  // Eliminar ítem del carrito
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    setTimeout(focusScanner, 50);
  };

  // Confirmar cobro
  const handlePay = () => {
    if (cart.length === 0) return;
    
    if (paymentMethod === 'Efectivo') {
      const cash = parseFloat(cashReceived);
      if (isNaN(cash) || cash < total) {
        setErrorMessage('El monto recibido en efectivo es menor al total de la venta.');
        focusScanner();
        return;
      }
    }

    try {
      onCheckout(cart);
      // Éxito: Limpiar carrito y estado de pago
      setCart([]);
      setCashReceived('');
      setChangeAmount(0);
      setErrorMessage('');
      focusScanner();
    } catch (err) {
      setErrorMessage(err.message || 'Error al procesar la venta.');
      focusScanner();
    }
  };

  // Simular escaneo de producto rápido
  const simulateScan = (barcode) => {
    setBarcodeInput(barcode);
    // Simular el evento submit
    setTimeout(() => {
      const product = products.find(p => p.barcode === barcode);
      if (!product) {
        setErrorMessage(`Código "${barcode}" no encontrado.`);
      } else {
        addToCart(product);
      }
      setBarcodeInput('');
    }, 100);
  };

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
      
      {/* Columna Izquierda: Escáner y Carrito (Largo en Desktop) */}
      <div className="lg:col-span-8 flex flex-col h-full space-y-4">
        
        {/* Sección de Escaneo de Barras */}
        <div className="rounded-2xl border border-slate-150 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search size={18} />
              </span>
              <input
                ref={scannerInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Escanea o escribe código de barras aquí y presiona Enter..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            
            {/* Indicador visual de conexión con el escáner */}
            <button
              type="button"
              onClick={focusScanner}
              className={`flex items-center gap-1.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                inputFocused
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900'
                  : 'bg-rose-50 text-rose-700 border-rose-250 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900 animate-pulse'
              }`}
            >
              <div className={`h-2 w-2 rounded-full ${inputFocused ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="hidden sm:inline">{inputFocused ? 'Lector Activo' : 'Lector Pausado (Hacer Clic)'}</span>
              <Focus size={14} className="sm:hidden" />
            </button>
          </form>
          
          {/* Mensajes de error en POS */}
          {errorMessage && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 p-3 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Lista del Carrito */}
        <div className="flex-1 rounded-2xl border border-slate-150 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Productos en Carrito</h4>
            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {cart.reduce((sum, item) => sum + item.cantidad, 0)} ítems
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/60 pr-1">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <ShoppingBag size={48} className="text-slate-300 dark:text-slate-700 mb-2 stroke-[1.5]" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">El carrito está vacío</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[280px]">Utiliza el lector de barras o selecciona un producto rápido de simulación abajo.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between py-3 hover:bg-slate-50/20">
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{item.product.nombre}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      ${item.product.precioVenta.toLocaleString('es-AR')} x unidad • Stock: {item.product.stockActual}
                    </p>
                  </div>

                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 mr-4 shadow-sm">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-800 dark:text-slate-200">{item.cantidad}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Subtotal e icono borrar */}
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-250 font-mono">
                        ${(item.product.precioVenta * item.cantidad).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Panel de Simulación de Productos Rápidos (para probar sin escáner real) */}
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 mb-2">
              <Receipt size={14} className="text-indigo-500" />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Simulador de Escaneo de Productos Semilla:</p>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {products.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => simulateScan(p.barcode)}
                  disabled={p.stockActual <= 0}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 py-1.5 px-2.5 transition-colors border border-slate-200/40 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {p.nombre.split(' ')[0]} ({p.stockActual})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Resumen de Pago y Finalización */}
      <div className="lg:col-span-4 flex flex-col space-y-4">
        
        {/* Panel de Resumen de Pago */}
        <div className="rounded-2xl border border-slate-150 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between h-full">
          
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 pb-3 border-b border-slate-100 dark:border-slate-800">Resumen y Pago</h4>
            
            {/* Total Display */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total a Cobrar</p>
              <h2 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 font-mono tracking-tight">
                ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>

            {/* Método de Pago */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">Método de Pago</label>
              <div className="grid grid-cols-3 gap-2">
                {['Efectivo', 'Tarjeta', 'Transferencia'].map((method) => {
                  const isSelected = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(method);
                        setErrorMessage('');
                        focusScanner();
                      }}
                      className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-indigo-650 text-white border-indigo-650 dark:bg-indigo-600 dark:border-indigo-600 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-350 text-slate-700 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {method === 'Efectivo' && <DollarSign size={16} className="mb-1" />}
                      {method === 'Tarjeta' && <CreditCard size={16} className="mb-1" />}
                      {method === 'Transferencia' && <ArrowRight size={16} className="mb-1" />}
                      <span>{method}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cálculo de vuelto (solo efectivo) */}
            {paymentMethod === 'Efectivo' && (
              <div className="space-y-4 pt-2 animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">Paga con ($)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 font-mono text-sm">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-7 pr-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Cambio (Vuelto):</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    ${changeAmount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Botón Cobrar */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 lg:mt-auto">
            <button
              onClick={handlePay}
              disabled={cart.length === 0}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 disabled:bg-slate-100 hover:bg-indigo-700 text-white disabled:text-slate-400 py-4 text-base font-bold shadow-lg shadow-indigo-150 disabled:shadow-none hover:shadow-xl dark:shadow-none transition-all disabled:pointer-events-none"
            >
              <span>Confirmar y Cobrar</span>
              <ArrowRight size={20} className="stroke-[2.5]" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
