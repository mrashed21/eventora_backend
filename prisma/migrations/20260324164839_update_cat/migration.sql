/*
  Warnings:

  - You are about to drop the column `category_name` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `categories` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[category_type]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category_type` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "category_status" AS ENUM ('active', 'inactive');

-- DropIndex
DROP INDEX "categories_category_name_key";

-- DropIndex
DROP INDEX "idx_categories_is_active";

-- DropIndex
DROP INDEX "idx_categories_name";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "category_name",
DROP COLUMN "is_active",
ADD COLUMN     "category_status" "category_status" NOT NULL DEFAULT 'active',
ADD COLUMN     "category_type" TEXT NOT NULL,
ADD COLUMN     "is_paid" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "categories_category_type_key" ON "categories"("category_type");

-- CreateIndex
CREATE INDEX "idx_categories_type" ON "categories"("category_type");

-- CreateIndex
CREATE INDEX "idx_categories_status" ON "categories"("category_status");

-- CreateIndex
CREATE INDEX "idx_categories_is_paid" ON "categories"("is_paid");
