'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { prisma } from '@/lib/prisma'
const key = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  // Validar campos
  if (!username || !password) {
    return { error: 'Username y contraseña son requeridos' }
  }

  try {
    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { 
        username: username,
        isActive: true 
      }
    })

    if (!user) {
      return { error: 'Usuario o contraseña incorrectos' }
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return { error: 'Usuario o contraseña incorrectos' }
    }

    // Actualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Crear JWT token
    const token = await new SignJWT({ 
      userId: user.id, 
      username: user.username,
      name: user.name,
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(key)

    // Guardar en cookie segura
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    const cookieStore = await cookies()
    cookieStore.set('session', token, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })

    return { success: true }
  } catch (error) {
    console.error('Error en login:', error)
    return { error: 'Error interno del servidor' }
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    return { success: true }
  } catch (error) {
    console.error('Logout error:', error)
    return { error: 'Error during logout' }
  }
}

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (!sessionCookie) {
      return null
    }

    const { payload } = await jwtVerify(sessionCookie.value, key)
    return payload
  } catch (error) {
    return null
  }
}

export async function createUserAction(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  if (!username || !password || !name) {
    return { error: 'Todos los campos son requeridos' }
  }
  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return { error: 'El usuario ya existe' }
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role: 'user'
      }
    })

    return { success: true, userId: user.id }
  } catch (error: any) {
    console.error('Error creando usuario:', error)
    // Si es un error de Prisma por restricción única
    if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
      return { error: 'El nombre de usuario ya está en uso' }
    }
    return { error: 'Error interno del servidor: ' + (error.message || error.toString()) }
  }
}
