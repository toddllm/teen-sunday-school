-- Add PARENT role to Role enum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PARENT';

-- CreateTable: ParentChild
CREATE TABLE "ParentChild" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "canViewProgress" BOOLEAN NOT NULL DEFAULT true,
    "canViewLessons" BOOLEAN NOT NULL DEFAULT true,
    "canViewActivities" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentChild_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ParentLogin
CREATE TABLE "ParentLogin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "ParentLogin_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ParentFeedback
CREATE TABLE "ParentFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER,
    "comment" TEXT,
    "category" TEXT,
    "lessonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ParentChild_parentId_idx" ON "ParentChild"("parentId");
CREATE INDEX "ParentChild_childId_idx" ON "ParentChild"("childId");
CREATE UNIQUE INDEX "ParentChild_parentId_childId_key" ON "ParentChild"("parentId", "childId");

-- CreateIndex
CREATE INDEX "ParentLogin_userId_idx" ON "ParentLogin"("userId");
CREATE INDEX "ParentLogin_loginAt_idx" ON "ParentLogin"("loginAt");

-- CreateIndex
CREATE INDEX "ParentFeedback_userId_idx" ON "ParentFeedback"("userId");
CREATE INDEX "ParentFeedback_createdAt_idx" ON "ParentFeedback"("createdAt");
CREATE INDEX "ParentFeedback_category_idx" ON "ParentFeedback"("category");

-- AddForeignKey
ALTER TABLE "ParentChild" ADD CONSTRAINT "ParentChild_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ParentChild" ADD CONSTRAINT "ParentChild_childId_fkey"
    FOREIGN KEY ("childId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentLogin" ADD CONSTRAINT "ParentLogin_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentFeedback" ADD CONSTRAINT "ParentFeedback_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
