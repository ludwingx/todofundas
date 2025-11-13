"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Palette, Sparkles } from "lucide-react"
import { getColorName } from "@/data/color-names"

interface ColorPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (color: { name: string; hexCode: string }) => void
  editColor?: { id: string; name: string; hexCode: string } | null
}

export function ColorPickerModal({
  open,
  onOpenChange,
  onSave,
  editColor,
}: ColorPickerModalProps) {
  const [name, setName] = useState("")
  const [hexCode, setHexCode] = useState("#000000")
  const [displayHex, setDisplayHex] = useState("#000000")
  const [isNaming, setIsNaming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (editColor) {
      setName(editColor.name)
      setHexCode(editColor.hexCode)
      setDisplayHex(editColor.hexCode)
    } else {
      setName("")
      setHexCode("#000000")
      setDisplayHex("#000000")
    }
    setError("")
  }, [editColor, open])

  const handleHexChange = async (value: string) => {
    if (!value.startsWith("#") && value !== '') {
      value = "#" + value
    }
    value = value.slice(0, 7)
    const upperValue = value.toUpperCase()
    setHexCode(upperValue)
    setDisplayHex(upperValue)
    
    // Si el campo de nombre está vacío o es un nombre generado previamente
    if (!name || name === 'Cargando...' || name === 'Color personalizado' || 
        (name && name.length < 3) || 
        (name && name.toLowerCase() === name)) {
      await suggestColorName(upperValue)
    }
  }

  const suggestColorName = async (hex: string) => {
    if (!hex || hex.length < 4) return
    
    setIsNaming(true)
    try {
      // Establecer un estado de carga temporal
      setName('Buscando...')
      const colorName = await getColorName(hex)
      // Siempre actualizar el nombre con la sugerencia, independientemente del valor actual
      setName(colorName)
    } catch (error) {
      console.error('Error al sugerir nombre de color:', error)
      // Si hay un error, restaurar el nombre anterior o establecer uno por defecto
      setName('Color personalizado')
    } finally {
      setIsNaming(false)
    }
  }

  const validateHex = (hex: string): boolean => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/
    return hexRegex.test(hex)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Por favor ingresa un nombre para el color")
      return
    }
    
    // Validate hex code
    if (!hexCode || !hexCode.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
      setError("Por favor ingresa un código de color hexadecimal válido")
      return
    }
    
    // Save the color
    onSave({
      name,
      hexCode: hexCode.toLowerCase()
    })
    
    // Reset form
    setName("")
    setHexCode("#000000")
    setDisplayHex("#000000")
    setError("")
    onOpenChange(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Palette className="h-5 w-5" />
            {editColor ? "Editar Color" : "Crear Nuevo Color"}
          </DialogTitle>
          <DialogDescription>
            Define el nombre y selecciona el color para guardarlo en el sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Nombre del Color */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nombre del Color *
            </Label>
              <div className="relative">
                <Input
                  id="name"
                  placeholder="Ej: Azul Marino, Rojo Vibrante..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-11 pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => suggestColorName(hexCode)}
                  disabled={isNaming}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  title="Sugerir nombre del color"
                >
                  {isNaming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </button>
              </div>
          </div>

          {/* Selector de Color */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              Seleccionar Color
            </Label>
            
            <div className="p-4 rounded-lg border bg-muted/50 space-y-4">
              {/* Selector de color integrado en el cuadro de vista previa */}
              <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <Label htmlFor="colorPicker" className="text-sm font-medium mb-3 block">
                    Haz clic en el color para seleccionar
                  </Label>
                  <div className="relative inline-block">
                    <input
                      id="colorPicker"
                      type="color"
                      value={hexCode}
                      onChange={(e) => setHexCode(e.target.value.toUpperCase())}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div 
                      className="w-32 h-32 rounded-lg border-4 border-white shadow-lg cursor-pointer transition-all hover:scale-105 hover:shadow-xl"
                      style={{ 
                        backgroundColor: hexCode
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Input hexadecimal */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hex">Código HEX</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="hex"
                    value={displayHex}
                    onChange={(e) => handleHexChange(e.target.value)}
                    placeholder="#RRGGBB"
                    className="font-mono"
                  />
                  <div 
                    className="w-8 h-8 rounded-md border"
                    style={{ 
                      backgroundColor: hexCode
                    }}
                    title={hexCode}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || !name.trim()}
            className="flex-1 sm:flex-none ml-2"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editColor ? "Actualizar Color" : "Crear Color"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}