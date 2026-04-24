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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { ArrowLeft, Search, Plus, Minus, ShoppingCart, Trash2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { createSaleAction } from '@/app/actions/sales'

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
  id: string // unique id for cart item to handle same product twice (normal and damaged)
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  type: string
  isDamagedStock: boolean
}

export function NewSaleClient({ availableProducts }: { availableProducts: Product[] }) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        toast({ title: "Stock insuficiente", variant: "destructive" })
      }
    } else {
      const unitPrice = isDamaged ? (product.priceRetail * 0.5) : product.priceRetail // Default suggestion: 50% for damaged
      setCart([...cart, {
        id: `${product.id}-${isDamaged ? 'damaged' : 'normal'}`,
        productId: product.id,
        product,
        quantity: 1,
        unitPrice: unitPrice,
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
        // If damaged, we keep the customized unit price or reset? 
        // Let's reset to defaults based on type, user can override.
        const price = item.isDamagedStock ? (newPrice * 0.5) : newPrice
        return { ...item, type, unitPrice: price }
      }
      return item
    }))
  }

  const removeCartItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const subtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0)

  const handleProcessSale = async () => {
    if (cart.length === 0) return
    setIsSubmitting(true)
    
    try {
      const items = cart.map(c => ({
        productId: c.productId,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        originalPrice: c.type === 'mayorista' ? c.product.priceWholesale : c.product.priceRetail,
        discountApplied: (c.type === 'mayorista' ? c.product.priceWholesale : c.product.priceRetail) - c.unitPrice,
        type: c.type,
        isDamagedStock: c.isDamagedStock
      }))

      const result = await createSaleAction({
        customerName,
        customerPhone,
        paymentMethod,
        items
      })

      if (result.success) {
        toast({ title: "Venta procesada exitosamente" })
        router.push('/ventas')
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
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
                  {filteredProducts.map((product) => (
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
                          {product.stock > 0 && (
                            <Button size="sm" variant="default" onClick={() => addToCart(product, false)}>
                              <Plus className="mr-1 h-3 w-3" /> Sano ({product.stock})
                            </Button>
                          )}
                          {product.stockDamaged > 0 && (
                            <Button size="sm" variant="destructive" onClick={() => addToCart(product, true)}>
                              <AlertTriangle className="mr-1 h-3 w-3" /> Dañado ({product.stockDamaged})
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
                              value={item.unitPrice} 
                              onChange={(e) => updateCartItemPrice(item.id, parseFloat(e.target.value) || 0)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">Bs. {(item.unitPrice * item.quantity).toFixed(2)}</TableCell>
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

            {/* Info Cliente & Pago */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm">Cliente (Opcional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                  <Input
                    placeholder="Nombre del cliente"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Input
                    placeholder="Teléfono"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="h-8 text-sm"
                  />
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

                  <div className="pt-2 border-t mt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>Bs. {subtotal.toFixed(2)}</span>
                  </div>

                  <Button 
                    className="w-full mt-2" 
                    size="sm" 
                    onClick={handleProcessSale}
                    disabled={cart.length === 0 || isSubmitting}
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
