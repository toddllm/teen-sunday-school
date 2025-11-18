-- CreateTable
CREATE TABLE "GuessReferenceQuestion" (
    "id" TEXT NOT NULL,
    "verseReference" TEXT NOT NULL,
    "displayText" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "distractorRefs" JSONB NOT NULL,
    "book" TEXT,
    "difficulty" TEXT DEFAULT 'medium',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuessReferenceQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuessReferenceAttempt" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "selectedAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeToAnswerMs" INTEGER,
    "gameMode" TEXT,
    "roundNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuessReferenceAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuessReferenceQuestion_book_idx" ON "GuessReferenceQuestion"("book");

-- CreateIndex
CREATE INDEX "GuessReferenceQuestion_difficulty_idx" ON "GuessReferenceQuestion"("difficulty");

-- CreateIndex
CREATE INDEX "GuessReferenceQuestion_isActive_idx" ON "GuessReferenceQuestion"("isActive");

-- CreateIndex
CREATE INDEX "GuessReferenceAttempt_questionId_idx" ON "GuessReferenceAttempt"("questionId");

-- CreateIndex
CREATE INDEX "GuessReferenceAttempt_userId_idx" ON "GuessReferenceAttempt"("userId");

-- CreateIndex
CREATE INDEX "GuessReferenceAttempt_sessionId_idx" ON "GuessReferenceAttempt"("sessionId");

-- CreateIndex
CREATE INDEX "GuessReferenceAttempt_createdAt_idx" ON "GuessReferenceAttempt"("createdAt");

-- AddForeignKey
ALTER TABLE "GuessReferenceAttempt" ADD CONSTRAINT "GuessReferenceAttempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "GuessReferenceQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
