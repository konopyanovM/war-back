/*
  Warnings:

  - Added the required column `isActive` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('PENDING', 'FRIEND', 'BLOCK');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isActive" BOOLEAN NOT NULL;

-- CreateTable
CREATE TABLE "relationships" (
    "userId" INTEGER NOT NULL,
    "relatedUserId" INTEGER NOT NULL,
    "type" "RelationshipType" NOT NULL,

    CONSTRAINT "relationships_pkey" PRIMARY KEY ("userId","relatedUserId")
);

-- CreateIndex
CREATE UNIQUE INDEX "relationships_userId_relatedUserId_key" ON "relationships"("userId", "relatedUserId");

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
