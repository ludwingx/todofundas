import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Temporary mock data for colors
const MOCK_COLORS = [
  { id: '1', name: 'Rojo', hexCode: '#FF0000', status: 'active' },
  { id: '2', name: 'Azul', hexCode: '#0000FF', status: 'active' },
  { id: '3', name: 'Verde', hexCode: '#00FF00', status: 'active' },
  { id: '4', name: 'Amarillo', hexCode: '#FFFF00', status: 'active' },
  { id: '5', name: 'Negro', hexCode: '#000000', status: 'active' },
  { id: '6', name: 'Blanco', hexCode: '#FFFFFF', status: 'active' },
];

// GET - Obtener todos los colores
export async function GET() {
  try {
    // Try to get colors from the database
    try {
      // @ts-ignore - Ignorar error de tipo temporalmente
      const colors = await prisma.color?.findMany({
        where: { status: 'active' },
        orderBy: { name: 'asc' }
      });
      
      if (colors) {
        return NextResponse.json(colors);
      }
    } catch (dbError) {
      console.warn('Could not fetch colors from database, using mock data:', dbError);
    }
    
    // If database query fails, return mock data
    return NextResponse.json(MOCK_COLORS);
    
  } catch (error) {
    console.error('Error in colors API:', error);
    // Return mock data as fallback even if there's an error
    return NextResponse.json(MOCK_COLORS);
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
    if (!hexRegex.test(hexCode)) {
      return NextResponse.json(
        { error: 'Código hexadecimal inválido. Debe ser formato #RRGGBB' },
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
