'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { RestoreModal } from "@/components/ui/restore-modal"

interface RestoreProviderButtonProps {
  id: string
  name: string
  onRestore: (id: string) => Promise<void>
}

export function RestoreProviderButton({ id, name, onRestore }: RestoreProviderButtonProps) {
  const [isPending, setIsPending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleRestore = async () => {
    try {
      setIsPending(true)
      await onRestore(id)
      setIsOpen(false)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <Button 
        size="sm"
        className="group bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 hover:text-white"
        variant="outline"
        title="Volver a activar proveedor"
        disabled={isPending}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(true)
        }}
      >
        <RotateCcw className={`h-4 w-4 ${isPending ? 'animate-spin' : 'group-hover:animate-spin'} transition`} /> 
        <span className="hidden sm:inline">
          {isPending ? 'Restaurando...' : 'Restaurar'}
        </span>
      </Button>
      <RestoreModal
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Restaurar proveedor"
        message={`¿Estás seguro de que deseas restaurar a "${name}"?`}
        confirmText="Sí, restaurar"
        successText={`Proveedor "${name}" restaurado correctamente`}
        errorText="No se pudo restaurar el proveedor"
        onConfirm={handleRestore}
      >
        <div />
      </RestoreModal>
    </>
  )
}
