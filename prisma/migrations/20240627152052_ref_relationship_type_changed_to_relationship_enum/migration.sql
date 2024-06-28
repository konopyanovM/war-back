/*
  Warnings:

  - Changed the type of `type` on the `relationships` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RelationshipEnum" AS ENUM ('PENDING', 'FRIEND', 'BLOCK');

-- AlterTable
ALTER TABLE "relationships" DROP COLUMN "type",
ADD COLUMN     "type" "RelationshipEnum" NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "isActive" DROP NOT NULL;

-- DropEnum
DROP TYPE "RelationshipType";
