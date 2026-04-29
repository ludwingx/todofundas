'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft, Search, Plus, Minus, ShoppingCart, Trash2,
  AlertTriangle, ChevronsUpDown, UserPlus, Check, User
} from "lucide-react"
import Link from "next/link"
import { toast } from 'sonner'
import { createSaleAction } from '@/app/actions/sales'
import { createClientAction } from '@/app/actions/clients'

type Client = {
  id: string
  name: string
  phone: string | null
  email: string | null
}

type Product = {
  id: string
  name: string
  model: string
  color: string
  stock: number
  stockDamaged: number
  priceRetail: number
  priceWholesale: number
  imageUrl: string | null
}

type CartItem = {
  id: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  type: string
  isDamagedStock: boolean
}

export function NewSaleClient({
  availableProducts,
  clients: initialClients
}: {
  availableProducts: Product[]
  clients: Client[]
}) {
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])

  // Cliente
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [clientOpen, setClientOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [isCreatingClient, setIsCreatingClient] = useState(false)

  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [notes, setNotes] = useState('')
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent')
  const [discountValue, setDiscountValue] = useState<number | ''>(0)

  const filteredProducts = useMemo(() => {
    return availableProducts.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.model.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [availableProducts, searchTerm])

  const addToCart = (product: Product, isDamaged: boolean) => {
    const existingIndex = cart.findIndex(item => item.productId === product.id && item.isDamagedStock === isDamaged)

    if (existingIndex >= 0) {
      const newCart = [...cart]
      const item = newCart[existingIndex]
      const maxStock = isDamaged ? product.stockDamaged : product.stock

      if (item.quantity < maxStock) {
        item.quantity += 1
        setCart(newCart)
      } else {
        toast.error('Stock insuficiente')
      }
    } else {
      const unitPrice = isDamaged ? (product.priceRetail * 0.5) : product.priceRetail
      setCart([...cart, {
        id: `${product.id}-${isDamaged ? 'damaged' : 'normal'}`,
        productId: product.id,
        product,
        quantity: 1,
        unitPrice: unitPrice ?? 0,
        type: 'minorista',
        isDamagedStock: isDamaged
      }])
    }
  }

  const updateCartItemQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const maxStock = item.isDamagedStock ? item.product.stockDamaged : item.product.stock
        const newQuantity = Math.max(1, Math.min(maxStock, item.quantity + delta))
        return { ...item, quantity: newQuantity }
      }
      return item
    }))
  }

  const updateCartItemPrice = (id: string, newPrice: number) => {
    setCart(cart.map(item => item.id === id ? { ...item, unitPrice: newPrice } : item))
  }

  const updateCartItemType = (id: string, type: string) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newPrice = type === 'mayorista' ? item.product.priceWholesale : item.product.priceRetail
        const price = item.isDamagedStock ? (newPrice * 0.5) : newPrice
        return { ...item, type, unitPrice: price ?? 0 }
      }
      return item
    }))
  }

  const removeCartItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const subtotal = cart.reduce((acc, item) => acc + ((item.unitPrice ?? 0) * item.quantity), 0)

  const discountAmount = useMemo(() => {
    const val = typeof discountValue === 'number' ? discountValue : 0
    if (discountType === 'percent') {
      return subtotal * (val / 100)
    }
    return val
  }, [subtotal, discountType, discountValue])

  const total = subtotal - discountAmount

  const handleCreateClient = async () => {
    if (!newClientName.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    setIsCreatingClient(true)
    const result = await createClientAction({ name: newClientName, phone: newClientPhone })
    if (result.success && result.client) {
      const nc = result.client as Client
      setClients(prev => [...prev, nc].sort((a, b) => a.name.localeCompare(b.name)))
      setSelectedClient(nc)
      toast.success(`Cliente "${nc.name}" creado`)
      setShowNewClientForm(false)
      setNewClientName('')
      setNewClientPhone('')
      setClientOpen(false)
    } else {
      toast.error(result.error || 'Error al crear cliente')
    }
    setIsCreatingClient(false)
  }

  const handleProcessSale = async () => {
    if (cart.length === 0) return
    setIsSubmitting(true)

    const loadingToast = toast.loading('Registrando venta...', {
      description: `${cart.length} producto${cart.length > 1 ? 's' : ''} en el carrito`
    })

    try {
      const items = cart.map(c => ({
        productId: c.productId,
        quantity: c.quantity,
        unitPrice: c.unitPrice ?? 0,
        originalPrice: c.type === 'mayorista' ? c.product.priceWholesale : c.product.priceRetail,
        discountApplied: (c.type === 'mayorista' ? c.product.priceWholesale : c.product.priceRetail) - (c.unitPrice ?? 0),
        type: c.type,
        isDamagedStock: c.isDamagedStock
      }))

      const result = await createSaleAction({
        customerName: selectedClient?.name || undefined,
        customerPhone: selectedClient?.phone || undefined,
        clientId: selectedClient?.id,
        paymentMethod,
        notes: notes.trim() || undefined,
        globalDiscountAmount: discountAmount > 0 ? discountAmount : undefined,
        globalDiscountPercentage: (discountAmount > 0 && discountType === 'percent' && typeof discountValue === 'number') ? discountValue : undefined,
        items
      })

      toast.dismiss(loadingToast)

      if (result.success) {
        toast.success('¡Venta registrada!', {
          description: `Total: Bs. ${result.totalAmount?.toFixed(2)} — ${cart.length} producto${cart.length > 1 ? 's' : ''}`
        })
        router.push('/ventas')
      } else {
        toast.error('Error al procesar', { description: result.error })
      }
    } catch (e: any) {
      toast.dismiss(loadingToast)
      toast.error('Error inesperado', { description: e.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Market GS</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/ventas">Ventas</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Nueva Venta</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nueva Venta</h1>
            <p className="text-muted-foreground">Punto de Venta Market GS</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/ventas">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Productos */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Catálogo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o modelo..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {filteredProducts.map((product) => {
                    const cartQuantityNormal = cart.filter(c => c.productId === product.id && !c.isDamagedStock).reduce((acc, c) => acc + c.quantity, 0)
                    const cartQuantityDamaged = cart.filter(c => c.productId === product.id && c.isDamagedStock).reduce((acc, c) => acc + c.quantity, 0)
                    
                    const availableNormal = product.stock - cartQuantityNormal
                    const availableDamaged = product.stockDamaged - cartQuantityDamaged

                    return (
                      <div key={product.id} className="flex flex-col p-3 border rounded-lg hover:bg-muted/50 gap-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{product.name}</h4>
                              <Badge variant="outline">{product.color}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{product.model}</p>
                          </div>
                          <div className="text-right text-sm">
                            <div><span className="font-semibold">Bs. {product.priceRetail}</span> min</div>
                            <div className="text-muted-foreground">Bs. {product.priceWholesale} may</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t">
                          <div className="flex gap-2">
                            {availableNormal > 0 && (
                              <Button size="sm" variant="default" onClick={() => addToCart(product, false)}>
                                <Plus className="mr-1 h-3 w-3" /> Normal ({availableNormal})
                              </Button>
                            )}
                            {availableDamaged > 0 && (
                              <Button size="sm" variant="destructive" onClick={() => addToCart(product, true)}>
                                <AlertTriangle className="mr-1 h-3 w-3" /> Dañado ({availableDamaged})
                              </Button>
                            )}
                            {availableNormal <= 0 && availableDamaged <= 0 && (
                              <span className="text-xs text-muted-foreground italic py-1">Sin stock</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {filteredProducts.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No se encontraron productos.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Carrito */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrito de Venta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Cant.</TableHead>
                        <TableHead>Precio U.</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.id} className={item.isDamagedStock ? 'bg-destructive/10' : ''}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{item.product.name}</p>
                              {item.isDamagedStock && <Badge variant="destructive" className="text-[10px] mt-1">Dañado</Badge>}
                              <Select value={item.type} onValueChange={(val) => updateCartItemType(item.id, val)}>
                                <SelectTrigger className="h-7 mt-1 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="minorista">Minorista</SelectItem>
                                  <SelectItem value="mayorista">Mayorista</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateCartItemQuantity(item.id, -1)}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm">{item.quantity}</span>
                              <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateCartItemQuantity(item.id, 1)}>
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-20 h-8 text-sm"
                              value={item.unitPrice ?? 0}
                              onChange={(e) => updateCartItemPrice(item.id, parseFloat(e.target.value) || 0)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">Bs. {((item.unitPrice ?? 0) * item.quantity).toFixed(2)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeCartItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {cart.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            El carrito está vacío
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Cliente & Pago */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                  {/* Combobox de búsqueda de cliente */}
                  <Popover open={clientOpen} onOpenChange={setClientOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between h-8 text-sm font-normal"
                      >
                        {selectedClient
                          ? <span className="truncate">{selectedClient.name}</span>
                          : <span className="text-muted-foreground">Buscar cliente...</span>
                        }
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar por nombre..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="consumidor-final"
                              onSelect={() => {
                                setSelectedClient(null)
                                setClientOpen(false)
                                setShowNewClientForm(false)
                              }}
                            >
                              <Check className={`mr-2 h-4 w-4 ${!selectedClient ? 'opacity-100' : 'opacity-0'}`} />
                              Consumidor Final
                            </CommandItem>
                            {clients.map(client => (
                              <CommandItem
                                key={client.id}
                                value={client.name}
                                onSelect={() => {
                                  setSelectedClient(client)
                                  setClientOpen(false)
                                  setShowNewClientForm(false)
                                }}
                              >
                                <Check className={`mr-2 h-4 w-4 ${selectedClient?.id === client.id ? 'opacity-100' : 'opacity-0'}`} />
                                <div>
                                  <p className="text-sm font-medium">{client.name}</p>
                                  {client.phone && <p className="text-xs text-muted-foreground">{client.phone}</p>}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => {
                                setShowNewClientForm(true)
                                setClientOpen(false)
                              }}
                              className="text-blue-600"
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Crear nuevo cliente
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Formulario de creación rápida */}
                  {showNewClientForm && (
                    <div className="border rounded-lg p-3 space-y-2 bg-blue-50 dark:bg-blue-950/20">
                      <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Nuevo Cliente</p>
                      <Input
                        placeholder="Nombre *"
                        value={newClientName}
                        onChange={e => setNewClientName(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Input
                        placeholder="Teléfono"
                        value={newClientPhone}
                        onChange={e => setNewClientPhone(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 h-7 text-xs" onClick={handleCreateClient} disabled={isCreatingClient}>
                          {isCreatingClient ? 'Guardando...' : 'Guardar'}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowNewClientForm(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedClient && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Check className="h-3 w-3 text-green-500" />
                      {selectedClient.phone || 'Sin teléfono'}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm">Pago y Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="transferencia">Transferencia (QR)</SelectItem>
                    </SelectContent>
                  </Select>

                  <Textarea
                    placeholder="Notas generales de la venta (opcional)"
                    className="min-h-[60px] text-sm resize-none"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />

                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Descuento Global</p>
                    <div className="flex gap-2">
                      <Select value={discountType} onValueChange={(val: 'percent' | 'fixed') => setDiscountType(val)}>
                        <SelectTrigger className="w-[80px] h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">%</SelectItem>
                          <SelectItem value="fixed">Bs</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="0"
                        className="h-8 text-sm"
                        min="0"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t mt-2 flex flex-col gap-1">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal:</span>
                      <span>Bs. {subtotal.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-red-500 font-medium">
                        <span>Descuento:</span>
                        <span>- Bs. {discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-1">
                      <span>Total a Pagar:</span>
                      <span>Bs. {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-2"
                    size="sm"
                    onClick={handleProcessSale}
                    disabled={cart.length === 0 || isSubmitting || total < 0}
                  >
                    {isSubmitting ? 'Procesando...' : 'Procesar Venta'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
