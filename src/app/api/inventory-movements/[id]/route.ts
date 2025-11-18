import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: Obtener un movimiento por ID
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const movement = await prisma.inventoryMovement.findUnique({
    where: { id: params.id },
    include: { product: true, user: true }
  })
  if (!movement) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(movement)
}

// PUT: Actualizar un movimiento
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const updated = await prisma.inventoryMovement.update({ where: { id: params.id }, data })
  return NextResponse.json(updated)
}

// DELETE: Eliminar un movimiento
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.inventoryMovement.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
