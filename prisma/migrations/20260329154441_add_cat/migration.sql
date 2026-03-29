/*
  Warnings:

  - You are about to drop the column `event_type` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `is_paid` on the `Event` table. All the data in the column will be lost.
  - The `category_type` column on the `categories` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `category_id` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_title` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "category_type" AS ENUM ('public_free', 'public_paid', 'private_free', 'private_paid');

-- DropIndex
DROP INDEX "idx_event_is_paid";

-- DropIndex
DROP INDEX "idx_event_type";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "event_type",
DROP COLUMN "is_paid",
ADD COLUMN     "category_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "category_image" TEXT,
ADD COLUMN     "category_title" TEXT NOT NULL,
DROP COLUMN "category_type",
ADD COLUMN     "category_type" "category_type" NOT NULL DEFAULT 'public_free';

-- CreateIndex
CREATE INDEX "idx_event_category_id" ON "Event"("category_id");

-- CreateIndex
CREATE INDEX "idx_categories_title" ON "categories"("category_title");

-- CreateIndex
CREATE INDEX "idx_categories_type" ON "categories"("category_type");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
