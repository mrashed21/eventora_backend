/*
  Warnings:

  - You are about to drop the column `address` on the `participants` table. All the data in the column will be lost.
  - You are about to drop the column `contactNumber` on the `participants` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `participants` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `participants` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `participants` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `participants` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `participants` table. All the data in the column will be lost.
  - You are about to drop the column `profilePhoto` on the `participants` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `participants` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_email]` on the table `participants` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `participants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_email` to the `participants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_name` to the `participants` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "idx_participants_email";

-- DropIndex
DROP INDEX "idx_participants_is_deleted";

-- DropIndex
DROP INDEX "participants_email_key";

-- AlterTable
ALTER TABLE "participants" DROP COLUMN "address",
DROP COLUMN "contactNumber",
DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "email",
DROP COLUMN "is_deleted",
DROP COLUMN "name",
DROP COLUMN "profilePhoto",
DROP COLUMN "updatedAt",
ADD COLUMN     "contact_number" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profile_photo" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_address" TEXT,
ADD COLUMN     "user_email" TEXT NOT NULL,
ADD COLUMN     "user_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "participants_user_email_key" ON "participants"("user_email");

-- CreateIndex
CREATE INDEX "idx_participants_user_email" ON "participants"("user_email");

-- CreateIndex
CREATE INDEX "idx_participants_is_deleted" ON "participants"("is_deleted");
