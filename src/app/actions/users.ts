'use server'

import { prisma as db } from '@/lib/prisma'
import { getSession } from './auth'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { createNotificationAction, notifyAdminsAction } from './notifications'

export async function getUsersAction() {
  const session = await getSession()
  const isAdmin = session?.role === 'admin' || session?.role === 'admin2'
  if (!session || !isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, users }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateUserAction(id: string, data: { name?: string, role?: string, isActive?: boolean, password?: string }) {
  const session = await getSession()
  const isAdmin = session?.role === 'admin' || session?.role === 'admin2'
  if (!session || !isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  try {
    const updateData: any = { ...data }
    
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12)
    } else {
      delete updateData.password
    }

    await db.user.update({
      where: { id },
      data: updateData
    })

    revalidatePath('/(dashboard)/configuracion/usuarios')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createUserActionAdmin(data: { name: string, username: string, role: string, password: string }) {
  const session = await getSession()
  const isAdmin = session?.role === 'admin' || session?.role === 'admin2'
  if (!session || !isAdmin) {
    return { success: false, error: 'No autorizado' }
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { username: data.username }
    })

    if (existingUser) {
      return { success: false, error: 'El nombre de usuario ya existe' }
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const newUser = await db.user.create({
      data: {
        name: data.name,
        username: data.username,
        password: hashedPassword,
        role: data.role,
        isActive: true
      }
    })

    // Notificar al nuevo usuario
    const roleLabel = data.role === 'admin' || data.role === 'admin2' ? 'Administrador' : 'Vendedor'
    await createNotificationAction({
      userId: newUser.id,
      title: '¡Bienvenido a Market GS!',
      message: `Tu cuenta ha sido creada con el rol de ${roleLabel}. Inicia sesión con tu usuario: ${data.username}`,
      type: 'success'
    })

    // Notificar a los admins
    await notifyAdminsAction(
      'Nuevo usuario creado',
      `${data.name} (${data.username}) fue registrado como ${roleLabel}`,
      'info'
    )

    revalidatePath('/(dashboard)/configuracion/usuarios')
    return { success: true }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido'
    return { success: false, error: msg }
  }
}

export async function updateProfileAction(data: { name?: string, currentPassword?: string, newPassword?: string }) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'No autorizado' }
  }

  try {
    const user = await db.user.findUnique({ where: { id: session.userId as string } })
    if (!user) return { success: false, error: 'Usuario no encontrado' }

    const updateData: any = {}
    
    if (data.name) {
      updateData.name = data.name
    }

    if (data.newPassword && data.currentPassword) {
      const isValidPassword = await bcrypt.compare(data.currentPassword, user.password)
      if (!isValidPassword) {
        return { success: false, error: 'Contraseña actual incorrecta' }
      }
      updateData.password = await bcrypt.hash(data.newPassword, 12)
    } else if (data.newPassword && !data.currentPassword) {
       return { success: false, error: 'Contraseña actual es requerida para cambiar contraseña' }
    }

    if (Object.keys(updateData).length > 0) {
      await db.user.update({
        where: { id: user.id },
        data: updateData
      })
    }

    revalidatePath('/(dashboard)/ajustes')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function completeTutorialAction() {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'No autorizado' }
  }

  try {
    await db.user.update({
      where: { id: session.userId as string },
      data: { hasCompletedTutorial: true }
    })

    revalidatePath('/(dashboard)/guia')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
