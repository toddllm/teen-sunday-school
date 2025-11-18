-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "tags" TEXT[],
    "popularityRank" INTEGER NOT NULL DEFAULT 0,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicVerse" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "verseRef" TEXT NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicVerse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicView" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "userId" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedPlan" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TopicView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Topic_organizationId_idx" ON "Topic"("organizationId");

-- CreateIndex
CREATE INDEX "Topic_category_idx" ON "Topic"("category");

-- CreateIndex
CREATE INDEX "Topic_popularityRank_idx" ON "Topic"("popularityRank");

-- CreateIndex
CREATE INDEX "Topic_isGlobal_idx" ON "Topic"("isGlobal");

-- CreateIndex
CREATE INDEX "TopicVerse_topicId_idx" ON "TopicVerse"("topicId");

-- CreateIndex
CREATE INDEX "TopicVerse_verseRef_idx" ON "TopicVerse"("verseRef");

-- CreateIndex
CREATE UNIQUE INDEX "TopicVerse_topicId_verseRef_key" ON "TopicVerse"("topicId", "verseRef");

-- CreateIndex
CREATE INDEX "TopicView_topicId_idx" ON "TopicView"("topicId");

-- CreateIndex
CREATE INDEX "TopicView_userId_idx" ON "TopicView"("userId");

-- CreateIndex
CREATE INDEX "TopicView_viewedAt_idx" ON "TopicView"("viewedAt");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicVerse" ADD CONSTRAINT "TopicVerse_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicView" ADD CONSTRAINT "TopicView_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
