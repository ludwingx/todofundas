import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  const productTypes = [
    { name: 'Funda' },
    { name: 'Protector de Pantalla' },
    { name: 'Cargador' },
    { name: 'Cable' },
  ]

  for (const type of productTypes) {
    const existingType = await prisma.productType.findUnique({
      where: { name: type.name },
    });
    if (!existingType) {
      await prisma.productType.create({
        data: { name: type.name },
      });
      console.log(`Created product type: ${type.name}`);
    } else {
      console.log(`Product type "${type.name}" already exists. Skipping.`);
    }
  }

  console.log(`Seeding finished.`)
}

main()
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
