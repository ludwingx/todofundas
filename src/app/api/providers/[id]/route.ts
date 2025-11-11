import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PUT /api/providers/[id] -> full update
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const body = await req.json()
    const { name, contact, email, phone, address } = body
    const updated = await prisma.supplier.update({
      where: { id },
      data: { name, contact, email, phone, address },
    })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Error al actualizar proveedor' }, { status: 500 })
  }
}

// PATCH /api/providers/[id] -> partial update (e.g., status)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const body = await req.json()
    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = String(body.name)
    if (body.contact !== undefined) data.contact = body.contact ? String(body.contact) : null
    if (body.email !== undefined) data.email = body.email ? String(body.email) : null
    if (body.phone !== undefined) data.phone = body.phone ? String(body.phone) : null
    if (body.address !== undefined) data.address = body.address ? String(body.address) : null
    if (body.status !== undefined) data.status = String(body.status)

    const updated = await prisma.supplier.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Error al actualizar proveedor' }, { status: 500 })
  }
}

// DELETE /api/providers/[id] -> soft delete
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    await prisma.supplier.update({ where: { id }, data: { status: 'deleted' } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Error al eliminar proveedor' }, { status: 500 })
  }
}
