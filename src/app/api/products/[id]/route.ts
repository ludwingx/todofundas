import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    console.log(`Iniciando actualización del producto ${id}`);
    
    const formData = await req.formData();
    const data: Record<string, unknown> = {};
    
    // Convertir FormData a objeto para facilitar el manejo
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    console.log('Datos recibidos en el servidor:', JSON.stringify(data, null, 2));

    // Validación de campos requeridos
    const requiredFields = ['phoneModelId', 'typeId', 'priceRetail'];
    const missingFields = requiredFields.filter(field => !data[field] && data[field] !== 0);
    
    if (missingFields.length > 0) {
      console.error('Faltan campos obligatorios:', missingFields);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Faltan campos obligatorios',
          missingFields,
          receivedData: data 
        }, 
        { status: 400 }
      );
    }
    
    // El color es opcional, si no viene o es cadena vacía, se guarda como null
    const colorValue = data.color === '' ? null : String(data.color);

    // Procesar imagen si viene
    let imageUrl: string | undefined;
    const imageFile = formData.get('image');
    
    if (imageFile && typeof imageFile === 'object' && 'arrayBuffer' in imageFile) {
      try {
        const file = imageFile as File;
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `product_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, buffer);
        imageUrl = `/uploads/${filename}`;
        console.log('Imagen guardada en:', imageUrl);
      } catch (error) {
        console.error('Error al procesar la imagen:', error);
        // No detenemos el flujo por un error en la imagen
      }
    }

    // Preparar datos para la actualización
    const updateData: any = {
      phoneModelId: String(data.phoneModelId),
      typeId: String(data.typeId),
      supplierId: data.supplierId ? String(data.supplierId) : null,
      color: colorValue,
      stock: Number(data.stock) || 0,
      minStock: data.minStock !== undefined ? Number(data.minStock) : 0,
      priceRetail: Number(data.priceRetail) || 0,
      priceWholesale: data.priceWholesale ? Number(data.priceWholesale) : 0,
      costPrice: data.costPrice ? Number(data.costPrice) : 0,
    };

    // Agregar la URL de la imagen si se subió una nueva
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    console.log('Datos para actualizar:', JSON.stringify(updateData, null, 2));

    // Actualizar el producto
    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    console.log('Producto actualizado correctamente:', updated.id);
    return NextResponse.json({ success: true, productId: updated.id });
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 })
  }
}

// PATCH /api/products/[id] - actualizar solo estado u otros campos simples via JSON
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await req.json()

    const data: Record<string, unknown> = {}
    if (body.status) {
      data.status = String(body.status)
    }
    // Extensible: permitir cambios puntuales sin usar formData
    if (body.minStock !== undefined) data.minStock = Number(body.minStock)

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nada para actualizar' }, { status: 400 })
    }

    const updated = await prisma.product.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error en PATCH product:', error)
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 })
  }
}

// DELETE /api/products/[id] - soft delete (status = 'deleted')
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    await prisma.product.update({ where: { id }, data: { status: 'deleted' } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error eliminando producto:', error)
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 })
  }
}
 
