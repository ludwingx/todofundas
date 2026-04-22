# 3. Flujo de Ventas (Mayorista y Precios Variables)

## Diseño de la Base de Datos

El esquema Prisma está diseñado para no atar la venta al catálogo estático:

```prisma
model Sale {
  // ...
  quantity        Int
  unitPrice       Float    // <- SE DEFINE EN EL CHECKOUT
  type            String   @default("minorista") // 'minorista' o 'mayorista'
  notes           String?  // Justificación del precio o descuento
  // ...
}
```

## Flujo Lógico en UI/Server Actions

1. **Selección:** El vendedor selecciona el producto (identificado por modelo, marca, color).
2. **Definición de Tipo:** El sistema consulta si la venta es `minorista` o `mayorista`.
3. **Fijación de Precio:** 
   - El UI sugiere un precio base o muestra el costo de compra (`costPrice`) de forma oculta para referencia del margen.
   - El vendedor introduce el `unitPrice` acordado.
4. **Notas:** Se puede añadir una nota ("Descuento por cliente frecuente", "Promoción").
5. **Transacción (Server Action):**
   - Se crea el registro `Sale`.
   - Se resta el `stock` del `Product`.
   - Se guarda el registro de movimiento (`InventoryMovement`).

## Ventaja del Modelo
Este diseño permite calcular la ganancia neta mes a mes con extrema precisión, restando `(Sale.unitPrice * quantity)` menos `(Product.costPrice * quantity)`, sin depender de precios de lista que fluctúan.
