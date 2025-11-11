import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener un color por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const color = await prisma.color.findUnique({
      where: { id: params.id }
    })

    if (!color) {
      return NextResponse.json(
        { error: 'Color no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(color)
  } catch (error) {
    console.error('Error fetching color:', error)
    return NextResponse.json(
      { error: 'Error al obtener el color' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un color
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, hexCode } = body

    if (!name || !hexCode) {
      return NextResponse.json(
        { error: 'Nombre y código hexadecimal son requeridos' },
        { status: 400 }
      )
    }

    // Validar formato hexadecimal
    const hexRegex = /^#[0-9A-Fa-f]{6}$/
    if (!hexRegex.test(hexCode)) {
      return NextResponse.json(
        { error: 'Código hexadecimal inválido. Debe ser formato #RRGGBB' },
        { status: 400 }
      )
    }

    // Verificar si el color existe
    const existingColor = await prisma.color.findUnique({
      where: { id: params.id }
    })

    if (!existingColor) {
      return NextResponse.json(
        { error: 'Color no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si otro color ya tiene ese nombre o código
    const duplicateColor = await prisma.color.findFirst({
      where: {
        AND: [
          { id: { not: params.id } },
          {
            OR: [
              { name: name },
              { hexCode: hexCode }
            ]
          }
        ]
      }
    })

    if (duplicateColor) {
      return NextResponse.json(
        { error: 'Ya existe otro color con ese nombre o código hexadecimal' },
        { status: 409 }
      )
    }

    const color = await prisma.color.update({
      where: { id: params.id },
      data: {
        name,
        hexCode: hexCode.toUpperCase()
      }
    })

    return NextResponse.json(color)
  } catch (error) {
    console.error('Error updating color:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el color' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un color (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const color = await prisma.color.findUnique({
      where: { id: params.id }
    })

    if (!color) {
      return NextResponse.json(
        { error: 'Color no encontrado' },
        { status: 404 }
      )
    }

    // Soft delete
    await prisma.color.update({
      where: { id: params.id },
      data: { status: 'deleted' }
    })

    return NextResponse.json({ message: 'Color eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting color:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el color' },
      { status: 500 }
    )
  }
}
