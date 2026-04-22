# Documentación de Market GS

Este directorio contiene la documentación técnica y funcional del proyecto **Market GS** (anteriormente TodoFundas), un sistema avanzado de gestión de inventario, ventas y compras para accesorios de celulares.

## 1. Descripción general del proyecto

Market GS es un sistema independiente diseñado de manera robusta y escalable.

Características principales:
- **Gestión de inventario granular** (modelo, marca, color, material, tipo).
- **Precios dinámicos**: El precio de venta se declara en el momento de la transacción, registrándose siempre el costo original de compra.
- **Venta Mayorista y Minorista**: Despachos con precios sobre la marcha.
- **Seguimiento de pedidos a proveedores**: Control exhaustivo desde el pedido hasta la recepción (verificación de productos en buen estado vs. dañados).
- **Wallet Interna**: Registro financiero de devoluciones y saldos a favor con los proveedores.
- Estética y UI en **blanco y negro** con componentes premium (shadcn/ui).

## 2. Tecnologías principales

- **Framework**: Next.js 16 (App Router) + Server Actions
- **Lenguaje**: TypeScript
- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **UI**: shadcn/ui + TailwindCSS v4

## 3. Documentación Técnica

La documentación detallada se encuentra dividida en los siguientes archivos:

- [1. Negocio y Requerimientos](01-negocio-y-requerimientos.md)
- [2. Arquitectura](02-arquitectura.md)
- [3. Flujo de Ventas (Mayorista y Precios Variables)](03-flujo-de-ventas.md)
- [4. Flujo de Compras y Wallet](04-flujo-de-compras-y-wallet.md)

*(Revisar el `DOCS_PLAN.md` en la raíz para ver el progreso de la documentación general).*
