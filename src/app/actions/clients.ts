'use server'

import { prisma as db } from '@/lib/prisma'
import { getSession } from './auth'
import { revalidatePath } from 'next/cache'

export async function getClientsAction() {
  const session = await getSession()
  if (!session) return []

  return db.client.findMany({
    select: { id: true, name: true, phone: true, email: true },
    orderBy: { name: 'asc' }
  })
}

export async function createClientAction(data: { name: string; phone?: string; email?: string }) {
  const session = await getSession()
  if (!session) return { error: 'No autorizado' }

  if (!data.name.trim()) return { error: 'El nombre es requerido' }

  try {
    const client = await db.client.create({
      data: {
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
      }
    })
    revalidatePath('/ventas/nueva')
    return { success: true, client }
  } catch (error: any) {
    return { error: 'Error al crear el cliente' }
  }
}
