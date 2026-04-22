import { redirect } from 'next/navigation'
import { getSession } from '@/app/actions/auth'
import { prisma as db } from '@/lib/prisma'
import { NewSaleClient } from './NewSaleClient'

export default async function NewSalePage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  const products = await db.product.findMany({
    where: {
      status: 'active',
      OR: [
        { stock: { gt: 0 } },
        { stockDamaged: { gt: 0 } }
      ]
    },
    include: {
      phoneModel: true,
      color: true,
      type: true
    }
  })

  // Format products for the client component
  const availableProducts = products.map(p => ({
    id: p.id,
    name: `${p.type.name} - ${p.phoneModel.name}`,
    model: p.phoneModel.name,
    color: p.color.name,
    stock: p.stock,
    stockDamaged: p.stockDamaged,
    priceRetail: p.priceRetail,
    priceWholesale: p.priceWholesale,
    imageUrl: p.imageUrl
  }))

  return <NewSaleClient availableProducts={availableProducts} />
}
