# Plantilla de Información del Proyecto TodoFundas

Rellena este archivo con la mayor cantidad de detalle posible. Yo usaré esta información para generar documentación clara y estructurada en `docs/`.

## 1. Información de negocio

1.1. **Descripción corta del negocio**  
> Ejemplo: Venta de fundas y accesorios para celulares, con gestión de inventario por modelo.

1.2. **Tipo de operación**  
- [ ] Solo tienda física  
- [ ] Solo online  
- [ ] Mixto (físico + online)  

1.3. **Objetivos principales de la app**  
> ¿Qué problemas te resuelve el sistema? ¿Qué métricas o puntos te interesa controlar?

1.4. **Moneda y país**  
> Ya sabemos que la moneda es BOB, pero confirma si hay algo extra (ej: manejo de tipo de cambio, impuestos locales, etc.).

---

## 2. Usuarios y roles

2.1. **Tipos de usuario**  
> Ejemplo: Admin, vendedor, cajero, solo consulta, etc.

2.2. **Permisos por tipo de usuario**  
> Para cada tipo de usuario, explica qué puede hacer y qué no.

2.3. **Flujo de autenticación** (si aplica)  
> ¿Cómo se registran/loguean los usuarios? ¿Solo tú creas usuarios? ¿Hay recuperación de contraseña?

---

## 3. Módulos del sistema

### 3.1. Inventario / Configuración

3.1.1. **Modelos de teléfono (`/inventory/phone-models`)**  
- ¿Cómo quieres organizar los modelos?  
- ¿Alguna regla especial al crear/editar/borrar modelos?

3.1.2. **Marcas (`/inventory/brands`)**  
- ¿Cómo usas las marcas en el día a día?  
- ¿Algo especial respecto a los logos (URLs, tamaños, origen de las imágenes)?

3.1.3. **Colores (`/inventory/colors`)**  
- ¿Tienes una lista fija o se pueden crear muchos colores nuevos?  
- ¿Alguna convención de nombres/códigos que quieras seguir?

3.1.4. **Materiales (`/inventory/materials`)**  
- ¿Qué materiales usas usualmente?  
- ¿Alguna regla sobre combinaciones de material + tipo de producto?

3.1.5. **Tipos de producto (`/inventory/types`)**  
- ¿Qué tipos de productos manejas? (fundas, vidrio templado, etc.)  
- ¿Algún comportamiento distinto por tipo (ej: manejo de stock diferente)?

3.1.6. **Compatibilidad (`/inventory/compatibility`)**  
- ¿Cómo quieres manejar las compatibilidades entre productos y modelos?  
- ¿Hay reglas que deban evitar combinaciones inválidas?

### 3.2. Compras

3.2.1. **Proveedores**  
- ¿Qué datos son importantes para ti de un proveedor (teléfono, dirección, notas, etc.)?

3.2.2. **Flujo de compra**  
> Describe paso a paso cómo registras una compra en la vida real y qué datos necesitas guardar.

### 3.3. Ventas

3.3.1. **Flujo de venta**  
> Paso a paso: desde que llega un cliente hasta que se registra la venta.

3.3.2. **Descuentos y promociones**  
- ¿Cómo manejas descuentos? (porcentaje, precio fijo, combos, etc.)  
- ¿Hay reglas especiales (máximo descuento, niveles de usuario, etc.)?

3.3.3. **Clientes**  
- ¿Qué datos te interesa guardar de un cliente?  
- ¿Necesitas historial de compras por cliente?

---

## 4. Reglas de negocio importantes

4.1. **Reglas sobre stock**  
> Ejemplo: no permitir ventas si el stock es 0, alertas de stock mínimo, etc.

4.2. **Reglas sobre precios**  
> Ejemplo: relación entre precio mayorista y minorista, márgenes mínimos, redondeos, etc.

4.3. **Estados de entidades**  
> Ejemplo: `active`, `inactive`, `deleted` para marcas, modelos, productos, etc. ¿Qué significan y cómo se usan?

4.4. **Otras reglas específicas**  
> Cualquier otra cosa que digas: “esto siempre quiero que el sistema respete esta lógica”.

---

## 5. Flujo de datos y reportes

5.1. **Reportes que necesitas**  
> Ejemplos: ventas por día, por modelo, por marca; productos más vendidos; stock actual por modelo.

5.2. **Flujos clave**  
> Escribe 2-3 flujos completos que sean importantes para ti. Ej: 
> - Registrar nuevo producto (desde crear marca/modelo hasta tener stock).
> - Registrar venta con descuento.
> - Ajuste manual de inventario.

---

## 6. Prioridades

6.1. **¿Qué partes del sistema son más críticas para ti?**  
> Numera o marca qué módulos son top-prioridad (inventario, ventas, reportes, etc.).

6.2. **Funcionalidades futuras que quieres**  
> Lista de ideas o features que te gustaría tener más adelante.

---

## 7. Notas adicionales

Usa este espacio para cualquier comentario libre que creas que me ayudará a entender mejor tu negocio y cómo debería explicarse el sistema en la documentación.
