import axios from 'axios';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * OpenAI API Service for Bible Q&A
 *
 * This service handles communication with OpenAI's API to provide
 * AI-powered answers to Bible-related questions.
 */

/**
 * Ask a question about the Bible and get an AI-generated response
 * with relevant Bible verse references.
 *
 * @param {string} question - The user's question about the Bible
 * @param {Array} bibleContext - Optional array of Bible passages to include as context
 * @returns {Promise<Object>} - Response with answer text and references
 */
export const askBibleQuestion = async (question, bibleContext = []) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please add REACT_APP_OPENAI_API_KEY to your .env file.');
  }

  try {
    // Build context from Bible passages if provided
    let contextText = '';
    if (bibleContext && bibleContext.length > 0) {
      contextText = '\n\nRelevant Bible passages:\n' +
        bibleContext.map(passage => `${passage.reference}: ${passage.text}`).join('\n\n');
    }

    const systemPrompt = `You are a helpful Bible study assistant. Your role is to answer questions about the Bible with accuracy and care.

Key guidelines:
1. Provide concise, helpful answers grounded in Scripture
2. Always cite specific Bible verses with book, chapter, and verse (e.g., "John 3:16")
3. Include 2-5 relevant verse references in your response
4. Be respectful of different interpretations
5. Acknowledge when topics are complex or debated
6. Keep answers focused and suitable for teens
7. Format your response as JSON with this structure:
   {
     "answer": "Your answer text here",
     "references": [
       {"verse": "John 3:16", "relevance": "Brief note on why this verse is relevant"},
       {"verse": "Romans 8:28", "relevance": "Brief note on why this verse is relevant"}
     ],
     "themes": ["forgiveness", "grace"]
   }

Remember: You are providing educational assistance, not pastoral counseling. Encourage users to discuss complex topics with their youth leaders or pastors.`;

    const userPrompt = `${question}${contextText}`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    const aiResponse = JSON.parse(response.data.choices[0].message.content);

    return {
      answer: aiResponse.answer,
      references: aiResponse.references || [],
      themes: aiResponse.themes || [],
      model: response.data.model,
      usage: response.data.usage
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error);

    // Provide helpful error messages
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your configuration.');
      } else if (error.response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again in a moment.');
      } else {
        throw new Error(`API error: ${error.response.data?.error?.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw error;
    }
  }
};

/**
 * Get follow-up questions based on the original question and answer
 *
 * @param {string} originalQuestion - The original question asked
 * @param {string} answer - The answer that was provided
 * @returns {Promise<Array<string>>} - Array of suggested follow-up questions
 */
export const getSuggestedFollowUps = async (originalQuestion, answer) => {
  if (!OPENAI_API_KEY) {
    return []; // Fail silently for this optional feature
  }

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Generate 3 relevant follow-up questions for Bible study based on the original question and answer. Return as JSON array of strings.'
          },
          {
            role: 'user',
            content: `Original question: ${originalQuestion}\n\nAnswer: ${answer}\n\nGenerate 3 follow-up questions in JSON format: {"questions": ["...", "...", "..."]}`
          }
        ],
        temperature: 0.8,
        max_tokens: 200,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    const result = JSON.parse(response.data.choices[0].message.content);
    return result.questions || [];
  } catch (error) {
    console.error('Error generating follow-up questions:', error);
    return [];
  }
};

export default {
  askBibleQuestion,
  getSuggestedFollowUps
};
