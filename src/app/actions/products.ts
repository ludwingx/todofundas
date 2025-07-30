'use server'

import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProduct(prevState: any, formData: FormData) {
  try {
    const name = formData.get('name') as string
    const model = formData.get('model') as string
    const color = formData.get('color') as string
    const stock = parseInt(formData.get('stock') as string)
    const minStock = parseInt(formData.get('minStock') as string) || 5
    const priceRetail = parseFloat(formData.get('priceRetail') as string)
    const priceWholesale = parseFloat(formData.get('priceWholesale') as string)
    const costPrice = parseFloat(formData.get('costPrice') as string)
    const warehouseId = formData.get('warehouseId') as string
    const typeId = formData.get('typeId') as string
    const supplierId = formData.get('supplierId') as string || null
    const imageFile = formData.get('image') as File

    // Validaciones básicas
    if (!name || !model || !color || isNaN(stock) || isNaN(priceRetail) || isNaN(priceWholesale) || isNaN(costPrice)) {
      return { error: 'Todos los campos obligatorios deben ser completados correctamente' }
    }

    if (stock < 0 || priceRetail <= 0 || priceWholesale <= 0 || costPrice <= 0) {
      return { error: 'Los valores numéricos deben ser positivos' }
    }

    let imageUrl: string | null = null

    if (imageFile && imageFile.size > 0) {
      const fileExtension = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExtension}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile)

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        return { error: 'Error al subir la imagen.' }
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      imageUrl = urlData.publicUrl
    }

    // Verificar si existe warehouse y type, crear si no existen
    let warehouse = await prisma.warehouse.findFirst({
      where: { id: warehouseId }
    })

    if (!warehouse) {
      warehouse = await prisma.warehouse.create({
        data: {
          id: warehouseId,
          name: 'Almacén Principal',
          location: 'Ubicación Principal'
        }
      })
    }

    let productType = await prisma.productType.findFirst({
      where: { id: typeId }
    })

    if (!productType) {
      productType = await prisma.productType.create({
        data: {
          id: typeId,
          name: 'Funda' // Tipo por defecto
        }
      })
    }

    // Crear el producto
    const product = await prisma.product.create({
      data: {
        name,
        model,
        color,
        stock,
        minStock,
        priceRetail,
        priceWholesale,
        costPrice,
        warehouseId: warehouse.id,
        typeId: productType.id,
        supplierId: supplierId || undefined,
        imageUrl
      }
    })

    // Crear movimiento de inventario inicial
    // Por ahora omitimos el movimiento inicial hasta tener un sistema de usuarios completo
    // await prisma.inventoryMovement.create({
    //   data: {
    //     productId: product.id,
    //     type: 'entrada',
    //     quantity: stock,
    //     reason: 'stock_inicial',
    //     notes: 'Stock inicial del producto',
    //     userId: session.userId // Necesitamos el ID del usuario de la sesión
    //   }
    // })

    revalidatePath('/inventory')
    revalidatePath('/inventory/products')
    revalidatePath('/dashboard')

    return { success: true, productId: product.id }
  } catch (error) {
    console.error('Error creating product:', error)
    return { error: 'Error al crear el producto. Intenta nuevamente.' }
  }
}

export async function getWarehouses() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: { name: 'asc' }
    })
    return warehouses
  } catch (error) {
    console.error('Error fetching warehouses:', error)
    return []
  }
}

export async function getProductTypes() {
  try {
    const types = await prisma.productType.findMany({
      orderBy: { name: 'asc' }
    })
    return types
  } catch (error) {
    console.error('Error fetching product types:', error)
    return []
  }
}

export async function getSuppliers() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' }
    })
    return suppliers
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return []
  }
}

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        warehouse: {
          select: {
            name: true
          }
        },
        type: {
          select: {
            name: true
          }
        },
        supplier: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function deleteProduct(productId: string) {
  try {
    // Verificar si el producto tiene ventas
    const salesCount = await prisma.sale.count({
      where: { productId }
    })

    if (salesCount > 0) {
      return { error: 'No se puede eliminar un producto que tiene ventas registradas' }
    }

    // Eliminar movimientos de inventario relacionados
    await prisma.inventoryMovement.deleteMany({
      where: { productId }
    })

    // Eliminar el producto
    await prisma.product.delete({
      where: { id: productId }
    })

    revalidatePath('/inventory')
    revalidatePath('/inventory/products')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { error: 'Error al eliminar el producto' }
  }
}
