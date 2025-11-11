import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Types
interface User {
  id: string
  username: string
  name: string
}

interface SessionData extends JWTPayload {
  user: User
  expires: Date | string
}

const key = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export async function encrypt(payload: SessionData): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key)
}

export async function decrypt(input: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    })
    return payload as SessionData
  } catch (error) {
    console.error('Failed to verify token:', error)
    return null
  }
}

export async function login(formData: FormData): Promise<Response> {
  try {
    // In a real app, verify credentials & get the user from your database
    const user: User = { 
      id: '1', 
      username: 'admin', 
      name: 'Admin User' 
    }

    // Create the session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    const session = await encrypt({ user, expires })

    // Create response and set cookie
    const response = new NextResponse(
      JSON.stringify({ 
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name
        }
      }), 
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    // Set the session cookie
    response.cookies.set({
      name: 'session',
      value: session,
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return new NextResponse(
      JSON.stringify({ 
        success: false,
        error: 'Failed to process login' 
      }),
      { status: 500 }
    )
  }
}

export async function logout(): Promise<Response> {
  const response = new NextResponse()
  response.cookies.set({
    name: 'session',
    value: '',
    expires: new Date(0),
    path: '/',
  })
  return response
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = cookies()
    // Use a type assertion to handle the cookies
    const session = (cookieStore as unknown as { get: (name: string) => { value: string } | undefined })
      .get('session')?.value
    
    if (!session) return null
    
    const result = await decrypt(session)
    return result
  } catch (error) {
    console.error('Failed to get session:', error)
    return null
  }
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next()
  
  // Safely get the session cookie
  const session = (() => {
    try {
      return request.cookies.get('session')?.value
    } catch (error) {
      console.error('Error getting session cookie:', error)
      return null
    }
  })()
  
  if (!session) return response

  try {
    // Refresh the session so it doesn't expire
    const parsed = await decrypt(session)
    if (!parsed) return response

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const newSession = await encrypt({ ...parsed, expires })
    
    // Set the new session cookie
    response.cookies.set({
      name: 'session',
      value: newSession,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires,
    })
  } catch (error) {
    console.error('Failed to update session:', error)
  }
  
  return response
}
