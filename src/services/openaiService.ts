// OpenAI GPT Integration Service
// This service handles communication with OpenAI's GPT API

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  developer: string;
  status: string;
  image: string;
  description: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class OpenAIService {
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1';
  private model: string = 'gpt-3.5-turbo';

  constructor() {
    // In Vite, use import.meta.env instead of process.env
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo';
    this.baseURL = import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1';
  }

  // Check if API key is available
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Get system prompt with property data
  private getSystemPrompt(properties: Property[]): string {
    const propertyData = properties.map(prop => ({
      id: prop.id,
      title: prop.title,
      location: prop.location,
      price: prop.price,
      type: prop.type,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      area: prop.area,
      status: prop.status,
      description: prop.description
    }));

    return `You are a helpful property assistant for Realaist, a leading property development company in Kenya. 

You have access to the following property database:
${JSON.stringify(propertyData, null, 2)}

Your capabilities:
1. Help users find properties based on location, price, type, bedrooms, etc.
2. Provide property information and details
3. Answer questions about the company and services
4. Help with property viewing scheduling
5. Provide contact information

Guidelines:
- Always be helpful, professional, and friendly
- When users ask about properties, search through the database and provide relevant matches
- Format prices in USD (e.g., $450,000)
- If no properties match their criteria, suggest alternatives or ask for clarification
- Keep responses concise but informative
- If asked about properties, always include key details like location, price, bedrooms, and bathrooms

Company Information:
- Name: Realaist
- Location: Westlands, Nairobi, Kenya
- Phone: +254 700 000 000
- Email: info@realaist.com
- Specializes in luxury residential and commercial properties

Remember: You are representing a professional property development company, so maintain a high standard of service and expertise.`;
  }

  // Send message to OpenAI GPT
  async sendMessage(userMessage: string, properties: Property[], conversationHistory: ChatMessage[] = []): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: this.getSystemPrompt(properties)
        },
        ...conversationHistory,
        {
          role: 'user',
          content: userMessage
        }
      ];

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I could not process your request.';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  // Test the API connection
  async testConnection(): Promise<boolean> {
    try {
      await this.sendMessage('Hello, are you working?', []);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();

// Export types for use in components
export type { Property, ChatMessage };
