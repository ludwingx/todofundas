"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type DeleteModalProps = {
  trigger: React.ReactNode
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => Promise<void> | void
  deleteUrl?: string
  method?: string
  refreshOnSuccess?: boolean
  successText?: string
  errorText?: string
  payload?: unknown
}

export function DeleteModal({
  trigger,
  title = "Eliminar",
  message,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  onConfirm,
  deleteUrl,
  method = 'DELETE',
  refreshOnSuccess = true,
  successText = 'Eliminado correctamente',
  errorText = 'No se pudo eliminar. Intenta nuevamente.',
  payload,
}: DeleteModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    try {
      setLoading(true)
      if (deleteUrl) {
        const init: RequestInit = { method }
        if (payload !== undefined) {
          init.headers = { 'Content-Type': 'application/json' }
          init.body = JSON.stringify(payload)
        }
        const res = await fetch(deleteUrl, init)
        if (!res.ok) throw new Error('Delete failed')
      } else if (onConfirm) {
        await onConfirm()
      }
      toast.success(successText)
      setOpen(false)
      if (refreshOnSuccess && typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (e) {
      console.error(e)
      toast.error(errorText)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && setOpen(v)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-sm p-3">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-sm">{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm">{message}</p>
        <DialogFooter className="pt-1">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant="destructive" size="sm" onClick={handleConfirm} disabled={loading}>
            {loading ? "Eliminando..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
