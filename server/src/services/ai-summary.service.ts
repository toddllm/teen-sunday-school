import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * AI Passage Summary Service
 * Generates and manages AI-powered Bible passage summaries
 */

export interface PassageSummaryData {
  verseId: string;
  verseReference: string;
  bibleId: string;
  passageText: string;
  organizationId?: string;
  userId?: string;
}

export interface GeneratedSummary {
  summary: string;
  keyPoints: string[];
  historicalContext?: string;
  literaryContext?: string;
  practicalApplication?: string;
}

/**
 * Generate AI summary for a Bible passage
 * This is a placeholder that returns structured content.
 * In production, integrate with OpenAI, Anthropic Claude, or similar AI service.
 */
export async function generateAISummary(
  passageData: PassageSummaryData
): Promise<GeneratedSummary> {
  try {
    logger.info(`Generating AI summary for ${passageData.verseReference}`);

    // TODO: Replace with actual AI API call (OpenAI, Claude, etc.)
    // For now, return structured placeholder content
    const summary = await generatePlaceholderSummary(passageData);

    return summary;
  } catch (error) {
    logger.error('Error generating AI summary:', error);
    throw new Error('Failed to generate AI summary');
  }
}

/**
 * Placeholder summary generator
 * Replace this with actual AI API integration
 */
async function generatePlaceholderSummary(
  passageData: PassageSummaryData
): Promise<GeneratedSummary> {
  // This is a placeholder. In production, you would:
  // 1. Format a prompt for your AI service
  // 2. Call the AI API (OpenAI, Claude, etc.)
  // 3. Parse and structure the response
  // 4. Return the structured data

  const prompt = `
You are a biblical scholar and youth ministry expert. Provide a comprehensive summary of this Bible passage for teenagers:

Reference: ${passageData.verseReference}
Text: ${passageData.passageText}

Please provide:
1. A 2-3 sentence summary
2. 3-5 key points or insights
3. Historical and cultural context
4. Literary context (what comes before/after, genre, etc.)
5. Practical application for teenagers today

Format your response as structured JSON.
  `.trim();

  // Placeholder response structure
  // In production, this would come from your AI service
  return {
    summary: `This passage presents important biblical teaching. It offers wisdom and guidance for daily living and spiritual growth. The message remains relevant for understanding God's character and His relationship with His people.`,
    keyPoints: [
      'The passage emphasizes the importance of faith and obedience',
      'It reveals key aspects of God\'s character and promises',
      'The text connects to broader biblical themes and narratives',
      'It provides practical wisdom for daily Christian living',
    ],
    historicalContext: `This passage was written in a specific historical and cultural context that shaped its message. Understanding the original audience, their circumstances, and the cultural norms of the time helps illuminate the passage's meaning. The historical setting provides important background for interpretation.`,
    literaryContext: `This passage fits within the broader narrative and literary structure of its book. The surrounding verses, the book's genre (narrative, poetry, epistle, etc.), and its place in the biblical canon all contribute to understanding its message. Literary devices and writing style are significant for interpretation.`,
    practicalApplication: `For teenagers today, this passage offers relevant guidance for navigating faith, relationships, and daily challenges. It speaks to questions about identity, purpose, and making wise decisions. The principles can be applied to school life, friendships, family relationships, and personal spiritual growth.`,
  };
}

/**
 * Get or create a passage summary
 * Checks cache first, generates new summary if needed
 */
export async function getOrCreateSummary(
  passageData: PassageSummaryData
): Promise<any> {
  try {
    // Check if summary already exists
    const existing = await prisma.passageSummary.findUnique({
      where: {
        verseId_bibleId_organizationId: {
          verseId: passageData.verseId,
          bibleId: passageData.bibleId,
          organizationId: passageData.organizationId || null,
        },
      },
    });

    if (existing) {
      logger.info(`Using cached summary for ${passageData.verseReference}`);

      // Update view count and last viewed
      await prisma.passageSummary.update({
        where: { id: existing.id },
        data: {
          viewCount: { increment: 1 },
          lastViewedAt: new Date(),
        },
      });

      return existing;
    }

    // Generate new summary
    logger.info(`Generating new summary for ${passageData.verseReference}`);
    const aiSummary = await generateAISummary(passageData);

    // Save to database
    const summary = await prisma.passageSummary.create({
      data: {
        verseId: passageData.verseId,
        verseReference: passageData.verseReference,
        bibleId: passageData.bibleId,
        passageText: passageData.passageText,
        organizationId: passageData.organizationId || null,
        userId: passageData.userId,
        summary: aiSummary.summary,
        keyPoints: aiSummary.keyPoints,
        historicalContext: aiSummary.historicalContext,
        literaryContext: aiSummary.literaryContext,
        practicalApplication: aiSummary.practicalApplication,
        aiModel: 'placeholder-v1', // Update when using real AI
        aiProvider: 'placeholder', // Update when using real AI
      },
    });

    logger.info(`Created new summary with ID: ${summary.id}`);
    return summary;
  } catch (error) {
    logger.error('Error in getOrCreateSummary:', error);
    throw error;
  }
}

/**
 * Get recent summaries for an organization
 */
export async function getRecentSummaries(
  organizationId: string,
  limit: number = 10
): Promise<any[]> {
  try {
    const summaries = await prisma.passageSummary.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        lastViewedAt: 'desc',
      },
      take: limit,
    });

    return summaries;
  } catch (error) {
    logger.error('Error getting recent summaries:', error);
    throw error;
  }
}

/**
 * Get popular summaries (most viewed)
 */
export async function getPopularSummaries(
  organizationId: string,
  limit: number = 10
): Promise<any[]> {
  try {
    const summaries = await prisma.passageSummary.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        viewCount: 'desc',
      },
      take: limit,
    });

    return summaries;
  } catch (error) {
    logger.error('Error getting popular summaries:', error);
    throw error;
  }
}

/**
 * Delete a summary
 */
export async function deleteSummary(summaryId: string): Promise<void> {
  try {
    await prisma.passageSummary.delete({
      where: { id: summaryId },
    });
    logger.info(`Deleted summary ${summaryId}`);
  } catch (error) {
    logger.error('Error deleting summary:', error);
    throw error;
  }
}
