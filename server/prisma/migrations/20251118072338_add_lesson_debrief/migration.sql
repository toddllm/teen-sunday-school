-- CreateTable
CREATE TABLE "LessonDebrief" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "groupId" TEXT,
    "sessionId" TEXT,
    "authorId" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonDebrief_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonDebrief_lessonId_idx" ON "LessonDebrief"("lessonId");

-- CreateIndex
CREATE INDEX "LessonDebrief_authorId_idx" ON "LessonDebrief"("authorId");

-- CreateIndex
CREATE INDEX "LessonDebrief_sessionDate_idx" ON "LessonDebrief"("sessionDate");

-- CreateIndex
CREATE INDEX "LessonDebrief_groupId_idx" ON "LessonDebrief"("groupId");

-- AddForeignKey
ALTER TABLE "LessonDebrief" ADD CONSTRAINT "LessonDebrief_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonDebrief" ADD CONSTRAINT "LessonDebrief_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
