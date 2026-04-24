import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los colores
export async function GET() {
  try {
    const colors = await prisma.color.findMany({
      where: { status: 'active' },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(colors || []);
  } catch (error) {
    console.error('Error fetching colors from database:', error);
    return NextResponse.json(
      { error: 'Error al obtener los colores' },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo color
export async function POST(request: Request) {
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
    if (hexCode !== 'transparent' && !hexRegex.test(hexCode)) {
      return NextResponse.json(
        { error: 'Código hexadecimal inválido. Debe ser formato #RRGGBB o "transparent"' },
        { status: 400 }
      )
    }

    // Verificar si el color ya existe
    const existingColor = await prisma.color.findFirst({
      where: {
        OR: [
          { name: name },
          { hexCode: hexCode }
        ]
      }
    })

    if (existingColor) {
      return NextResponse.json(
        { error: 'Ya existe un color con ese nombre o código hexadecimal' },
        { status: 409 }
      )
    }

    const color = await prisma.color.create({
      data: {
        name,
        hexCode: hexCode.toUpperCase()
      }
    })

    return NextResponse.json(color, { status: 201 })
  } catch (error) {
    console.error('Error creating color:', error)
    return NextResponse.json(
      { error: 'Error al crear el color' },
      { status: 500 }
    )
  }
}
