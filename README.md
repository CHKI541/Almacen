# Almacén POS & Gestión de Inventario

Aplicación web moderna y rápida de Punto de Venta (POS) y Control de Inventario para almacenes locales, construida con React, Tailwind CSS v4 y persistencia en `localStorage`.

## Características Clave

* **Dashboard de Resumen**:
  * Estadísticas en tiempo real de ventas, ganancias netas y transacciones del día.
  * Gráfico SVG interactivo con historial de ventas de los últimos 7 días.
  * Panel de alertas de stock bajo con reabastecimiento directo en un clic.
* **Punto de Venta (POS)**:
  * Lector automático de códigos de barras (mantiene el foco en todo momento).
  * Indicador de estado del lector (Conectado / Pausado).
  * Carrito interactivo (modificar cantidades y borrar ítems).
  * Calculador de vuelto/cambio en tiempo real.
  * Simulador de lector con códigos de barra del inventario.
* **Gestión de Inventario (ABM/CRUD)**:
  * Registro completo de productos (Código de barras, nombre, precio de costo, precio de venta, stock).
  * Generador automático de códigos de barra aleatorios.
  * Visualización semafórica de alertas de stock.
  * Cálculo automático de margen de ganancia absoluto y porcentual.
* **Diseño Premium**:
  * Soporte completo para **Modo Oscuro / Modo Claro**.
  * Tipografía *Outfit* de Google Fonts y transiciones fluidas.
  * Optimizado para pantallas táctiles y monitores tradicionales.

## Despliegue en GitHub Pages

Esta aplicación cuenta con un pipeline de integración y despliegue continuo configurado con **GitHub Actions** (`.github/workflows/deploy.yml`). Cada vez que subes un cambio a la rama `main`, la aplicación se compila y publica automáticamente.

Para habilitar la publicación:
1. Dirígete a la pestaña **Settings** (Configuración) de este repositorio.
2. Haz clic en **Pages** en el menú izquierdo.
3. En **Source** (Origen), selecciona **GitHub Actions**.

La web estará disponible en: `https://<tu-usuario-github>.github.io/Almacen/`
