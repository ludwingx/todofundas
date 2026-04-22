# 2. Arquitectura del Sistema

## Modelo de Datos y Entidades

El sistema está construido para ser escalable y manejar inventarios complejos sin atar las transacciones a precios estáticos.

### Prisma Data Model (Resumen Arquitectónico)
- **Catálogos Desacoplados:** `Brand`, `PhoneModel`, `Color`, `Material`, `ProductType`. 
- **Núcleo de Inventario:** `Product` unifica todos los catálogos y almacena el `costPrice`.
- **Transacciones:** `Sale` (guarda `unitPrice` dinámico y `type`), `Purchase`, `PurchaseItem` (rastrea `quantityOrdered`, `quantityGood`, `quantityDamaged`).
- **Finanzas Internas:** `WalletTransaction` (para la billetera de compensaciones y registro de flujo).
- **Usuarios:** `User` y `Client` para manejar los niveles de acceso y los clientes registrados.
