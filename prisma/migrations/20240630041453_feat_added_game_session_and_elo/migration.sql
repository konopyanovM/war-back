-- AlterTable
ALTER TABLE "users" ADD COLUMN     "elo" INTEGER DEFAULT 400;

-- CreateTable
CREATE TABLE "GameSession" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "westPlayerId" INTEGER NOT NULL,
    "eastPlayerId" INTEGER NOT NULL,
    "winnerId" INTEGER NOT NULL,
    "winnerTeam" INTEGER NOT NULL,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_westPlayerId_fkey" FOREIGN KEY ("westPlayerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_eastPlayerId_fkey" FOREIGN KEY ("eastPlayerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
