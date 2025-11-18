import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: Listar todos los tipos de producto
export async function GET() {
  const types = await prisma.productType.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(types)
}

// POST: Crear un nuevo tipo de producto
export async function POST(req: Request) {
  const data = await req.json()
  const created = await prisma.productType.create({ data })
  return NextResponse.json(created)
}
