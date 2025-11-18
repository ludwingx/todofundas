import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: Listar todos los movimientos
export async function GET() {
  const movements = await prisma.inventoryMovement.findMany({
    orderBy: { createdAt: 'desc' },
    include: { product: true, user: true }
  })
  return NextResponse.json(movements)
}

// POST: Crear un nuevo movimiento
export async function POST(req: Request) {
  const data = await req.json()
  const created = await prisma.inventoryMovement.create({ data })
  return NextResponse.json(created)
}
