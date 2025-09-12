"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "./button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import { RotateCcw } from "lucide-react"

interface RestoreModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  confirmText?: string
  successText?: string
  errorText?: string
  onConfirm: () => Promise<void>
  children: React.ReactNode
}

export function RestoreModal({
  open,
  onOpenChange,
  title,
  message,
  confirmText = "Restaurar",
  successText = "Elemento restaurado correctamente",
  errorText = "Error al restaurar el elemento",
  onConfirm,
  children,
}: RestoreModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleConfirm = async () => {
    try {
      setIsLoading(true)
      await onConfirm()
      toast.success(successText)
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error(errorText)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
              <RotateCcw className="h-5 w-5" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            type="button"
          >
            Cancelar
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={isLoading}
            className="group bg-blue-600 hover:bg-blue-700 text-white hover:text-blue-100 transition hover:border-blue-600 hover:shadow-md hover:scale-105"
          >
            {isLoading ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4 animate-spin " />
                Restaurando...
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4 group-hover:animate-spin transition-transform" />
                {confirmText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
