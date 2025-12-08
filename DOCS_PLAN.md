# Plan de Documentación de TodoFundas

Este archivo sirve como **task list** para ir construyendo la documentación del proyecto.

## Estado general

- [ ] Visión general del proyecto
- [ ] Arquitectura de la app (Next.js / API Routes / Prisma)
- [ ] Estructura de carpetas
- [ ] Módulo de Inventario
- [ ] Módulo de Compras
- [ ] Módulo de Ventas
- [ ] Módulo de Configuración (Modelos, Marcas, Colores, Materiales, Compatibilidad, Tipos de producto)
- [ ] Módulo de Usuarios y Autenticación
- [ ] Flujo de datos (DB → Prisma → API → UI)
- [ ] Guía de desarrollo local
- [ ] Guía de despliegue

## Detalle de secciones

### 1. Visión general del proyecto
- [ ] Objetivo de la aplicación (gestión de inventario y ventas de fundas/casos de celular).
- [ ] Público objetivo y casos de uso principales.

### 2. Arquitectura de la app
- [ ] Describir el uso de **Next.js App Router**.
- [ ] Describir el uso de **API Routes** para inventario, marcas, modelos, etc.
- [ ] Describir el uso de **Prisma** y PostgreSQL.

### 3. Estructura de carpetas
- [ ] Raíz del proyecto (configuración general, eslint, tsconfig, etc.).
- [ ] `/src/app` (rutas, layout, páginas por módulo).
- [ ] `/src/components` (componentes UI compartidos, sidebar, etc.).
- [ ] `/src/lib` (APIs helpers, prisma client, utilidades).
- [ ] `/prisma` (schema y migraciones).
- [ ] `/docs` (documentación).

### 4. Módulo de Inventario
- [ ] Describir `/inventory/phone-models`.
- [ ] Describir `/inventory/brands`.
- [ ] Describir `/inventory/colors`.
- [ ] Describir `/inventory/materials`.
- [ ] Describir `/inventory/types`.
- [ ] Describir `/inventory/compatibility`.

### 5. Módulo de Compras
- [ ] Rutas relacionadas a proveedores.
- [ ] Lógica de compras y movimientos de inventario.

### 6. Módulo de Ventas
- [ ] Rutas de ventas.
- [ ] Relación con clientes y productos.

### 7. Módulo de Usuarios y Autenticación
- [ ] Describir `/app/actions/auth`.
- [ ] Describir flujo de login y control de acceso.

### 8. Flujo de datos completo
- [ ] Ejemplo de cómo se crea un modelo de teléfono (Brand/PhoneModel/Product).
- [ ] Ejemplo de cómo se registra una venta.

### 9. Guía de desarrollo local
- [ ] Requisitos (Node, dependencias, env vars).
- [ ] Comandos principales (`npm install`, `npm run dev`, `prisma migrate`, etc.).

### 10. Guía de despliegue
- [ ] Variables de entorno necesarias.
- [ ] Notas sobre migraciones de base de datos.

Iremos marcando estos checkboxes a medida que se vayan completando las secciones en la carpeta `docs/`.
