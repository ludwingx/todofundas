# Documentación de TodoFundas

Este directorio contiene la documentación técnica y funcional del proyecto **TodoFundas**.

## 1. Descripción general del proyecto

TodoFundas es una aplicación para **gestionar inventario, compras y ventas** de fundas y accesorios para teléfonos celulares. 

Características principales:
- Gestión de inventario por **modelo de teléfono**, **marca**, **color**, **material** y **tipo de producto**.
- Registro de **compras** y **movimientos de inventario**.
- Registro de **ventas**, clientes y precios en Bolivianos (BOB).
- Panel de configuración para administrar catálogos base (marcas, modelos, colores, materiales, tipos, compatibilidad, proveedores, etc.).

## 2. Tecnologías principales

- **Framework**: Next.js (App Router)
- **Lenguaje**: TypeScript
- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **UI**: Componentes basados en shadcn/ui + TailwindCSS

## 3. Estructura general de carpetas

> Nota: Esta sección es un resumen. El detalle fino se documentará en archivos específicos dentro de `docs/`.

- `/prisma`
  - `schema.prisma`: definición de modelos (Brand, PhoneModel, Product, Color, Material, Supplier, Client, User, Sale, Purchase, InventoryMovement, etc.).
- `/src/app`
  - Rutas y páginas de la aplicación usando el App Router de Next.js.
  - Subcarpetas importantes:
    - `/dashboard`: panel principal.
    - `/inventory`: módulos de inventario y configuración (modelos, marcas, colores, materiales, tipos, compatibilidad, etc.).
    - `/purchases`: módulos relacionados a compras y proveedores.
    - `/sales` (u otra carpeta según el código actual): gestión de ventas.
    - `/api`: rutas API (REST) para CRUD de entidades (brands, phone-models, colors, materials, products, etc.).
- `/src/components`
  - Componentes reutilizables de UI.
  - Ejemplos relevantes:
    - `app-sidebar.tsx`: sidebar principal de navegación.
    - Componentes de tabla, formularios, diálogos, etc.
- `/src/lib`
  - Código de soporte:
    - Cliente de Prisma (`prisma.ts`).
    - Helpers para consumir APIs desde el front (`phone-models-api.ts`, etc.).
- `/docs`
  - Documentación del proyecto (este directorio).

## 4. Módulos principales (visión rápida)

- **Inventario / Configuración**
  - `/inventory/phone-models`: administración de modelos de teléfono.
  - `/inventory/brands`: administración de marcas (incluye URL de logo de marca).
  - `/inventory/colors`: paleta de colores.
  - `/inventory/materials`: materiales disponibles.
  - `/inventory/types`: tipos de producto.
  - `/inventory/compatibility`: compatibilidades entre productos y modelos de teléfono.
- **Compras**
  - Gestión de proveedores y compras que impactan el inventario.
- **Ventas**
  - Registro de ventas, clientes y movimientos de salida de inventario.
- **Usuarios y autenticación**
  - Módulo de login y control de acceso (por ejemplo, `/app/actions/auth`).

## 5. Próximos pasos de documentación

La guía detallada se irá desglosando en archivos adicionales dentro de `docs/`, siguiendo el plan definido en `DOCS_PLAN.md` en la raíz del proyecto.

Sugerencias de siguientes archivos:
- `docs/arquitectura.md`: arquitectura de la aplicación.
- `docs/estructura-carpetas.md`: detalle completo de la estructura de directorios.
- `docs/inventario.md`: explicación de todos los módulos de inventario y configuración.
- `docs/compras.md`: flujo de compras.
- `docs/ventas.md`: flujo de ventas.
- `docs/auth.md`: autenticación y roles.
