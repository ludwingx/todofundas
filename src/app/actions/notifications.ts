'use server'

import { prisma as db } from '@/lib/prisma'
import { getSession } from './auth'
import { revalidatePath } from 'next/cache'

export async function getNotificationsAction() {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autorizado' }

  try {
    const notifications = await db.notification.findMany({
      where: { userId: session.userId as string },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
    const unreadCount = await db.notification.count({
      where: { userId: session.userId as string, isRead: false }
    })
    return { success: true, notifications, unreadCount }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

export async function markNotificationReadAction(id: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autorizado' }

  try {
    await db.notification.update({
      where: { id, userId: session.userId as string },
      data: { isRead: true }
    })
    revalidatePath('/')
    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

export async function markAllNotificationsReadAction() {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autorizado' }

  try {
    await db.notification.updateMany({
      where: { userId: session.userId as string, isRead: false },
      data: { isRead: true }
    })
    revalidatePath('/')
    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

// Helper para crear notificaciones desde cualquier módulo del sistema
export async function createNotificationAction(data: {
  userId: string
  title: string
  message: string
  type?: string // 'info' | 'warning' | 'success' | 'error'
}) {
  try {
    await db.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'info'
      }
    })
    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

// Notificar a todos los admins
export async function notifyAdminsAction(title: string, message: string, type: string = 'info') {
  try {
    const admins = await db.user.findMany({ where: { role: 'admin', isActive: true }, select: { id: true } })
    await db.notification.createMany({
      data: admins.map(admin => ({
        userId: admin.id,
        title,
        message,
        type
      }))
    })
    return { success: true }
  } catch (error: unknown) {
    const message2 = error instanceof Error ? error.message : 'Error desconocido'
    return { success: false, error: message2 }
  }
}
