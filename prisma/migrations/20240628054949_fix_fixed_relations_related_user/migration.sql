-- AlterEnum
ALTER TYPE "RelationshipEnum" ADD VALUE 'REJECT';

-- DropForeignKey
ALTER TABLE "relationships" DROP CONSTRAINT "relationships_userId_fkey";

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_relatedUserId_fkey" FOREIGN KEY ("relatedUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
