import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const data: any = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    // Procesar imagen si viene
    let imageUrl: string | null = null;
    const imageFile = formData.get('image');
    if (imageFile && typeof imageFile === 'object' && 'arrayBuffer' in imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const filename = `product_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
      const fs = require('fs');
      const path = require('path');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
      imageUrl = `/uploads/${filename}`;
    }
    // Validación básica (permitir 0 como valor válido)
    console.log('BODY RECIBIDO', data);
    if (
      !data.name ||
      !data.phoneModelId ||
      !data.typeId ||
      !data.color ||
      data.stock === undefined || data.stock === null ||
      data.priceRetail === undefined || data.priceRetail === null
    ) {
      return NextResponse.json({ error: 'Faltan campos obligatorios', body: data }, { status: 400 });
    }
    const product = await prisma.product.create({
      data: {
        name: data.name,
        phoneModelId: data.phoneModelId,
        typeId: data.typeId,
        supplierId: data.supplierId || null,
        color: data.color,
        stock: Number(data.stock),
        minStock: Number(data.minStock) || 5,
        priceRetail: Number(data.priceRetail),
        priceWholesale: Number(data.priceWholesale),
        costPrice: Number(data.costPrice),
        imageUrl: imageUrl,
      },
    });
    return NextResponse.json({ success: true, productId: product.id });
  } catch (error) {
    console.error('Error creando producto:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
