# 1. Negocio y Requerimientos - Market GS

## Visión General
Market GS es un sistema robusto de gestión comercial diseñado para la venta de accesorios de celular. El modelo de negocio se basa en un porcentaje sobre las ganancias de ventas mensuales, con una estética visual sobria y profesional en blanco y negro.

## Requerimientos Clave Soportados

### A. Venta Mayorista y Minorista
El sistema no se restringe al clásico "precio de catálogo". Permite despachar productos a negocios o clientes finales, permitiendo declarar el **precio exacto de la venta** en el checkout, según la negociación del momento.

### B. Precios Variables
A diferencia de un e-commerce tradicional:
- **Los precios varían constantemente.**
- En el catálogo (`Product`) se registra el **Costo de Compra** (`costPrice`).
- El precio de venta se inyecta dinámicamente en cada transacción (tabla `Sale`), registrando el margen de ganancia real por cada venta individual.

### C. Seguimiento de Pedidos y Dañados
El flujo de abastecimiento soporta logística internacional (ej: Brasil hasta frontera):
- Se pide un producto X (cantidad solicitada).
- Al llegar, se evalúa: cantidad en buen estado vs. cantidad dañada.
- Las incidencias generan compensaciones o devoluciones, las cuales se administran en una **Wallet** interna.
