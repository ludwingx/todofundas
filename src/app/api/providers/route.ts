import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/providers -> list active suppliers
export async function GET() {
  try {
    const providers = await prisma.supplier.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(providers)
  } catch (e) {
    return NextResponse.json({ error: 'Error al listar proveedores' }, { status: 500 })
  }
}

// POST /api/providers -> create supplier
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, contact, email, phone, address } = body
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 })
    }
    const created = await prisma.supplier.create({
      data: { name, contact, email, phone, address },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Error al crear proveedor' }, { status: 500 })
  }
}
