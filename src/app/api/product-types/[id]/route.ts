import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: Obtener un tipo de producto por ID
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const type = await prisma.productType.findUnique({ where: { id: params.id } })
  if (!type) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(type)
}

// PUT: Actualizar un tipo de producto
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const updated = await prisma.productType.update({ where: { id: params.id }, data })
  return NextResponse.json(updated)
}

// PATCH: Actualizar parcialmente un tipo de producto (por ejemplo, restaurar status)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const updated = await prisma.productType.update({ where: { id: params.id }, data })
  return NextResponse.json(updated)
}

// DELETE: Soft delete de un tipo de producto (status: 'deleted')
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.productType.update({ where: { id: params.id }, data: { status: 'deleted' } })
  return NextResponse.json({ ok: true })
}
