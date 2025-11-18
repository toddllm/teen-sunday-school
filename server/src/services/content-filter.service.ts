import { PrismaClient, FilterCategory, FilterAction } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Content Filter Service
 * Analyzes user queries and applies safe-mode filters
 */

// Keyword mappings for each category
const CATEGORY_KEYWORDS: Record<FilterCategory, string[]> = {
  RELATIONSHIPS_SEXUALITY: [
    'sex', 'sexual', 'sexuality', 'dating', 'boyfriend', 'girlfriend',
    'romantic', 'romance', 'attraction', 'crush', 'kissing', 'intimacy',
    'virginity', 'purity', 'masturbation', 'pornography', 'lust',
    'homosexuality', 'gay', 'lesbian', 'lgbtq', 'transgender', 'gender identity',
    'marriage', 'divorce', 'fornication', 'adultery',
  ],
  MENTAL_HEALTH: [
    'depression', 'depressed', 'anxiety', 'anxious', 'suicide', 'suicidal',
    'self-harm', 'cutting', 'eating disorder', 'anorexia', 'bulimia',
    'panic attack', 'trauma', 'ptsd', 'bipolar', 'mental illness',
    'therapy', 'counseling', 'medication', 'antidepressant',
    'worthless', 'hopeless', 'kill myself', 'end it all',
  ],
  CONTROVERSIAL_DOCTRINE: [
    'predestination', 'calvinism', 'arminianism', 'speaking in tongues',
    'baptism debate', 'once saved always saved', 'eternal security',
    'prosperity gospel', 'cessationism', 'continuationism',
    'young earth', 'old earth', 'evolution', 'creation debate',
    'rapture', 'tribulation', 'end times', 'eschatology',
    'catholic', 'protestant', 'denomination differences',
  ],
  VIOLENCE_ABUSE: [
    'abuse', 'abused', 'domestic violence', 'physical abuse', 'sexual abuse',
    'rape', 'assault', 'molested', 'molestation', 'beaten', 'hitting',
    'violence', 'violent', 'hurt', 'hurting me', 'threatening',
    'bullying', 'bullied', 'harassment', 'stalking', 'unsafe',
  ],
  SUBSTANCE_USE: [
    'drugs', 'drug use', 'marijuana', 'weed', 'alcohol', 'drinking',
    'drunk', 'high', 'getting high', 'smoking', 'vaping', 'tobacco',
    'cocaine', 'heroin', 'methamphetamine', 'pills', 'prescription drugs',
    'addiction', 'addicted', 'substance abuse', 'party drugs',
  ],
  POLITICS: [
    'republican', 'democrat', 'conservative', 'liberal', 'progressive',
    'trump', 'biden', 'election', 'voting', 'political party',
    'capitalism', 'socialism', 'communism', 'government',
    'immigration', 'gun control', 'abortion politics', 'climate policy',
  ],
  FAMILY_ISSUES: [
    'parents divorcing', 'divorce', 'custody', 'stepmom', 'stepdad',
    'blended family', 'family conflict', 'parents fighting',
    'dad left', 'mom left', 'abandoned', 'foster care', 'adoption',
    'parents dont understand', 'hate my parents', 'running away',
  ],
  DEATH_GRIEF: [
    'death', 'died', 'dying', 'passed away', 'funeral', 'grief',
    'grieving', 'mourning', 'loss', 'lost someone', 'grandparent died',
    'parent died', 'friend died', 'terminal illness', 'cancer',
    'why did god take', 'heaven', 'afterlife',
  ],
  DOUBTS_FAITH: [
    'doubt', 'doubting', 'dont believe', 'losing faith', 'questioning god',
    'is god real', 'does god exist', 'why should i believe',
    'christianity true', 'other religions', 'hypocrisy',
    'church hurt', 'disappointed in god', 'angry at god',
  ],
  PEER_PRESSURE: [
    'peer pressure', 'friends pressuring', 'everyone else is',
    'left out', 'fitting in', 'popularity', 'being cool',
    'friends drinking', 'friends smoking', 'party pressure',
    'sexting', 'nudes', 'social media pressure',
  ],
  CUSTOM: [], // Will be populated from custom keywords
};

interface FilterResult {
  allowed: boolean;
  action: FilterAction | null;
  category: FilterCategory | null;
  message: string | null;
  metricId?: string;
}

interface FilterContext {
  organizationId: string;
  userId?: string;
  groupId?: string;
  featureName?: string;
}

/**
 * Analyze a query and determine if it should be filtered
 */
export async function analyzeQuery(
  query: string,
  context: FilterContext
): Promise<FilterResult> {
  try {
    // Get filter configuration for this organization
    let config = await prisma.aIFilterConfig.findUnique({
      where: { organizationId: context.organizationId },
    });

    // Fall back to global config if no org-specific config
    if (!config) {
      config = await prisma.aIFilterConfig.findUnique({
        where: { organizationId: null },
      });
    }

    // If no config exists or filters are disabled, allow all queries
    if (!config || !config.isActive) {
      return {
        allowed: true,
        action: null,
        category: null,
        message: null,
      };
    }

    // Normalize query for analysis
    const normalizedQuery = query.toLowerCase();

    // Check for category matches
    const detectedCategory = detectCategory(
      normalizedQuery,
      config.customKeywords as any
    );

    if (!detectedCategory) {
      // No sensitive content detected
      return {
        allowed: true,
        action: null,
        category: null,
        message: null,
      };
    }

    // Get the action for this category
    const filterRules = config.filterRules as Record<string, string>;
    const action = (filterRules[detectedCategory] as FilterAction) || 'REDIRECT';

    // Log the metric
    const metric = await prisma.aIFilterMetric.create({
      data: {
        filterId: config.id,
        organizationId: context.organizationId,
        query,
        detectedCategory,
        actionTaken: action,
        userId: context.userId,
        groupId: context.groupId,
        featureName: context.featureName,
      },
    });

    // Generate response based on action
    const response = generateFilterResponse(action, detectedCategory, config.redirectMessage);

    return {
      allowed: action === 'MONITOR',
      action,
      category: detectedCategory,
      message: response,
      metricId: metric.id,
    };
  } catch (error) {
    logger.error('Error analyzing query:', error);
    // On error, fail open (allow the query) to avoid blocking legitimate usage
    return {
      allowed: true,
      action: null,
      category: null,
      message: null,
    };
  }
}

