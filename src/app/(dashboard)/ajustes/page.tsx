import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import { ProfileClient } from './ProfileClient'
import { prisma as db } from '@/lib/prisma'

export default async function AjustesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await db.user.findUnique({ where: { id: session.userId as string } })
  if (!user) redirect('/login')

  return <ProfileClient user={{ id: user.id, name: user.name, username: user.username, role: user.role }} />
}
