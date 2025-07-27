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
      console.error('❌ OpenAI prompt generation failed:', error);
      return this.getFallbackPrompt(input.roomType, input.designStyle);
    }
  }

  static async generateSketchToRealityPrompt(input: PromptGenerationInput): Promise<string> {
    // Check if OpenAI is available
    if (!openai) {
      console.log('🔄 OpenAI API key not configured, using fallback sketch-to-reality prompt');
      return this.getFallbackSketchToRealityPrompt(input.roomType, input.designStyle);
    }

    try {
      const systemPrompt = `You are an expert interior designer and AI prompt engineer specializing in converting hand-drawn sketches into realistic interior design images. Your task is to create detailed, specific prompts that will transform sketches into photorealistic interior spaces.

Guidelines:
- Focus on converting sketch elements into realistic furniture, materials, and textures
- Emphasize realistic lighting, shadows, and depth
- Include specific details about materials, finishes, and decorative elements
- Ensure the prompt matches the room type and design style exactly
- Aim for photorealistic, professionally designed spaces
- Keep prompts between 100-200 words
- Avoid mentioning people, text, or watermarks
- Always include quality keywords: "photorealistic", "realistic", "detailed", "sharp focus", "professional photography"
- Emphasize realistic materials, textures, and lighting
- Focus on converting sketch lines into realistic architectural and design elements
- Include specific design elements that match the chosen style
- Emphasize depth, perspective, and realistic spatial relationships`;

      const userPrompt = `Create a detailed prompt for converting a hand-drawn sketch into a realistic ${input.designStyle} style ${input.roomType.replace('-', ' ')} interior design image. 
      
Room Type: ${input.roomType.replace('-', ' ')}
Design Style: ${input.designStyle}
${input.additionalContext ? `Additional Context: ${input.additionalContext}` : ''}

The prompt should focus on transforming sketch elements into realistic interior spaces with proper lighting, materials, and spatial relationships.`;

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
        throw new Error('Failed to generate sketch-to-reality prompt');
      }

      console.log('🏠 Generated sketch-to-reality prompt:', generatedPrompt);
      return generatedPrompt;

    } catch (error) {
      console.error('❌ OpenAI sketch-to-reality prompt generation failed:', error);
      return this.getFallbackSketchToRealityPrompt(input.roomType, input.designStyle);
    }
  }

  static async generateExteriorRedesignPrompt(input: { designStyle: string; additionalContext?: string; }): Promise<string> {
    if (!openai) {
      console.log('🔄 OpenAI API key not configured, using fallback exterior redesign prompt');
      return this.getFallbackExteriorRedesignPrompt(input.designStyle);
    }

    try {
      const systemPrompt = `You are an expert architect and AI prompt engineer. Your task is to create detailed, specific prompts for AI image generation that will transform building exterior MATERIALS ONLY while preserving the original structure.

Guidelines:
- Create prompts that are descriptive and specific to architectural elements.
- Focus on materials (brick, wood, glass, metal), architectural style, landscaping, lighting, and overall composition.
- Ensure the prompt matches the design style exactly.
- Include details about windows, doors, roofing, and other structural features.
- Aim for photorealistic, professionally designed exteriors.
- Keep prompts between 100-200 words.
- Avoid mentioning people, text, or watermarks.
- Always include quality keywords: "8K quality", "photorealistic", "ultra-detailed", "sharp focus", "professional architectural photography".
- Emphasize natural lighting (e.g., "golden hour lighting"), weather, and seasonal context for better visual quality.
- Include specific design elements that match the chosen style.`;

      const userPrompt = `Create a detailed prompt for transforming a building's exterior materials to ${input.designStyle} style. The prompt must emphasize keeping the EXACT same building structure while only changing materials and colors.
      
Design Style: ${input.designStyle}
${input.additionalContext ? `Additional Context: ${input.additionalContext}` : ''}

The prompt should describe a material transformation that preserves the building's original shape and structure while applying new materials and colors that showcase the specified style.`;

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
        throw new Error('Failed to generate exterior redesign prompt');
      }

      console.log('🤖 Generated exterior redesign prompt:', generatedPrompt);
      return generatedPrompt;

    } catch (error) {
      console.error('❌ OpenAI exterior redesign prompt generation failed:', error);
      return this.getFallbackExteriorRedesignPrompt(input.designStyle);
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

  private static getFallbackSketchToRealityPrompt(roomType: string, designStyle: string): string {
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

  private static getFallbackExteriorRedesignPrompt(designStyle: string): string {
    const styleDescriptions = {
      'scandinavian': 'Scandinavian architectural materials: light wood siding, white trim, large energy-efficient windows, neutral colors (whites, light grays, natural wood)',
      'christmas': 'Christmas exterior styling: festive decorations, warm lighting, holiday wreaths, red and green accents, snow effects',
      'japanese': 'Japanese architectural materials: natural cedar wood, stone elements, traditional tile roofing, clean horizontal lines',
      'eclectic': 'Eclectic architectural materials: mixed materials (brick, wood, metal, stone), varied textures, unique color combinations',
      'minimalist': 'Minimalist architectural materials: concrete, stucco, metal panels, monochromatic colors (whites, grays, blacks)',
      'futuristic': 'Futuristic architectural materials: metallic surfaces, composite panels, large glass elements, LED lighting accents',
      'bohemian': 'Bohemian architectural materials: adobe, stucco, natural stone, warm earthy colors, artistic details',
      'parisian': 'Parisian architectural materials: limestone, brick facade, wrought-iron details, elegant neutral colors'
    };

    const styleDesc = styleDescriptions[designStyle as keyof typeof styleDescriptions] || `${designStyle} style architectural design`;

    return `MATERIAL TRANSFORMATION ONLY: Transform the building's exterior materials and colors to ${styleDesc}. 

CRITICAL RULES:
- Keep the EXACT same building shape, size, and proportions
- Maintain identical roof shape and roofline  
- Keep all windows in same positions and sizes
- Keep doors in same positions and sizes
- Only change: wall materials, roof materials, window frame colors, door colors, trim colors
- Apply photorealistic textures appropriate to the style
- Maintain the same camera angle and perspective
- Result should look like the same building built with different materials

This is a material "re-skin" not a building redesign. The structure must remain identical.`;
  }
}