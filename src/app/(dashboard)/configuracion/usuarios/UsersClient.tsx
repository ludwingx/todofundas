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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Edit2, 
  ShieldAlert, 
  ShieldCheck, 
  MoreHorizontal, 
  User as UserIcon, 
  LogIn, 
  Calendar, 
  Mail,
  Users
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createUserActionAdmin, updateUserAction } from '@/app/actions/users'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type User = {
  id: string
  name: string
  username: string
  role: string
  isActive: boolean
  lastLoginAt: Date | null
  createdAt: Date
}

export function UsersClient({ initialUsers }: { initialUsers: User[] }) {
  const { toast } = useToast()
  const [users, setUsers] = useState(initialUsers)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // New User Form State
  const [newName, setNewName] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('user')

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const result = await createUserActionAdmin({
      name: newName,
      username: newUsername,
      password: newPassword,
      role: newRole
    })

    if (result.success) {
      toast({ title: "Usuario creado exitosamente" })
      setIsAddOpen(false)
      window.location.reload()
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setIsSubmitting(false)
  }

  const handleToggleActive = async (user: User) => {
    const result = await updateUserAction(user.id, { isActive: !user.isActive })
    if (result.success) {
      setUsers(users.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u))
      toast({ title: `Usuario ${!user.isActive ? 'activado' : 'desactivado'}` })
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default" className="bg-blue-600 dark:bg-blue-700 shadow-sm"><ShieldCheck className="w-3 h-3 mr-1"/> Admin</Badge>
      case 'admin2':
        return <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800"><ShieldCheck className="w-3 h-3 mr-1"/> Admin Master</Badge>
      default:
        return <Badge variant="outline" className="text-muted-foreground"><UserIcon className="w-3 h-3 mr-1"/> Vendedor</Badge>
    }
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Market GS</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Usuarios</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Personal</h1>
            <p className="text-muted-foreground text-sm">Control de accesos, roles y permisos del sistema.</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-md">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Crear Usuario</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input id="name" placeholder="Ej: Juan Pérez" value={newName} onChange={e => setNewName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario de Acceso</Label>
                  <Input id="username" placeholder="juan.perez" value={newUsername} onChange={e => setNewUsername(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                </div>
                <div className="space-y-2">
                  <Label>Rol en el Sistema</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Vendedor / Usuario</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="admin2">Administrador Master</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                  {isSubmitting ? 'Procesando...' : 'Registrar Usuario'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Usuarios</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-full">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuarios Activos</p>
                <p className="text-2xl font-bold">{users.filter(u => u.isActive).length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-full">
                <LogIn className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conexiones Hoy</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[300px]">Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead>Último Acceso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border shadow-sm">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{user.name}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {user.username}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "success" : "destructive"}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse ${user.isActive ? 'bg-white' : 'bg-white'}`} />
                      {user.isActive ? 'Activo' : 'Baja'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {user.lastLoginAt ? (
                      <div className="flex flex-col">
                        <span>{new Date(user.lastLoginAt).toLocaleDateString()}</span>
                        <span className="opacity-70">{new Date(user.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ) : (
                      <span className="italic opacity-50">Sin accesos</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-3">
                      <div className="flex flex-col items-end gap-0.5 mr-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none">
                          {user.isActive ? 'Desactivar' : 'Reactivar'}
                        </span>
                        <Switch 
                          id={`active-${user.id}`} 
                          checked={user.isActive} 
                          onCheckedChange={() => handleToggleActive(user)} 
                          disabled={(user.role === 'admin' || user.role === 'admin2') && users.filter(u => (u.role === 'admin' || u.role === 'admin2') && u.isActive).length === 1}
                          className="data-[state=checked]:bg-emerald-500 scale-75"
                        />
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit2 className="mr-2 h-4 w-4" /> Editar Perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-destructive">
                            <ShieldAlert className="mr-2 h-4 w-4" /> Restablecer Contraseña
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}
