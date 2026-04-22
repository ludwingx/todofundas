import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import { UsersClient } from './UsersClient'
import { getUsersAction } from '@/app/actions/users'

export default async function UsuariosPage() {
  const session = await getSession()
  
  if (!session || session.role !== 'admin') {
    redirect('/dashboard') // Only admins can access this page
  }

  const { success, users } = await getUsersAction()

  if (!success) {
    return <div className="p-4 text-destructive">Error al cargar usuarios.</div>
  }

  return <UsersClient initialUsers={users as any[]} />
}
