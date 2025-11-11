import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const formData = await req.formData()
    const data: Record<string, unknown> = {}
    for (const [key, value] of formData.entries()) {
      data[key] = value
    }

    // Procesar imagen si viene
    let imageUrl: string | undefined
    const imageFile = formData.get('image')
    if (imageFile && typeof imageFile === 'object' && 'arrayBuffer' in imageFile) {
      const file = imageFile as File
      const buffer = Buffer.from(await file.arrayBuffer())
      const filename = `product_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
      const filePath = path.join(uploadDir, filename)
      fs.writeFileSync(filePath, buffer)
      imageUrl = `/uploads/${filename}`
    }

    // Validación básica
    if (!data.phoneModelId || !data.typeId || !data.color || data.stock === undefined || data.priceRetail === undefined) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        phoneModelId: data.phoneModelId as string,
        typeId: data.typeId as string,
        supplierId: data.supplierId ? (data.supplierId as string) : null,
        color: data.color as string,
        stock: Number(data.stock),
        minStock: data.minStock !== undefined ? Number(data.minStock) : undefined,
        priceRetail: Number(data.priceRetail),
        priceWholesale: Number(data.priceWholesale),
        costPrice: Number(data.costPrice),
        ...(imageUrl ? { imageUrl } : {}),
      },
    })

    return NextResponse.json({ success: true, productId: updated.id })
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
 
