/*
  Warnings:

  - The primary key for the `GameSession` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "GameSession" DROP CONSTRAINT "GameSession_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "GameSession_id_seq";
