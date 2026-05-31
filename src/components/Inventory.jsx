import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Barcode, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

export default function Inventory({ products, alertLimit, onSaveProduct, onDeleteProduct }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Estados para el formulario
  const [formBarcode, setFormBarcode] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formPrecioCosto, setFormPrecioCosto] = useState('');
  const [formPrecioVenta, setFormPrecioVenta] = useState('');
  const [formStockActual, setFormStockActual] = useState('');
  const [formError, setFormError] = useState('');

  // Abrir modal para agregar
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormBarcode('');
    setFormNombre('');
    setFormPrecioCosto('');
    setFormPrecioVenta('');
    setFormStockActual('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormBarcode(product.barcode);
    setFormNombre(product.nombre);
    setFormPrecioCosto(product.precioCosto.toString());
    setFormPrecioVenta(product.precioVenta.toString());
    setFormStockActual(product.stockActual.toString());
    setFormError('');
    setIsModalOpen(true);
  };

  // Guardar formulario (crear/editar)
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    // Validaciones
    if (!formBarcode.trim()) return setFormError('El código de barras es requerido.');
    if (!formNombre.trim()) return setFormError('El nombre del producto es requerido.');
    
    const costo = parseFloat(formPrecioCosto);
    const venta = parseFloat(formPrecioVenta);
    const stock = parseInt(formStockActual, 10);

    if (isNaN(costo) || costo < 0) return setFormError('El precio de costo debe ser un número positivo.');
    if (isNaN(venta) || venta < 0) return setFormError('El precio de venta debe ser un número positivo.');
    if (venta < costo) return setFormError('Advertencia: El precio de venta es menor que el de costo.');
    if (isNaN(stock) || stock < 0) return setFormError('El stock inicial/actual debe ser un entero positivo.');

    const productData = {
      id: editingProduct ? editingProduct.id : null,
      barcode: formBarcode.trim(),
      nombre: formNombre.trim(),
      precioCosto: costo,
      precioVenta: venta,
      stockActual: stock
    };

    try {
      onSaveProduct(productData);
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Error al guardar el producto.');
    }
  };

  // Auto-generar código de barras
  const generateRandomBarcode = () => {
    // Generar un código de 13 dígitos
    let code = '779'; // Prefijo de Argentina común
    for (let i = 0; i < 10; i++) {
      code += Math.floor(Math.random() * 10);
    }
    setFormBarcode(code);
  };

  // Filtrar productos
  const filteredProducts = products.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Inventario de Productos</h2>
          <p className="text-slate-500 dark:text-slate-400">Administra el stock, precios y códigos de barra de tu almacén.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 dark:shadow-none"
        >
          <Plus size={18} />
          Agregar Producto
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre o código de barras..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Tabla de Productos */}
      <div className="overflow-hidden rounded-2xl border border-slate-150 bg-white shadow-sm dark:border-slate-850 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850">
              <tr>
                <th scope="col" className="px-6 py-4">Código / Nombre</th>
                <th scope="col" className="px-6 py-4 text-right">Precio Costo</th>
                <th scope="col" className="px-6 py-4 text-right">Precio Venta</th>
                <th scope="col" className="px-6 py-4 text-right">Margen</th>
                <th scope="col" className="px-6 py-4 text-center">Stock</th>
                <th scope="col" className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                    No se encontraron productos en el inventario.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const margin = product.precioVenta - product.precioCosto;
                  const marginPercent = ((margin / product.precioCosto) * 100).toFixed(0);
                  
                  // Estado de stock
                  let stockBadgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400';
                  if (product.stockActual === 0) {
                    stockBadgeClass = 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400';
                  } else if (product.stockActual <= alertLimit) {
                    stockBadgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400';
                  }

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            <Barcode size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{product.nombre}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{product.barcode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-medium text-slate-600 dark:text-slate-400">
                        ${product.precioCosto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-100">
                        ${product.precioVenta.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right text-xs">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          +${margin.toLocaleString('es-AR')}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">({marginPercent}%)</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold ${stockBadgeClass}`}>
                          {product.stockActual} u.
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950/40 dark:text-slate-400 dark:hover:text-indigo-400"
                            title="Editar"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Estás seguro de eliminar el producto "${product.nombre}"?`)) {
                                onDeleteProduct(product.id);
                              }
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:text-slate-400 dark:hover:text-rose-400"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Agregar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h3>

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Código de barras */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Código de Barras
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Barcode className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input
                      type="text"
                      required
                      placeholder="Escanear o escribir código..."
                      value={formBarcode}
                      onChange={(e) => setFormBarcode(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={generateRandomBarcode}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold px-2.5 shadow-sm"
                    title="Generar Código Automático"
                  >
                    <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
                    <span>Auto</span>
                  </button>
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Yerba Mate 1kg"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Precios (Costo / Venta) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    Precio Costo ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={formPrecioCosto}
                    onChange={(e) => setFormPrecioCosto(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    Precio Venta ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={formPrecioVenta}
                    onChange={(e) => setFormPrecioVenta(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Stock Actual (Unidades)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="0"
                  value={formStockActual}
                  onChange={(e) => setFormStockActual(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              {/* Footer Acciones */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-850 text-sm font-semibold px-4 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Registrar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
