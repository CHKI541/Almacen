// Base de datos simulada en localStorage para el POS e Inventario

const PRODUCTS_KEY = 'pos_products';
const SALES_KEY = 'pos_sales';
const SETTINGS_KEY = 'pos_settings';

// Datos semilla para el primer inicio
const SEED_PRODUCTS = [
  { id: '1', barcode: '7790070318645', nombre: 'Coca-Cola Original 2.25L', precioCosto: 1200, precioVenta: 1800, stockActual: 15 },
  { id: '2', barcode: '7791290007547', nombre: 'Yerba Mate Playadito 1kg', precioCosto: 2500, precioVenta: 3800, stockActual: 4 },
  { id: '3', barcode: '7790890000618', nombre: 'Galletitas Criollitas 3x100g', precioCosto: 600, precioVenta: 950, stockActual: 20 },
  { id: '4', barcode: '7790070411834', nombre: 'Leche Entera La Serenísima 1L', precioCosto: 800, precioVenta: 1100, stockActual: 3 },
  { id: '5', barcode: '7790359000028', nombre: 'Fideos Codito Lucchetti 500g', precioCosto: 700, precioVenta: 1050, stockActual: 12 },
  { id: '6', barcode: '7790060023689', nombre: 'Aceite de Girasol Natura 900ml', precioCosto: 1500, precioVenta: 2200, stockActual: 8 },
  { id: '7', barcode: '7790010531202', nombre: 'Alfajor Jorgito Chocolate', precioCosto: 300, precioVenta: 500, stockActual: 2 },
  { id: '8', barcode: '7790580510002', nombre: 'Arroz Ala Dorado 1kg', precioCosto: 900, precioVenta: 1300, stockActual: 10 }
];

// Generar algunas ventas de prueba para los últimos 3 días (incluyendo hoy)
const generateSeedSales = (products) => {
  const sales = [];
  const now = new Date();
  
  // Venta 1: Hace 2 días
  const date1 = new Date(now);
  date1.setDate(now.getDate() - 2);
  sales.push({
    id: 'sale_1',
    fecha: date1.toISOString(),
    productos: [
      { productoId: '1', nombre: 'Coca-Cola Original 2.25L', cantidad: 2, precioVenta: 1800, precioCosto: 1200 },
      { productoId: '3', nombre: 'Galletitas Criollitas 3x100g', cantidad: 1, precioVenta: 950, precioCosto: 600 }
    ],
    totalCobrado: 4550,
    gananciaTotal: 1550 // 4550 - (2400 + 600)
  });

  // Venta 2: Hace 1 día
  const date2 = new Date(now);
  date2.setDate(now.getDate() - 1);
  sales.push({
    id: 'sale_2',
    fecha: date2.toISOString(),
    productos: [
      { productoId: '2', nombre: 'Yerba Mate Playadito 1kg', cantidad: 1, precioVenta: 3800, precioCosto: 2500 },
      { productoId: '5', nombre: 'Fideos Codito Lucchetti 500g', cantidad: 3, precioVenta: 1050, precioCosto: 700 }
    ],
    totalCobrado: 6950,
    gananciaTotal: 2350 // 6950 - (2500 + 2100)
  });

  // Venta 3: Hoy temprano
  const date3 = new Date(now);
  date3.setHours(now.getHours() - 3);
  sales.push({
    id: 'sale_3',
    fecha: date3.toISOString(),
    productos: [
      { productoId: '1', nombre: 'Coca-Cola Original 2.25L', cantidad: 1, precioVenta: 1800, precioCosto: 1200 },
      { productoId: '4', nombre: 'Leche Entera La Serenísima 1L', cantidad: 2, precioVenta: 1100, precioCosto: 800 },
      { productoId: '7', nombre: 'Alfajor Jorgito Chocolate', cantidad: 4, precioVenta: 500, precioCosto: 300 }
    ],
    totalCobrado: 6000,
    gananciaTotal: 2000 // 6000 - (1200 + 1600 + 1200)
  });

  return sales;
};

// Inicializar DB
export const initDb = () => {
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(SEED_PRODUCTS));
  }
  if (!localStorage.getItem(SALES_KEY)) {
    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY));
    localStorage.setItem(SALES_KEY, JSON.stringify(generateSeedSales(products)));
  }
  if (!localStorage.getItem(SETTINGS_KEY)) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ stockAlertLimit: 5 }));
  }
};

