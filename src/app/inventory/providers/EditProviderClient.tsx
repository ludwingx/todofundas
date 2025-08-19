"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type Provider = {
  id: string
  name: string
  contact?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
}

export default function EditProviderClient({ provider, onUpdated }: { provider: Provider; onUpdated?: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<Provider>({ ...provider })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onSubmit = () => {
    startTransition(async () => {
      try {
        if (!form.name.trim()) {
          toast.error("El nombre es requerido")
          return
        }
        const res = await fetch(`/api/providers/${provider.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            contact: form.contact || null,
            email: form.email || null,
            phone: form.phone || null,
            address: form.address || null,
          }),
        })
        if (!res.ok) throw new Error("Error al actualizar")
        toast.success(`Proveedor "${form.name}" actualizado`)
        onUpdated?.()
        if (typeof window !== 'undefined') window.location.reload()
      } catch (e) {
        console.error(e)
        toast.error("No se pudo actualizar el proveedor")
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Nombre</label>
          <Input name="name" value={form.name} onChange={handleChange} placeholder="Nombre del proveedor" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Contacto</label>
          <Input name="contact" value={form.contact || ''} onChange={handleChange} placeholder="Persona de contacto" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Email</label>
          <Input name="email" type="email" value={form.email || ''} onChange={handleChange} placeholder="correo@ejemplo.com" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Teléfono</label>
          <Input name="phone" value={form.phone || ''} onChange={handleChange} placeholder="70000000" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-muted-foreground">Dirección</label>
          <Input name="address" value={form.address || ''} onChange={handleChange} placeholder="Calle y número" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={onSubmit} disabled={isPending}>{isPending ? "Guardando..." : "Guardar cambios"}</Button>
      </div>
    </div>
  )
}
