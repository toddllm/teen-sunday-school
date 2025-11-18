import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Interlinear Service
 * Manages interlinear Bible verse data for key verses
 */

interface InterlinearToken {
  original: string;
  transliteration: string;
  gloss: string;
  strongsNumber?: string;
  morphology?: string;
}

interface InterlinearData {
  id: string;
  verseRef: string;
  tokens: InterlinearToken[];
  language: string;
  translation: string;
  isKeyVerse: boolean;
  category: string | null;
}

/**
 * Get interlinear data for a verse reference
 */
export const getInterlinearByVerseRef = async (verseRef: string): Promise<InterlinearData | null> => {
  try {
    const verse = await prisma.interlinearVerse.findUnique({
      where: { verseRef },
    });

    if (!verse) {
      return null;
    }

    return {
      id: verse.id,
      verseRef: verse.verseRef,
      tokens: verse.tokensJson as InterlinearToken[],
      language: verse.language,
      translation: verse.translation,
      isKeyVerse: verse.isKeyVerse,
      category: verse.category,
    };
  } catch (error) {
    logger.error(`Error fetching interlinear for ${verseRef}:`, error);
    throw error;
  }
};

/**
 * Get all key verses with interlinear data
 */
export const getKeyVerses = async (category?: string): Promise<InterlinearData[]> => {
  try {
    const where: any = { isKeyVerse: true };

    if (category) {
      where.category = category;
    }

    const verses = await prisma.interlinearVerse.findMany({
      where,
      orderBy: { verseRef: 'asc' },
    });

    return verses.map(verse => ({
      id: verse.id,
      verseRef: verse.verseRef,
      tokens: verse.tokensJson as InterlinearToken[],
      language: verse.language,
      translation: verse.translation,
      isKeyVerse: verse.isKeyVerse,
      category: verse.category,
    }));
  } catch (error) {
    logger.error('Error fetching key verses:', error);
    throw error;
  }
};

/**
 * Track interlinear view metrics
 */
export const trackInterlinearMetric = async (
  verseId: string,
  action: string,
  options?: {
    organizationId?: string;
    userId?: string;
    wordIndex?: number;
    featureName?: string;
    sessionId?: string;
  }
): Promise<void> => {
  try {
    await prisma.interlinearMetric.create({
      data: {
        verseId,
        action,
        organizationId: options?.organizationId,
        userId: options?.userId,
        wordIndex: options?.wordIndex,
        featureName: options?.featureName,
        sessionId: options?.sessionId,
      },
    });
  } catch (error) {
    logger.error('Error tracking interlinear metric:', error);
    // Don't throw - metrics tracking shouldn't break the main flow
  }
};

/**
 * Get metrics for interlinear views
 */
