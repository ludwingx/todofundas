"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function NewProviderClient({ onCreated }: { onCreated?: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ name: "", contact: "", email: "", phone: "", address: "" })

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
        const res = await fetch("/api/providers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error("Error al crear proveedor")
        toast.success(`Proveedor "${form.name}" creado`)
        onCreated?.()
        if (typeof window !== 'undefined') window.location.reload()
      } catch (e) {
        console.error(e)
        toast.error("No se pudo crear el proveedor")
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
          <Input name="contact" value={form.contact} onChange={handleChange} placeholder="Persona de contacto" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Email</label>
          <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Teléfono</label>
          <Input name="phone" value={form.phone} onChange={handleChange} placeholder="70000000" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-muted-foreground">Dirección</label>
          <Input name="address" value={form.address} onChange={handleChange} placeholder="Calle y número" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={onSubmit} disabled={isPending}>{isPending ? "Guardando..." : "Guardar"}</Button>
      </div>
    </div>
  )
}
