/**
 * Migration script: Convert PhoneModel.brand (string) to Brand relation
 *
 * This script will:
 * 1. Extract unique brand names from PhoneModel table
 * 2. Create Brand records for each unique brand
 * 3. Update PhoneModel records to use brandId
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateBrands() {
  console.log("🔄 Starting brand migration...\n");

  try {
    // Step 1: Get all phone models with their current brand (as string)
    const phoneModelsRaw = await prisma.$queryRaw<
      Array<{ id: string; name: string; brand: string | null }>
    >`
      SELECT id, name, brand FROM "PhoneModel"
    `;

    console.log(`📱 Found ${phoneModelsRaw.length} phone models`);

    // Step 2: Extract unique brand names (non-null)
    const uniqueBrands = [
      ...new Set(
        phoneModelsRaw
          .map((pm) => pm.brand)
          .filter(
            (brand): brand is string => brand !== null && brand.trim() !== ""
          )
      ),
    ];

    console.log(
      `🏷️  Found ${uniqueBrands.length} unique brands:`,
      uniqueBrands
    );

    // Step 3: Create Brand records
    const brandMap = new Map<string, string>(); // Map brand name to brand ID

    for (const brandName of uniqueBrands) {
      // Check if brand already exists
      let brand = await prisma.brand.findFirst({
        where: { name: brandName },
      });

      if (!brand) {
        brand = await prisma.brand.create({
          data: {
            name: brandName,
            status: "active",
          },
        });
        console.log(`  ✅ Created brand: ${brandName}`);
      } else {
        console.log(`  ℹ️  Brand already exists: ${brandName}`);
      }

      brandMap.set(brandName, brand.id);
    }

    // Step 4: Update PhoneModel records to use brandId
    console.log("\n📝 Updating phone models with brandId...");

    for (const phoneModel of phoneModelsRaw) {
      if (phoneModel.brand && phoneModel.brand.trim() !== "") {
        const brandId = brandMap.get(phoneModel.brand);

        if (brandId) {
          await prisma.$executeRaw`
            UPDATE "PhoneModel" 
            SET "brandId" = ${brandId}
            WHERE id = ${phoneModel.id}
          `;
          console.log(
            `  ✅ Updated ${phoneModel.name} → Brand: ${phoneModel.brand}`
          );
        } else {
          console.warn(
            `  ⚠️  No brand found for: ${phoneModel.name} (brand: ${phoneModel.brand})`
          );
        }
      } else {
        // Phone model has no brand, assign to "Universal" or "Sin Marca"
        let universalBrand = brandMap.get("Universal");

        if (!universalBrand) {
          const newBrand = await prisma.brand.create({
            data: {
              name: "Universal",
              status: "active",
            },
          });
          universalBrand = newBrand.id;
          brandMap.set("Universal", universalBrand);
          console.log(
            `  ✅ Created brand: Universal (for models without brand)`
          );
        }

        await prisma.$executeRaw`
          UPDATE "PhoneModel" 
          SET "brandId" = ${universalBrand}
          WHERE id = ${phoneModel.id}
        `;
        console.log(`  ✅ Updated ${phoneModel.name} → Brand: Universal`);
      }
    }

    console.log("\n✅ Migration completed successfully!");
    console.log(`   Created/updated ${brandMap.size} brands`);
    console.log(`   Updated ${phoneModelsRaw.length} phone models`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateBrands()
  .then(() => {
    console.log("\n🎉 All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
