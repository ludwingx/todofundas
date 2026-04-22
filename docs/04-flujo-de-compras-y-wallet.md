# 4. Flujo de Compras y Seguimiento de Wallet

El proceso logístico en Market GS contempla la alta variabilidad y los riesgos de envíos de proveedores (ej: daños en aduana o trayecto).

## 1. Solicitud al Proveedor
Se crea un registro de `Purchase` asociado a un `Supplier`. Por cada producto encargado, se genera un `PurchaseItem`.
- `quantityOrdered`: Lo que se pide (ej: 100 unidades).

## 2. Recepción y Verificación
Cuando la carga llega (físicamente a tienda o almacén fronterizo), el operario realiza el conteo.
El `PurchaseItem` se actualiza con:
- `quantityGood`: Ej: 90 unidades (Se suman al `Product.stock` disponible).
- `quantityDamaged`: Ej: 10 unidades (Se suman temporalmente al `Product.stockDamaged` para control físico).

## 3. Ajuste Financiero (La Wallet)
Las 10 unidades dañadas representan un déficit de dinero. En este punto, se negocia con el proveedor:
- **Opción A (Devolución de dinero):** Se registra una entrada en la `WalletTransaction` como `ingreso` (saldo a favor del negocio) con el `reason` = `ajuste_danado`.
- **Opción B (Crédito para próxima compra):** Se mantiene el saldo a favor en la wallet para descontarlo en la siguiente orden.

### Estructura de la Wallet:
```prisma
model WalletTransaction {
  id              String    @id @default(uuid())
  type            String    // 'ingreso', 'egreso'
  amount          Float
  reason          String    // 'devolucion_proveedor', 'ajuste_danado'
  referenceId     String?   // Apunta al PurchaseID
  referenceType   String?   // 'Purchase'
  userId          String    // Quién autoriza/registra
}
```

Esto asegura que ninguna pérdida se pase por alto y exista un balance financiero exacto con cada proveedor.
