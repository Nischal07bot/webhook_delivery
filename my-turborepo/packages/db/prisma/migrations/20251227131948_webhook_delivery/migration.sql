/*
  Warnings:

  - A unique constraint covering the columns `[projectId,idempotencyKey]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Made the column `idempotencyKey` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DeliveryStatus" ADD VALUE 'RETRYING';
ALTER TYPE "DeliveryStatus" ADD VALUE 'DEAD';

-- DropForeignKey
ALTER TABLE "Webhook" DROP CONSTRAINT "Webhook_projectId_fkey";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "idempotencyKey" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Delivery_eventId_idx" ON "Delivery"("eventId");

-- CreateIndex
CREATE INDEX "Delivery_webhookId_status_idx" ON "Delivery"("webhookId", "status");

-- CreateIndex
CREATE INDEX "Event_projectId_createdAt_idx" ON "Event"("projectId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Event_projectId_idempotencyKey_key" ON "Event"("projectId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "Webhook_projectId_idx" ON "Webhook"("projectId");

-- AddForeignKey
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
