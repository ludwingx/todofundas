'use client'

import { useState } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { updateProfileAction } from '@/app/actions/users'

export function ProfileClient({ user }: { user: { id: string, name: string, username: string, role: string } }) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Profile data
  const [name, setName] = useState(user.name)

  // Password data
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const result = await updateProfileAction({ name })
    
    if (result.success) {
      toast({ title: "Perfil actualizado", description: "Tu nombre ha sido guardado correctamente." })
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    
    setIsSubmitting(false)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas nuevas no coinciden.", variant: "destructive" })
      return
    }

    if (newPassword.length < 6) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres.", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    
    const result = await updateProfileAction({ currentPassword, newPassword })
    
    if (result.success) {
      toast({ title: "Contraseña actualizada", description: "Tu contraseña ha sido cambiada correctamente." })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    
    setIsSubmitting(false)
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Market G/S</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Mi Perfil</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ajustes de Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu información personal y seguridad.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Datos del Perfil */}
          <Card>
            <form onSubmit={handleUpdateProfile}>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Actualiza tu nombre de usuario.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre de Usuario (Login)</Label>
                  <Input value={user.username} disabled className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground">El nombre de usuario no se puede cambiar.</p>
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Input value={user.role === 'admin' ? 'Administrador' : 'Vendedor/Usuario'} disabled className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre a Mostrar</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <Button type="submit" disabled={isSubmitting || name === user.name}>
                  Guardar Cambios
                </Button>
              </CardContent>
            </form>
          </Card>

          {/* Seguridad */}
          <Card>
            <form onSubmit={handleUpdatePassword}>
              <CardHeader>
                <CardTitle>Seguridad</CardTitle>
                <CardDescription>Cambia tu contraseña.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Contraseña Actual</Label>
                  <Input id="current" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new">Nueva Contraseña</Label>
                  <Input id="new" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar Nueva Contraseña</Label>
                  <Input id="confirm" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                </div>
                <Button type="submit" variant="destructive" disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}>
                  Actualizar Contraseña
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>
    </>
  )
}