export const getInterlinearMetrics = async (
  organizationId?: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
): Promise<any> => {
  try {
    const where: any = {};

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) {
        where.createdAt.gte = options.startDate;
      }
      if (options.endDate) {
        where.createdAt.lte = options.endDate;
      }
    }

    const [metrics, total] = await Promise.all([
      prisma.interlinearMetric.findMany({
        where,
        include: {
          verse: {
            select: {
              verseRef: true,
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 100,
        skip: options?.offset || 0,
      }),
      prisma.interlinearMetric.count({ where }),
    ]);

    // Get summary stats
    const actionStats = await prisma.interlinearMetric.groupBy({
      by: ['action'],
      where,
      _count: true,
    });

    const verseStats = await prisma.interlinearMetric.groupBy({
      by: ['verseId'],
      where,
      _count: true,
      orderBy: {
        _count: {
          verseId: 'desc',
        },
      },
      take: 10,
    });

    return {
      metrics,
      total,
      stats: {
        byAction: actionStats.map(s => ({
          action: s.action,
          count: s._count,
        })),
        topVerses: await Promise.all(
          verseStats.map(async s => {
            const verse = await prisma.interlinearVerse.findUnique({
              where: { id: s.verseId },
              select: { verseRef: true, category: true },
            });
            return {
              verseId: s.verseId,
              verseRef: verse?.verseRef,
              category: verse?.category,
              count: s._count,
            };
          })
        ),
      },
    };
  } catch (error) {
    logger.error('Error fetching interlinear metrics:', error);
    throw error;
  }
};

/**
 * Seed initial key verses with interlinear data
 * This provides a curated set of important verses for teens
 */
export const seedKeyVerses = async (): Promise<void> => {
  const keyVerses = [
    {
      verseRef: 'JHN.3.16',
      language: 'greek',
      translation: 'NA28',
      category: 'salvation',
      isKeyVerse: true,
      tokensJson: [
        { original: 'οὕτως', transliteration: 'houtōs', gloss: 'thus', strongsNumber: 'G3779' },
        { original: 'γὰρ', transliteration: 'gar', gloss: 'for', strongsNumber: 'G1063' },
        { original: 'ἠγάπησεν', transliteration: 'ēgapēsen', gloss: 'loved', strongsNumber: 'G25' },
        { original: 'ὁ', transliteration: 'ho', gloss: 'the', strongsNumber: 'G3588' },
        { original: 'θεὸς', transliteration: 'theos', gloss: 'God', strongsNumber: 'G2316' },
        { original: 'τὸν', transliteration: 'ton', gloss: 'the', strongsNumber: 'G3588' },
        { original: 'κόσμον', transliteration: 'kosmon', gloss: 'world', strongsNumber: 'G2889' },
        { original: 'ὥστε', transliteration: 'hōste', gloss: 'so that', strongsNumber: 'G5620' },
        { original: 'τὸν', transliteration: 'ton', gloss: 'the', strongsNumber: 'G3588' },
        { original: 'υἱὸν', transliteration: 'huion', gloss: 'Son', strongsNumber: 'G5207' },
        { original: 'αὐτοῦ', transliteration: 'autou', gloss: 'His', strongsNumber: 'G846' },
        { original: 'τὸν', transliteration: 'ton', gloss: 'the', strongsNumber: 'G3588' },
        { original: 'μονογενῆ', transliteration: 'monogenē', gloss: 'only begotten', strongsNumber: 'G3439' },
        { original: 'ἔδωκεν', transliteration: 'edōken', gloss: 'He gave', strongsNumber: 'G1325' },
      ],
    },
    {
      verseRef: 'ROM.3.23',
      language: 'greek',
      translation: 'NA28',
      category: 'salvation',
      isKeyVerse: true,
      tokensJson: [
        { original: 'πάντες', transliteration: 'pantes', gloss: 'all', strongsNumber: 'G3956' },
        { original: 'γὰρ', transliteration: 'gar', gloss: 'for', strongsNumber: 'G1063' },
        { original: 'ἥμαρτον', transliteration: 'hēmarton', gloss: 'sinned', strongsNumber: 'G264' },
        { original: 'καὶ', transliteration: 'kai', gloss: 'and', strongsNumber: 'G2532' },
        { original: 'ὑστεροῦνται', transliteration: 'hysterountai', gloss: 'fall short', strongsNumber: 'G5302' },
        { original: 'τῆς', transliteration: 'tēs', gloss: 'of the', strongsNumber: 'G3588' },
        { original: 'δόξης', transliteration: 'doxēs', gloss: 'glory', strongsNumber: 'G1391' },
        { original: 'τοῦ', transliteration: 'tou', gloss: 'of', strongsNumber: 'G3588' },
        { original: 'θεοῦ', transliteration: 'theou', gloss: 'God', strongsNumber: 'G2316' },
      ],
    },
    {
      verseRef: 'JHN.1.1',
      language: 'greek',
      translation: 'NA28',
      category: 'doctrine',
      isKeyVerse: true,
      tokensJson: [
        { original: 'Ἐν', transliteration: 'En', gloss: 'In', strongsNumber: 'G1722' },
        { original: 'ἀρχῇ', transliteration: 'archē', gloss: 'beginning', strongsNumber: 'G746' },
        { original: 'ἦν', transliteration: 'ēn', gloss: 'was', strongsNumber: 'G1510' },
        { original: 'ὁ', transliteration: 'ho', gloss: 'the', strongsNumber: 'G3588' },
        { original: 'λόγος', transliteration: 'logos', gloss: 'Word', strongsNumber: 'G3056' },
        { original: 'καὶ', transliteration: 'kai', gloss: 'and', strongsNumber: 'G2532' },
        { original: 'ὁ', transliteration: 'ho', gloss: 'the', strongsNumber: 'G3588' },
        { original: 'λόγος', transliteration: 'logos', gloss: 'Word', strongsNumber: 'G3056' },
        { original: 'ἦν', transliteration: 'ēn', gloss: 'was', strongsNumber: 'G1510' },
        { original: 'πρὸς', transliteration: 'pros', gloss: 'with', strongsNumber: 'G4314' },
        { original: 'τὸν', transliteration: 'ton', gloss: 'the', strongsNumber: 'G3588' },
        { original: 'θεόν', transliteration: 'theon', gloss: 'God', strongsNumber: 'G2316' },
        { original: 'καὶ', transliteration: 'kai', gloss: 'and', strongsNumber: 'G2532' },
        { original: 'θεὸς', transliteration: 'theos', gloss: 'God', strongsNumber: 'G2316' },
        { original: 'ἦν', transliteration: 'ēn', gloss: 'was', strongsNumber: 'G1510' },
        { original: 'ὁ', transliteration: 'ho', gloss: 'the', strongsNumber: 'G3588' },
        { original: 'λόγος', transliteration: 'logos', gloss: 'Word', strongsNumber: 'G3056' },
      ],
    },
    {
      verseRef: '1CO.13.4',
      language: 'greek',
      translation: 'NA28',
      category: 'love',
      isKeyVerse: true,
      tokensJson: [
        { original: 'Ἡ', transliteration: 'Hē', gloss: 'The', strongsNumber: 'G3588' },
        { original: 'ἀγάπη', transliteration: 'agapē', gloss: 'love', strongsNumber: 'G26' },
        { original: 'μακροθυμεῖ', transliteration: 'makrothymei', gloss: 'is patient', strongsNumber: 'G3114' },
        { original: 'χρηστεύεται', transliteration: 'chrēsteuetai', gloss: 'is kind', strongsNumber: 'G5541' },
        { original: 'ἡ', transliteration: 'hē', gloss: 'the', strongsNumber: 'G3588' },
        { original: 'ἀγάπη', transliteration: 'agapē', gloss: 'love', strongsNumber: 'G26' },
        { original: 'οὐ', transliteration: 'ou', gloss: 'not', strongsNumber: 'G3756' },
        { original: 'ζηλοῖ', transliteration: 'zēloi', gloss: 'is jealous', strongsNumber: 'G2206' },
      ],
    },
    {
      verseRef: 'PHP.4.13',
      language: 'greek',
      translation: 'NA28',
      category: 'faith',
      isKeyVerse: true,
      tokensJson: [
        { original: 'πάντα', transliteration: 'panta', gloss: 'all things', strongsNumber: 'G3956' },
        { original: 'ἰσχύω', transliteration: 'ischyō', gloss: 'I can do', strongsNumber: 'G2480' },
        { original: 'ἐν', transliteration: 'en', gloss: 'in', strongsNumber: 'G1722' },
        { original: 'τῷ', transliteration: 'tō', gloss: 'the one', strongsNumber: 'G3588' },
        { original: 'ἐνδυναμοῦντί', transliteration: 'endynamounti', gloss: 'strengthening', strongsNumber: 'G1743' },
        { original: 'με', transliteration: 'me', gloss: 'me', strongsNumber: 'G3165' },
      ],
    },
    {
      verseRef: 'PSA.23.1',
      language: 'hebrew',
      translation: 'BHS',
      category: 'comfort',
      isKeyVerse: true,
      tokensJson: [
        { original: 'יְהוָ֥ה', transliteration: 'YHWH', gloss: 'LORD', strongsNumber: 'H3068' },
        { original: 'רֹעִ֑י', transliteration: 'rō·ʿî', gloss: 'my shepherd', strongsNumber: 'H7462' },
        { original: 'לֹ֣א', transliteration: 'lōʾ', gloss: 'not', strongsNumber: 'H3808' },
        { original: 'אֶחְסָֽר', transliteration: 'ʾeḥ·sār', gloss: 'I shall lack', strongsNumber: 'H2637' },
      ],
    },
    {
      verseRef: 'PRO.3.5',
      language: 'hebrew',
      translation: 'BHS',
      category: 'wisdom',
      isKeyVerse: true,
      tokensJson: [
        { original: 'בְּטַ֣ח', transliteration: 'bə·ṭaḥ', gloss: 'Trust', strongsNumber: 'H982' },
        { original: 'אֶל־', transliteration: 'ʾel-', gloss: 'in', strongsNumber: 'H413' },
        { original: 'יְ֭הוָה', transliteration: 'YHWH', gloss: 'LORD', strongsNumber: 'H3068' },
        { original: 'בְּכָל־', transliteration: 'bə·ḵāl-', gloss: 'with all', strongsNumber: 'H3605' },
        { original: 'לִבֶּ֑ךָ', transliteration: 'lib·be·ḵā', gloss: 'your heart', strongsNumber: 'H3820' },
        { original: 'וְאֶל־', transliteration: 'wə·ʾel-', gloss: 'and to', strongsNumber: 'H413' },
        { original: 'בִּֽ֝ינָתְךָ֗', transliteration: 'bî·nā·ṯə·ḵā', gloss: 'your understanding', strongsNumber: 'H998' },
        { original: 'אַל־', transliteration: 'ʾal-', gloss: 'not', strongsNumber: 'H408' },
        { original: 'תִּשָּׁעֵֽן', transliteration: 'tiš·šā·ʿên', gloss: 'lean', strongsNumber: 'H8172' },
      ],
    },
  ];

  try {
    for (const verse of keyVerses) {
      await prisma.interlinearVerse.upsert({
        where: { verseRef: verse.verseRef },
        update: verse,
        create: verse,
      });
    }
    logger.info(`✓ Seeded ${keyVerses.length} key verses with interlinear data`);
  } catch (error) {
    logger.error('Error seeding key verses:', error);
    throw error;
  }
};

export default {
  getInterlinearByVerseRef,
  getKeyVerses,
  trackInterlinearMetric,
  getInterlinearMetrics,
  seedKeyVerses,
};
