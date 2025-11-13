import { Color } from '@prisma/client';

export async function getColors(): Promise<Color[]> {
  try {
    const response = await fetch('/api/colors');
    if (!response.ok) {
      throw new Error('Error al obtener los colores');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching colors:', error);
    return [];
  }
}
