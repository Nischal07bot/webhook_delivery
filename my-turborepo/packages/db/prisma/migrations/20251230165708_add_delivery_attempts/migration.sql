/*
  Warnings:

  - A unique constraint covering the columns `[eventId,webhookId]` on the table `Delivery` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "DeliveryAttempt" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL,
    "status" "DeliveryStatus" NOT NULL,
    "s3ObjectKey" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryAttempt_deliveryId_idx" ON "DeliveryAttempt"("deliveryId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryAttempt_deliveryId_attempt_key" ON "DeliveryAttempt"("deliveryId", "attempt");

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_eventId_webhookId_key" ON "Delivery"("eventId", "webhookId");

-- AddForeignKey
ALTER TABLE "DeliveryAttempt" ADD CONSTRAINT "DeliveryAttempt_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
