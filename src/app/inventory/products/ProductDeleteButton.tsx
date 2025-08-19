"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DeleteModal } from "@/components/ui/delete-modal"
import { Trash2 } from "lucide-react"

export default function ProductDeleteButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const onConfirm = async () => {
    startTransition(async () => {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error eliminando producto")
      router.refresh()
    })
  }

  return (
    <DeleteModal
      title="Eliminar producto"
      message={`¿Eliminar "${name}"?`}
      onConfirm={onConfirm}
      trigger={
        <Button variant="ghost" size="icon" className="group" title="Eliminar">
          <Trash2 className="h-4 w-4 text-slate-600 group-hover:text-red-600 transition-colors" />
        </Button>
      }
    />
  )
}
