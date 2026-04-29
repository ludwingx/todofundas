-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "transactionId" TEXT;

-- CreateIndex
CREATE INDEX "Sale_transactionId_idx" ON "Sale"("transactionId");
