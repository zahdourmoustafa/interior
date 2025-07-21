import OpenAI from 'openai';

// Initialize OpenAI only if API key is available
const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here' 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface PromptGenerationInput {
  roomType: string;
  designStyle: string;
  additionalContext?: string;
}

export class PromptGenerator {
  static async generateDynamicPrompt(input: PromptGenerationInput): Promise<string> {
    // Check if OpenAI is available
    if (!openai) {
      console.log('🔄 OpenAI API key not configured, using fallback prompt');
      return this.getFallbackPrompt(input.roomType, input.designStyle);
    }

    try {
      const systemPrompt = `You are an expert interior designer and AI prompt engineer. Your task is to create detailed, specific prompts for AI image generation that will produce high-quality, realistic interior design images.

Guidelines:
- Create prompts that are descriptive and specific
- Focus on furniture, colors, textures, lighting, and spatial arrangement
- Ensure the prompt matches the room type and design style exactly
- Include details about materials, finishes, and decorative elements
- Aim for photorealistic, professionally designed spaces
- Keep prompts between 100-200 words
- Avoid mentioning people, text, or watermarks
- Always include quality keywords: "8K quality", "photorealistic", "ultra-detailed", "sharp focus", "professional photography"
- Emphasize lighting, textures, and materials for better visual quality
- Include specific design elements that match the chosen style`;

      const userPrompt = `Create a detailed prompt for generating a ${input.designStyle} style ${input.roomType.replace('-', ' ')} interior design image. 
      
Room Type: ${input.roomType.replace('-', ' ')}
Design Style: ${input.designStyle}
${input.additionalContext ? `Additional Context: ${input.additionalContext}` : ''}

The prompt should describe a complete, well-designed space that showcases the specified style and room type perfectly.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const generatedPrompt = completion.choices[0]?.message?.content?.trim();
      
      if (!generatedPrompt) {
        throw new Error('Failed to generate prompt');
      }

      console.log('🤖 Generated dynamic prompt:', generatedPrompt);
      return generatedPrompt;

    } catch (error) {
      console.error('❌ Prompt generation failed, using fallback:', error);
      
      // Fallback to static prompt if OpenAI fails
      return this.getFallbackPrompt(input.roomType, input.designStyle);
    }
  }

  private static getFallbackPrompt(roomType: string, designStyle: string): string {
    const roomDescriptions = {
      'living-room': 'living room with comfortable seating arrangement, coffee table, ambient lighting, and welcoming atmosphere',
      'bedroom': 'bedroom with a comfortable bed, nightstands, soft lighting, and relaxing ambiance',
      'kitchen': 'kitchen with modern appliances, functional countertops, storage solutions, and efficient layout',
      'dining-room': 'dining room with elegant dining table, chairs, proper lighting, and sophisticated atmosphere',
      'home-office': 'home office with ergonomic desk setup, comfortable chair, organized storage, and productive environment',
      'bath-room': 'bathroom with modern fixtures, clean lines, functional storage, and spa-like atmosphere',
      'game-room': 'game room with entertainment setup, comfortable seating, proper lighting, and fun atmosphere',
      'kids-room': 'kids room with playful furniture, bright colors, safe design, and child-friendly elements'
    };

    const styleDescriptions = {
      'scandinavian': 'Scandinavian design featuring light wood furniture, neutral color palette, cozy textiles, minimalist aesthetic, natural materials, and hygge elements',
      'christmas': 'Christmas-themed design with warm festive colors, holiday decorations, cozy lighting, seasonal elements, and celebratory atmosphere',
      'japanese': 'Japanese-inspired design with clean lines, natural materials, zen elements, minimalist furniture, neutral colors, and peaceful ambiance',
      'eclectic': 'Eclectic design mixing various styles, bold patterns, vibrant colors, unique furniture pieces, artistic elements, and creative combinations',
      'minimalist': 'Minimalist design with clean lines, neutral colors, simple furniture, uncluttered spaces, functional elements, and serene atmosphere',
      'futuristic': 'Futuristic design featuring sleek surfaces, modern technology, LED lighting, contemporary materials, geometric shapes, and innovative elements',
      'bohemian': 'Bohemian design with rich textures, warm earth tones, layered textiles, plants, vintage pieces, and free-spirited atmosphere',
      'parisian': 'Parisian design with elegant furniture, classic details, sophisticated color scheme, refined materials, and timeless French charm'
    };

    const roomDesc = roomDescriptions[roomType as keyof typeof roomDescriptions] || `${roomType.replace('-', ' ')} interior space`;
    const styleDesc = styleDescriptions[designStyle as keyof typeof styleDescriptions] || `${designStyle} style design`;

    return `A professionally designed ${roomDesc} showcasing ${styleDesc}. The space features high-quality furnishings, excellent natural and artificial lighting, perfect color coordination, and attention to detail. The design should be photorealistic, well-composed, and demonstrate superior interior design principles with a focus on functionality and aesthetic appeal.`;
  }
}