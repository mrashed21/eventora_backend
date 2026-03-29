/*
  Warnings:

  - The values [public_free,public_paid,private_free,private_paid] on the enum `category_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "category_type_new" AS ENUM ('public', 'private');
ALTER TABLE "public"."categories" ALTER COLUMN "category_type" DROP DEFAULT;
ALTER TABLE "categories" ALTER COLUMN "category_type" TYPE "category_type_new" USING ("category_type"::text::"category_type_new");
ALTER TYPE "category_type" RENAME TO "category_type_old";
ALTER TYPE "category_type_new" RENAME TO "category_type";
DROP TYPE "public"."category_type_old";
ALTER TABLE "categories" ALTER COLUMN "category_type" SET DEFAULT 'public';
COMMIT;

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "is_paid" SET DEFAULT false,
ALTER COLUMN "category_type" SET DEFAULT 'public';
