-- AlterTable
ALTER TABLE "ProjectMedia" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ProjectMedia_projectId_idx" ON "ProjectMedia"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMedia_projectId_deletedAt_idx" ON "ProjectMedia"("projectId", "deletedAt");
