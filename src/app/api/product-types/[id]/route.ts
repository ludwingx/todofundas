import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: Obtener un tipo de producto por ID
export async function GET(
  _req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const type = await prisma.productType.findUnique({ where: { id } })
  if (!type) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(type)
}

// PUT: Actualizar un tipo de producto
export async function PUT(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const data = await req.json()
    const updated = await prisma.productType.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar tipo' }, { status: 500 })
  }
}

// PATCH: Actualizar parcialmente un tipo de producto
export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const data = await req.json()
    const updated = await prisma.productType.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar tipo' }, { status: 500 })
  }
}

// DELETE: Soft delete de un tipo de producto
export async function DELETE(
  _req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.productType.update({ where: { id }, data: { status: 'deleted' } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar tipo' }, { status: 500 })
  }
}
