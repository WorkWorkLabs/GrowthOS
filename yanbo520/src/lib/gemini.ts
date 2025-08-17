// Gemini AI API client
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

if (!GEMINI_API_KEY) {
  console.warn('NEXT_PUBLIC_GEMINI_API_KEY is not set. Gemini AI integration will not work.')
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

/**
 * 调用Gemini API生成内容
 * @param prompt 生成提示词
 * @returns 生成的文本内容
 */
export async function generateWithGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured')
  }

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048, // 增加输出token限制
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const data: GeminiResponse = await response.json()
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API')
    }

    const candidate = data.candidates[0]
    if (!candidate || !candidate.content) {
      throw new Error('Invalid response structure from Gemini API')
    }

    // 处理MAX_TOKENS情况 - content.parts可能为空
    if (!candidate.content.parts || candidate.content.parts.length === 0) {
      if (candidate.finishReason === 'MAX_TOKENS') {
        throw new Error('Response truncated due to token limit. Please try with shorter content.')
      }
      throw new Error('No content in response from Gemini API')
    }

    const generatedText = candidate.content.parts[0]?.text || ''
    if (!generatedText.trim()) {
      throw new Error('Empty response from Gemini API')
    }
    
    return generatedText.trim()

  } catch (error) {
    console.error('Gemini API error:', error)
    throw error
  }
}

/**
 * 根据README内容生成产品信息
 * @param readmeContent README文件内容
 * @returns 生成的产品信息
 */
export async function generateProductInfoFromReadme(readmeContent: string) {
  const titlePrompt = `Generate a concise product title (max 50 chars) for this project:\n\n${readmeContent.substring(0, 800)}...`

  const descriptionPrompt = `Generate a product description (max 200 words) highlighting key features and benefits for this project:\n\n${readmeContent.substring(0, 800)}...`

  const marketingPrompt = `Generate marketing copy (max 150 words) with persuasive tone for this project:\n\n${readmeContent.substring(0, 800)}...`

  const keywordsPrompt = `Generate 5 relevant keywords (comma-separated) for this project:\n\n${readmeContent.substring(0, 800)}...`

  try {
    const [title, description, marketing, keywordsText] = await Promise.all([
      generateWithGemini(titlePrompt),
      generateWithGemini(descriptionPrompt),
      generateWithGemini(marketingPrompt),
      generateWithGemini(keywordsPrompt)
    ])

    // Parse keywords from comma-separated text
    const keywords = keywordsText.split(',').map(k => k.trim()).filter(k => k.length > 0)

    return {
      title,
      description,
      marketing,
      keywords: keywords.slice(0, 5), // Limit to 5 keywords
      price: 29.99, // Default price
      currency: 'SOL',
      category: 'development' // Default category for README-based projects
    }

  } catch (error) {
    console.error('Failed to generate product info with Gemini:', error)
    throw error
  }
}