// Configuración del límite
export const getSettings = () => {
  initDb();
  return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { stockAlertLimit: 5 };
};

export const saveSettings = (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// CRUD Productos
export const getProducts = () => {
  initDb();
  return JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
};

export const saveProduct = (product) => {
  const products = getProducts();
  
  // Validar código de barras único
  const existingWithBarcode = products.find(p => p.barcode === product.barcode && p.id !== product.id);
  if (existingWithBarcode) {
    throw new Error(`El código de barras "${product.barcode}" ya está asignado al producto "${existingWithBarcode.nombre}".`);
  }

  if (product.id) {
    // Editar existente
    const index = products.findIndex(p => p.id === product.id);
    if (index !== -1) {
      products[index] = { ...product };
    }
  } else {
    // Nuevo producto
    const newProduct = {
      ...product,
      id: Date.now().toString()
    };
    products.push(newProduct);
  }

  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  return products;
};

export const deleteProduct = (id) => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
  return filtered;
};

// Ventas
export const getSales = () => {
  initDb();
  return JSON.parse(localStorage.getItem(SALES_KEY)) || [];
};

export const registerSale = (cartItems) => {
  if (cartItems.length === 0) throw new Error("El carrito está vacío");

  const products = getProducts();
  const sales = getSales();

  // Validar y descontar stock
  const soldProductsSummary = [];
  let totalCobrado = 0;
  let totalCosto = 0;

  cartItems.forEach(item => {
    const product = products.find(p => p.id === item.product.id);
    if (!product) {
      throw new Error(`El producto "${item.product.nombre}" ya no existe en el inventario.`);
    }
    if (product.stockActual < item.cantidad) {
      throw new Error(`Stock insuficiente para "${product.nombre}". Disponible: ${product.stockActual}, Solicitado: ${item.cantidad}`);
    }

    // Descontar stock
    product.stockActual -= item.cantidad;

    // Registrar en detalle de la venta
    soldProductsSummary.push({
      productoId: product.id,
      nombre: product.nombre,
      cantidad: item.cantidad,
      precioVenta: product.precioVenta,
      precioCosto: product.precioCosto
    });

    totalCobrado += product.precioVenta * item.cantidad;
    totalCosto += product.precioCosto * item.cantidad;
  });

  // Guardar stock actualizado
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

  // Crear la venta
  const newSale = {
    id: 'sale_' + Date.now(),
    fecha: new Date().toISOString(),
    productos: soldProductsSummary,
    totalCobrado,
    gananciaTotal: totalCobrado - totalCosto
  };

  sales.unshift(newSale); // Agregar al inicio para mostrar la más reciente primero
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));

  return newSale;
};

// Estadísticas del Dashboard
export const getDashboardStats = () => {
  const sales = getSales();
  const products = getProducts();
  const settings = getSettings();
  const alertLimit = settings.stockAlertLimit;

  const todayStr = new Date().toISOString().split('T')[0];

  // Ventas de hoy
  const todaySales = sales.filter(sale => sale.fecha.split('T')[0] === todayStr);

  const totalVendidoHoy = todaySales.reduce((sum, s) => sum + s.totalCobrado, 0);
  const gananciaHoy = todaySales.reduce((sum, s) => sum + s.gananciaTotal, 0);
  const transaccionesHoy = todaySales.length;

  // Alertas de stock bajo
  const alerts = products.filter(p => p.stockActual <= alertLimit);

  // Historial de ventas para el gráfico de los últimos 7 días
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    const daySales = sales.filter(sale => sale.fecha.split('T')[0] === dateStr);
    const dayTotal = daySales.reduce((sum, s) => sum + s.totalCobrado, 0);
    const dayProfit = daySales.reduce((sum, s) => sum + s.gananciaTotal, 0);

    // Formatear etiqueta (Ej: "Lun 25")
    const label = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
    last7Days.push({
      dateStr,
      label,
      total: dayTotal,
      ganancia: dayProfit
    });
  }

  return {
    totalVendidoHoy,
    gananciaHoy,
    transaccionesHoy,
    alerts,
    last7Days,
    alertLimit
  };
};
