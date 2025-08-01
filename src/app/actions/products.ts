'use server'

import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProduct(prevState: any, formData: any) {
  try {
    const name = formData.name as string;
    const phoneModelId = formData.phoneModelId as string;
    const color = formData.color as string;
    const stock = Number(formData.stock);
    const minStock = formData.minStock !== undefined ? Number(formData.minStock) : 5;
    const priceRetail = Number(formData.priceRetail);
    const priceWholesale = Number(formData.priceWholesale);
    const costPrice = Number(formData.costPrice);
    const typeId = formData.typeId as string;
    const supplierId = formData.supplierId || null;
    const imageFile = formData.image as File;

    // LOG: mostrar todos los datos que llegan
    console.log('DEBUG createProduct', {
      name,
      phoneModelId,
      color,
      stock,
      minStock,
      priceRetail,
      priceWholesale,
      costPrice,
      typeId,
      supplierId
    });

    // Validaciones básicas
    if (!name || !phoneModelId || !color || isNaN(stock) || isNaN(priceRetail) || isNaN(priceWholesale) || isNaN(costPrice)) {
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
        phoneModelId,
        color,
        stock,
        minStock,
        priceRetail,
        priceWholesale,
        costPrice,
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