/**
 * Detect which category (if any) a query falls into
 */
function detectCategory(
  query: string,
  customKeywords?: { block?: string[]; monitor?: string[] }
): FilterCategory | null {
  // Check custom keywords first
  if (customKeywords) {
    const allCustom = [
      ...(customKeywords.block || []),
      ...(customKeywords.monitor || []),
    ];

    for (const keyword of allCustom) {
      if (query.includes(keyword.toLowerCase())) {
        return FilterCategory.CUSTOM;
      }
    }
  }

  // Check built-in categories
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'CUSTOM') continue;

    for (const keyword of keywords) {
      // Use word boundaries to avoid false positives
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(query)) {
        return category as FilterCategory;
      }
    }
  }

  return null;
}

/**
 * Generate appropriate response message based on filter action
 */
function generateFilterResponse(
  action: FilterAction,
  category: FilterCategory,
  customRedirectMessage?: string | null
): string {
  switch (action) {
    case 'REDIRECT':
      return customRedirectMessage ||
        "This is a great question! For topics like this, we think it's best to talk with a youth leader who can give you personalized guidance. Please reach out to your group leader or pastor.";

    case 'GUIDANCE':
      return getHighLevelGuidance(category);

    case 'BLOCK':
      return "I'm not able to provide an answer to this question. Please talk with a youth leader if you have questions or concerns.";

    case 'MONITOR':
      return ''; // No message needed for monitor - query proceeds normally

    default:
      return "I'm not able to answer this question. Please speak with a youth leader.";
  }
}

/**
 * Get high-level guidance for specific categories
 */
function getHighLevelGuidance(category: FilterCategory): string {
  const guidance: Record<FilterCategory, string> = {
    RELATIONSHIPS_SEXUALITY:
      "Relationships are an important part of life. The Bible teaches us about love, respect, and honoring God in our relationships. For specific questions, it's best to talk with a youth leader who can provide personalized guidance.",

    MENTAL_HEALTH:
      "Your mental and emotional well-being matters deeply to God and to us. If you're struggling, please reach out to a trusted adult, youth leader, or counselor who can provide proper support. You don't have to face this alone.",

    CONTROVERSIAL_DOCTRINE:
      "This is a topic where sincere Christians sometimes disagree. What's most important is focusing on the core truths of the Gospel. For a deeper discussion about this topic, I'd recommend talking with your youth leader or pastor.",

    VIOLENCE_ABUSE:
      "If you or someone you know is being hurt or is in danger, please tell a trusted adult immediately. This could be a parent, teacher, youth leader, or you can call a helpline. Your safety is the top priority.",

    SUBSTANCE_USE:
      "The Bible teaches us to take care of our bodies and make wise choices. Substance use can have serious consequences. If you're facing pressure or struggling with this, please talk to a trusted adult who can help.",

    POLITICS:
      "As Christians, we're called to love others and seek justice while remembering our ultimate citizenship is in heaven. Christians can have different political views. What matters most is following Jesus' teachings of love and service.",

    FAMILY_ISSUES:
      "Family challenges can be really hard. God cares about you and your family situation. Please talk with a youth leader or counselor who can provide support and guidance specific to your situation.",

    DEATH_GRIEF:
      "Loss and grief are painful experiences. God is close to the brokenhearted and promises to comfort us. It's okay to grieve and to have questions. Please reach out to a youth leader or counselor who can walk through this with you.",

    DOUBTS_FAITH:
      "Having questions and doubts is a normal part of faith. God is big enough to handle our questions. Many strong believers have wrestled with similar doubts. I'd encourage you to explore these questions with your youth leader or pastor in a safe space.",

    PEER_PRESSURE:
      "Peer pressure can be tough to navigate. Remember, real friends respect your boundaries and values. The Bible encourages us to choose friends wisely and to have courage to stand for what's right. Talk with your youth leader about specific situations you're facing.",

    CUSTOM:
      "For this topic, it's best to discuss with a youth leader who can provide appropriate guidance.",
  };

  return guidance[category] || guidance.CUSTOM;
}

/**
 * Check if a query should be filtered (simpler boolean check)
 */
export async function shouldFilterQuery(
  query: string,
  context: FilterContext
): Promise<boolean> {
  const result = await analyzeQuery(query, context);
  return !result.allowed;
}

/**
 * Get filter statistics for an organization
 */
export async function getFilterStats(organizationId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const metrics = await prisma.aIFilterMetric.findMany({
    where: {
      organizationId,
      createdAt: { gte: startDate },
    },
  });

  const stats = {
    total: metrics.length,
    byCategory: {} as Record<string, number>,
    byAction: {} as Record<string, number>,
    needsFollowUp: metrics.filter(m => !m.leaderNotified).length,
  };

  metrics.forEach(m => {
    stats.byCategory[m.detectedCategory] = (stats.byCategory[m.detectedCategory] || 0) + 1;
    stats.byAction[m.actionTaken] = (stats.byAction[m.actionTaken] || 0) + 1;
  });

  return stats;
}
