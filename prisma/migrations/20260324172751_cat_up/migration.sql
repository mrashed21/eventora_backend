/*
  Warnings:

  - The values [inactive] on the enum `category_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "category_status_new" AS ENUM ('active', 'in_active');
ALTER TABLE "public"."categories" ALTER COLUMN "category_status" DROP DEFAULT;
ALTER TABLE "categories" ALTER COLUMN "category_status" TYPE "category_status_new" USING ("category_status"::text::"category_status_new");
ALTER TYPE "category_status" RENAME TO "category_status_old";
ALTER TYPE "category_status_new" RENAME TO "category_status";
DROP TYPE "public"."category_status_old";
ALTER TABLE "categories" ALTER COLUMN "category_status" SET DEFAULT 'active';
COMMIT;

-- DropIndex
DROP INDEX "categories_category_type_key";
