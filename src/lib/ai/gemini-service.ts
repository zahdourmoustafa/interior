import { GoogleGenerativeAI as GoogleGenAI, Part } from "@google/generative-ai";
import { put } from "@vercel/blob";
import mime from "mime";
import { furnishEmptySpaceSystemPrompt } from "./prompts/furnish-prompt";

// Extended interface for Gemini 2.0 image generation that includes responseModalities
interface ExtendedGenerationConfig {
  temperature?: number;
  responseModalities?: string[];
  maxOutputTokens?: number;
  topK?: number;
  topP?: number;
  candidateCount?: number;
  stopSequences?: string[];
}

// Initialize Google AI with proper error handling
const getGoogleAI = () => {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  console.log("🔍 Google AI API key check:");
  console.log("- API key exists:", !!apiKey);
  console.log(
    "- API key value:",
    apiKey ? `${apiKey.substring(0, 8)}...` : "undefined"
  );

  if (!apiKey) {
    console.error("❌ GOOGLE_AI_API_KEY is not set in environment variables");
    console.error(
      "Available env vars:",
      Object.keys(process.env).filter((key) => key.includes("GOOGLE"))
    );
    throw new Error(
      "Google AI API key is required. Please check your .env file."
    );
  }

  return new GoogleGenAI(apiKey);
};

async function urlToGenerativePart(url: string, mimeType: string): Promise<Part> {
  // Validate URL type
  if (url.startsWith('blob:')) {
    throw new Error(
      'Blob URLs cannot be processed on the server. Please wait for the image upload to complete before generating.'
    );
  }

  if (url.startsWith('data:')) {
    // Handle data URLs
    const base64Data = url.split(',')[1];
    return {
      inlineData: {
        data: base64Data,
        mimeType,
      },
    };
  }

  // Handle regular HTTP/HTTPS URLs
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error(
      `Invalid URL format: ${url}. Only HTTP, HTTPS, and data URLs are supported.`
    );
  }

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    return {
      inlineData: {
        data: Buffer.from(buffer).toString("base64"),
        mimeType,
      },
    };
  } catch (error) {
    console.error('❌ Failed to fetch image from URL:', url, error);
    throw new Error(
      `Failed to load image from URL. Please ensure the image is accessible and try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

async function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  try {
    // Handle blob URLs
    if (url.startsWith('blob:')) {
      console.warn('⚠️ Cannot get dimensions from blob URL on server, using fallback dimensions');
      return { width: 1024, height: 1024 };
    }

    // Handle data URLs
    if (url.startsWith('data:')) {
      const base64Data = url.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const uint8Array = new Uint8Array(buffer);
      
      // Try to parse dimensions from the data
      return parseDimensionsFromImageData(uint8Array);
    }

    // Handle regular HTTP/HTTPS URLs
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      console.warn('⚠️ Invalid URL format for dimensions, using fallback');
      return { width: 1024, height: 1024 };
    }

    const response = await fetch(url);
    if (!response.ok) {
      console.warn('⚠️ Failed to fetch image for dimensions, using fallback');
      return { width: 1024, height: 1024 };
    }
    
    const buffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    return parseDimensionsFromImageData(uint8Array);
  } catch (error) {
    console.error("Failed to get image dimensions:", error);
    return { width: 1024, height: 1024 };
  }
}

function parseDimensionsFromImageData(uint8Array: Uint8Array): { width: number; height: number } {
  // Check if it's a PNG
  if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47) {
    const width = (uint8Array[16] << 24) | (uint8Array[17] << 16) | (uint8Array[18] << 8) | uint8Array[19];
    const height = (uint8Array[20] << 24) | (uint8Array[21] << 16) | (uint8Array[22] << 8) | uint8Array[23];
    return { width, height };
  }
  
  // Check if it's a JPEG
  if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8) {
    let i = 2;
    while (i < uint8Array.length) {
      if (uint8Array[i] === 0xFF && uint8Array[i + 1] === 0xC0) {
        const height = (uint8Array[i + 5] << 8) | uint8Array[i + 6];
        const width = (uint8Array[i + 7] << 8) | uint8Array[i + 8];
        return { width, height };
      }
      i++;
    }
  }
  
  // Default fallback if we can't parse the dimensions
  return { width: 1024, height: 1024 };
}

function getMimeTypeFromUrl(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    if (extension) {
        const mimeType = mime.getType(extension);
        if (mimeType) {
            return mimeType;
        }
    }
    // Fallback for unknown extensions
    return 'image/jpeg';
}

export interface GenerateImageInput {
  imageUrl: string;
  roomType?: string;
  designStyle?: string;
  prompt?: string;
}

export interface GenerateImageOutput {
  jobId: string;
  imageUrl?: string;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
}

export class GeminiService {
  private static readonly IMAGE_GENERATION_MODEL =
    "gemini-2.0-flash-preview-image-generation";
  private static readonly TEXT_MODEL = "gemini-2.0-flash";

  static async generateInteriorDesign(
    input: GenerateImageInput
  ): Promise<GenerateImageOutput> {
    try {
      console.log("🎨 Starting interior design generation with Gemini:", {
        roomType: input.roomType,
        designStyle: input.designStyle,
        imageUrl: input.imageUrl.substring(0, 50) + "...",
      });

      const ai = getGoogleAI();

      const imagePart = await urlToGenerativePart(
        input.imageUrl,
        getMimeTypeFromUrl(input.imageUrl)
      );

      const model = ai.getGenerativeModel({
        model: this.IMAGE_GENERATION_MODEL,
        generationConfig: {
          temperature: 0.4,
          responseModalities: ["TEXT", "IMAGE"],
        } as ExtendedGenerationConfig,
      });

      const contents = [
        {
          role: "user",
          parts: [
            imagePart,
                         {
               text: this.generateDefaultPrompt(input.roomType!, input.designStyle!),
             },
          ],
        },
      ];

      const response = await model.generateContentStream({
        contents,
      });

      for await (const chunk of response.stream) {
        if (
          !chunk.candidates ||
          !chunk.candidates[0].content ||
          !chunk.candidates[0].content.parts
        ) {
          continue;
        }
        if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
          const inlineData = chunk.candidates[0].content.parts[0].inlineData;
          const imageBytes = Buffer.from(inlineData.data || "", "base64");
          const blob = await put(
            `gemini-generated-${Date.now()}.jpg`,
            imageBytes,
            {
              access: "public",
              token: process.env.BLOB_READ_WRITE_TOKEN!,
            }
          );

          console.log("✅ Gemini generation completed:", blob.url);

          return {
            jobId: `gemini_${Date.now()}`,
            imageUrl: blob.url,
            status: "completed",
          };
        }
      }

      throw new Error("No images generated from Gemini");
    } catch (error) {
      console.error("❌ Gemini generation failed:", error);
      return {
        jobId: `gemini_failed_${Date.now()}`,
        status: "failed",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  static async generateExteriorDesign(
    input: GenerateImageInput
  ): Promise<GenerateImageOutput> {
    try {
      console.log("🏡 Starting exterior design generation with Gemini:", {
        designStyle: input.designStyle,
        imageUrl: input.imageUrl.substring(0, 50) + "...",
      });

      const ai = getGoogleAI();

      const imagePart = await urlToGenerativePart(
        input.imageUrl,
        getMimeTypeFromUrl(input.imageUrl)
      );

      const model = ai.getGenerativeModel({
        model: this.IMAGE_GENERATION_MODEL,
        generationConfig: {
          temperature: 0.4,
          responseModalities: ["TEXT", "IMAGE"],
        } as ExtendedGenerationConfig,
      });

      const contents = [
        {
          role: "user",
          parts: [
            imagePart,
            {
              text: this.generateExteriorPrompt(input.designStyle!),
            },
          ],
        },
      ];

      const response = await model.generateContentStream({
        contents,
      });

      for await (const chunk of response.stream) {
        if (
          !chunk.candidates ||
          !chunk.candidates[0].content ||
          !chunk.candidates[0].content.parts
        ) {
          continue;
        }
        if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
          const inlineData = chunk.candidates[0].content.parts[0].inlineData;
          const imageBytes = Buffer.from(inlineData.data || "", "base64");
          const blob = await put(
            `gemini-exterior-${Date.now()}.jpg`,
            imageBytes,
            {
              access: "public",
              token: process.env.BLOB_READ_WRITE_TOKEN!,
            }
          );

          console.log("✅ Gemini exterior generation completed:", blob.url);

          return {
            jobId: `gemini_exterior_${Date.now()}`,
            imageUrl: blob.url,
            status: "completed",
          };
        }
      }

      throw new Error("No exterior images generated from Gemini");
    } catch (error) {
      console.error("❌ Gemini exterior generation failed:", error);
      return {
        jobId: `gemini_exterior_failed_${Date.now()}`,
        status: "failed",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }  static async generateSketchToReality(
    input: GenerateImageInput
  ): Promise<GenerateImageOutput> {
    try {
      console.log("🏠 Starting sketch-to-reality generation with Gemini:", {
        roomType: input.roomType,
        designStyle: input.designStyle,
        imageUrl: input.imageUrl.substring(0, 50) + "...",
      });

      const ai = getGoogleAI();

      const imagePart = await urlToGenerativePart(
        input.imageUrl,
        getMimeTypeFromUrl(input.imageUrl)
      );

      const model = ai.getGenerativeModel({
        model: this.IMAGE_GENERATION_MODEL,
        generationConfig: {
          temperature: 0.4,
          responseModalities: ["TEXT", "IMAGE"],
        } as ExtendedGenerationConfig,
      });

      const contents = [
        {
          role: "user",
          parts: [
            imagePart,
                         {
               text: this.generateSketchToRealityPrompt(
                 input.roomType || '',
                 input.designStyle || ''
               ),
             },
          ],
        },
      ];

      const response = await model.generateContentStream({
        contents,
      });

      for await (const chunk of response.stream) {
        if (
          !chunk.candidates ||
          !chunk.candidates[0].content ||
          !chunk.candidates[0].content.parts
        ) {
          continue;
        }
        if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
          const inlineData = chunk.candidates[0].content.parts[0].inlineData;
          const imageBytes = Buffer.from(inlineData.data || "", "base64");
          const blob = await put(
            `gemini-sketch-${Date.now()}.jpg`,
            imageBytes,
            {
              access: "public",
              token: process.env.BLOB_READ_WRITE_TOKEN!,
            }
          );

          console.log(
            "✅ Gemini sketch-to-reality generation completed:",
            blob.url
          );

          return {
            jobId: `gemini_sketch_${Date.now()}`,
            imageUrl: blob.url,
            status: "completed",
          };
        }
      }
      throw new Error("No images generated from Gemini");
    } catch (error) {
      console.error("❌ Gemini sketch-to-reality generation failed:", error);
      return {
        jobId: `gemini_sketch_failed_${Date.now()}`,
        status: "failed",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  static async generateTextToDesign(
    input: { prompt: string; aspectRatio?: string }
  ): Promise<GenerateImageOutput> {
    try {
      console.log("🎨 Starting text-to-design generation with Gemini:", {
        prompt: input.prompt.substring(0, 100) + "...",
        aspectRatio: input.aspectRatio || "1:1",
      });

      const ai = getGoogleAI();

                                                       const model = ai.getGenerativeModel({
           model: this.IMAGE_GENERATION_MODEL,
           generationConfig: {
             responseModalities: ["TEXT", "IMAGE"],
           } as ExtendedGenerationConfig,
         });

      const contents = [
        {
          role: "user",
          parts: [
            {
              text: input.prompt,
            },
          ],
        },
      ];

      const response = await model.generateContentStream({
        contents,
      });

      for await (const chunk of response.stream) {
        if (
          !chunk.candidates ||
          !chunk.candidates[0].content ||
          !chunk.candidates[0].content.parts
        ) {
          continue;
        }
        if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
          const inlineData = chunk.candidates[0].content.parts[0].inlineData;
          const imageBytes = Buffer.from(inlineData.data || "", "base64");
          const blob = await put(
            `gemini-text-design-${Date.now()}.jpg`,
            imageBytes,
            {
              access: "public",
              token: process.env.BLOB_READ_WRITE_TOKEN!,
            }
          );

          console.log(
            "✅ Gemini text-to-design generation completed:",
            blob.url
          );

          return {
            jobId: `gemini_text_design_${Date.now()}`,
            imageUrl: blob.url,
            status: "completed",
          };
        }
      }
      throw new Error("No images generated from Gemini");
    } catch (error) {
      console.error("❌ Gemini text-to-design generation failed:", error);
      return {
        jobId: `gemini_text_design_failed_${Date.now()}`,
        status: "failed",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  static async furnishEmptySpace(
    input: GenerateImageInput
  ): Promise<GenerateImageOutput> {
    try {
      console.log("🛋️ Starting empty space furnishing with Gemini:", {
        imageUrl: input.imageUrl.substring(0, 50) + "...",
        prompt: input.prompt,
      });

      const ai = getGoogleAI();

      const imagePart = await urlToGenerativePart(
        input.imageUrl,
        getMimeTypeFromUrl(input.imageUrl)
      );

                           const model = ai.getGenerativeModel({
          model: this.IMAGE_GENERATION_MODEL,
          generationConfig: {
            temperature: 0.5,
            responseModalities: ["TEXT", "IMAGE"],
          } as ExtendedGenerationConfig,
        });

      const fullPrompt = `${furnishEmptySpaceSystemPrompt}\n\nUser Prompt: "${input.prompt}"`;
      
      const contents = [
        {
          role: "user",
          parts: [
            imagePart,
            {
              text: fullPrompt,
            },
          ],
        },
      ];

      const response = await model.generateContentStream({
        contents,
      });

      for await (const chunk of response.stream) {
        if (
          !chunk.candidates ||
          !chunk.candidates[0].content ||
          !chunk.candidates[0].content.parts
        ) {
          continue;
        }
        if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
          const inlineData = chunk.candidates[0].content.parts[0].inlineData;
          const imageBytes = Buffer.from(inlineData.data || "", "base64");
          const blob = await put(
            `gemini-furnished-${Date.now()}.jpg`,
            imageBytes,
            {
              access: "public",
              token: process.env.BLOB_READ_WRITE_TOKEN!,
            }
          );

          console.log("✅ Gemini furnishing completed:", blob.url);

          return {
            jobId: `gemini_furnished_${Date.now()}`,
            imageUrl: blob.url,
            status: "completed",
          };
        }
      }

      throw new Error("No images generated from Gemini");
    } catch (error) {
      console.error("❌ Gemini furnishing failed:", error);
      return {
        jobId: `gemini_furnished_failed_${Date.now()}`,
        status: "failed",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  static async removeObject(
    input: { imageUrl: string; mask?: string; prompt: string }
  ): Promise<GenerateImageOutput> {
    try {
      console.log("🎨 Starting object removal with Gemini Flash 2.0:", {
        imageUrl: input.imageUrl.substring(0, 50) + "...",
        maskProvided: !!input.mask,
        prompt: input.prompt,
      });

      const ai = getGoogleAI();

      // Get original image dimensions
      const dimensions = await getImageDimensions(input.imageUrl);
      console.log("📐 Original image dimensions:", dimensions);

      // Process the original image
      const imagePart = await urlToGenerativePart(
        input.imageUrl,
        getMimeTypeFromUrl(input.imageUrl)
      );

      const parts: Part[] = [imagePart];

      // Process the mask image if provided
      if (input.mask) {
        const maskPart = await urlToGenerativePart(input.mask, "image/png");
        parts.push(maskPart);
      }

                                                       const model = ai.getGenerativeModel({
           model: this.IMAGE_GENERATION_MODEL,
           generationConfig: {
             temperature: 0.2,
             responseModalities: ["TEXT", "IMAGE"],
           } as ExtendedGenerationConfig,
         });

      // Create a prompt that instructs Gemini to remove the object marked by the red mask
      const removeObjectPrompt = `You are a professional photo editor specializing in object removal. 
        ${
          input.mask
            ? `I'm providing two images:
        1. The original image
        2. The same image with a red mask highlighting the object to be removed
        
        Please remove ONLY the object highlighted by the red mask and replace it with appropriate background content that matches the surrounding area.`
            : "I'm providing an image and a prompt."
        }
        
        The user has provided the following instruction: "${input.prompt}"

                 CRITICAL REQUIREMENTS:
         - ${
          input.mask
            ? "Remove ONLY the red-masked area"
            : "Follow the user's prompt to remove the object."
        }
         - The original image is ${dimensions.width}x${dimensions.height} pixels. Generate the output image with EXACTLY these same dimensions: ${dimensions.width}x${dimensions.height} pixels
         - MAINTAIN THE EXACT SAME IMAGE DIMENSIONS, ASPECT RATIO, AND RESOLUTION as the original image
         - Use inpainting to fill the removed area naturally with content that matches the surrounding environment
         - Preserve the exact same perspective, lighting, shadows, and photographic style as the original
         - Ensure seamless blending with no visible artifacts, seams, or inconsistencies
         - Do not crop, resize, add borders, or alter the composition in any way
         - Keep all unmasked areas completely unchanged and identical to the original
         - Output dimensions must be exactly ${dimensions.width} pixels wide by ${dimensions.height} pixels tall
         
         Generate a photorealistic result that makes it appear as if the object was never there, while preserving every pixel of the original image dimensions and quality.`;

      parts.push({ text: removeObjectPrompt });

      const contents = [
        {
          role: "user",
          parts: parts,
        },
      ];

      const response = await model.generateContentStream({
        contents,
      });

      for await (const chunk of response.stream) {
        if (
          !chunk.candidates ||
          !chunk.candidates[0].content ||
          !chunk.candidates[0].content.parts
        ) {
          continue;
        }
        if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
          const inlineData = chunk.candidates[0].content.parts[0].inlineData;
          const imageBytes = Buffer.from(inlineData.data || "", "base64");
          const blob = await put(
            `gemini-object-removed-${Date.now()}.png`,
            imageBytes,
            {
              access: "public",
              token: process.env.BLOB_READ_WRITE_TOKEN!,
            }
          );

          console.log("✅ Gemini object removal completed:", blob.url);

          return {
            jobId: `gemini_removed_${Date.now()}`,
            imageUrl: blob.url,
            status: "completed",
          };
        }
      }

      throw new Error("No images generated from Gemini");
    } catch (error) {
      console.error("❌ Gemini object removal failed:", error);
      return {
        jobId: `gemini_removed_failed_${Date.now()}`,
        status: "failed",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private static generateDefaultPrompt(
    roomType: string,
    designStyle: string
  ): string {
    const roomPrompts = {
      "living-room":
        "a welcoming living room with comfortable seating, a central coffee table, and layered ambient lighting",
      bedroom:
        "a serene bedroom with a well-made bed, matching nightstands, and a relaxing, uncluttered atmosphere",
      kitchen:
        "a modern kitchen with high-end appliances, sleek countertops, and a highly functional and ergonomic layout",
      "dining-room":
        "an elegant dining room with a statement dining table, comfortable chairs, and sophisticated lighting",
      "home-office":
        "a productive home office with an ergonomic desk and chair, ample storage, and focused task lighting",
      "bath-room":
        "a clean and modern bathroom with premium fixtures, a stylish vanity, and spa-like qualities",
      "game-room":
        "an immersive game room with a large screen entertainment setup, comfortable seating, and atmospheric lighting",
      "kids-room":
        "a playful and organized kids' room with creative furniture, smart storage solutions, and child-friendly materials",
    };

    const stylePrompts = {
      scandinavian:
        "a Scandinavian style characterized by light-colored woods, a neutral color palette, minimalist yet cozy furniture, and an abundance of natural textures",
      christmas:
        "a festive Christmas theme with warm, inviting colors, elegant holiday decorations, cozy ambient lighting, and classic holiday motifs",
      japanese:
        "a Japanese style emphasizing clean lines, natural materials like bamboo and rice paper, Zen principles of simplicity, and a minimalist aesthetic",
      eclectic:
        "an Eclectic style featuring a curated mix of patterns, vibrant and bold colors, unique and contrasting furniture pieces, and artistic, expressive elements",
      minimalist:
        "a Minimalist style defined by ultra-clean lines, a strict neutral color palette, simple geometric forms, and a completely uncluttered and serene space",
      futuristic:
        "a Futuristic style with sleek, aerodynamic surfaces, integrated smart technology, dynamic LED lighting, and advanced composite materials",
      bohemian:
        "a Bohemian style that is rich in textures, warm and earthy colors, an abundance of plants, and an eclectic collection of global-inspired decorative items",
      parisian:
        "a Parisian style showcasing elegant, ornate furniture, classic architectural details, a sophisticated and muted color scheme, and a refined, timeless atmosphere",
    };

    const roomDesc =
      roomPrompts[roomType as keyof typeof roomPrompts] || "an interior space";
    const styleDesc = 
      stylePrompts[designStyle as keyof typeof stylePrompts] || "a modern style";

    return `Your task is to act as a photorealistic rendering engine. You will receive an image of a room and your job is to re-texture it according to a new design style.\n\n**NON-NEGOTIABLE DIRECTIVE: The single most important rule is to PRESERVE THE ORIGINAL IMAGE'S COMPOSITION. You are forbidden from altering the camera angle, perspective, zoom level, or position. The output image's geometry, layout, and framing must be IDENTICAL to the input image.**\n\nWith the camera position locked, you will then modify the following surface-level elements of the ${roomDesc} to match the new style of ${styleDesc}:\n- Textures and materials (e.g., wood, metal, fabric)\n- Colors and color palette\n- Lighting (e.g., ambient, task, natural)\n- Decorative objects (e.g., pillows, vases, art)\n\nDo not add, remove, or change the position of any furniture or architectural elements (walls, windows, doors). The final output must be an 8K, ultra-realistic photograph with exceptional detail and perfect lighting.`;
  }

  private static generateSketchToRealityPrompt(
    roomType: string,
    designStyle: string
  ): string {
    const roomPrompts = {
      "living-room":
        "a welcoming living room with comfortable seating, a central coffee table, and layered ambient lighting",
      bedroom:
        "a serene bedroom with a well-made bed, matching nightstands, and a relaxing, uncluttered atmosphere",
      kitchen:
        "a modern kitchen with high-end appliances, sleek countertops, and a highly functional and ergonomic layout",
      "dining-room":
        "an elegant dining room with a statement dining table, comfortable chairs, and sophisticated lighting",
      "home-office":
        "a productive home office with an ergonomic desk and chair, ample storage, and focused task lighting",
      "bath-room":
        "a clean and modern bathroom with premium fixtures, a stylish vanity, and spa-like qualities",
      "game-room":
        "an immersive game room with a large screen entertainment setup, comfortable seating, and atmospheric lighting",
      "kids-room":
        "a playful and organized kids' room with creative furniture, smart storage solutions, and child-friendly materials",
    };

    const stylePrompts = {
      scandinavian:
        "a Scandinavian style characterized by light-colored woods, a neutral color palette, minimalist yet cozy furniture, and an abundance of natural textures",
      christmas:
        "a festive Christmas theme with warm, inviting colors, elegant holiday decorations, cozy ambient lighting, and classic holiday motifs",
      japanese:
        "a Japanese style emphasizing clean lines, natural materials like bamboo and rice paper, Zen principles of simplicity, and a minimalist aesthetic",
      eclectic:
        "an Eclectic style featuring a curated mix of patterns, vibrant and bold colors, unique and contrasting furniture pieces, and artistic, expressive elements",
      minimalist:
        "a Minimalist style defined by ultra-clean lines, a strict neutral color palette, simple geometric forms, and a completely uncluttered and serene space",
      futuristic:
        "a Futuristic style with sleek, aerodynamic surfaces, integrated smart technology, dynamic LED lighting, and advanced composite materials",
      bohemian:
        "a Bohemian style that is rich in textures, warm and earthy colors, an abundance of plants, and an eclectic collection of global-inspired decorative items",
      parisian:
        "a Parisian style showcasing elegant, ornate furniture, classic architectural details, a sophisticated and muted color scheme, and a refined, timeless atmosphere",
    };

    const roomDesc =
      roomPrompts[roomType as keyof typeof roomPrompts] || "an interior space";
    const styleDesc = 
      stylePrompts[designStyle as keyof typeof stylePrompts] || "a modern style";

    return `Your task is to act as a photorealistic rendering engine. You will receive a line-art sketch of a room and your job is to transform it into a photorealistic, 8K image. Your output must be a high-quality, professional photograph of a real-world interior.\n\n**NON-NEGOTIABLE DIRECTIVE: The single most important rule is to PRESERVE THE ORIGINAL SKETCH'S COMPOSITION. You are forbidden from altering the camera angle, perspective, zoom level, or position. The output image's geometry, layout, and framing must be IDENTICAL to the input sketch.**\n\nWith the camera position locked, you will then render the following surface-level elements of the ${roomDesc} to match the new style of ${styleDesc}:\n- Textures and materials (e.g., wood, metal, fabric)\n- Colors and color palette\n- Lighting (e.g., ambient, task, natural)\n- Decorative objects (e.g., pillows, vases, art)\n\nDo not add, remove, or change the position of any furniture or architectural elements (walls, windows, doors). The final output must be an 8K, ultra-realistic photograph with exceptional detail and perfect lighting.`;
  }

  private static generateExteriorPrompt(designStyle: string): string {

    const exteriorMaterials = {
      scandinavian: "light wood siding, white trim, metal roofing",
      christmas: "traditional materials with festive decorations, warm lighting",
      japanese: "natural cedar wood, stone, traditional tiles",
      eclectic: "mixed materials - brick, wood, metal, stone",
      minimalist: "concrete, stucco, metal panels, glass",
      futuristic: "composite materials, metal cladding, smart glass",
      bohemian: "adobe, stucco, natural stone, colorful accents",
      parisian: "limestone, brick, wrought iron, slate",
    };

    
    const materialDesc = exteriorMaterials[designStyle as keyof typeof exteriorMaterials] || 
      "high-quality exterior materials suitable for the architectural style";

    return `CRITICAL INSTRUCTION: You are an ARCHITECTURAL MATERIAL TRANSFORMATION ENGINE. Your ONLY job is to change the materials, colors, and surface treatments of the EXACT building shown in the input image.

**ABSOLUTE CONSTRAINTS - VIOLATION WILL RESULT IN FAILURE:**
1. **IDENTICAL GEOMETRY**: The building's shape, size, proportions, and structural form must remain 100% unchanged
2. **IDENTICAL COMPOSITION**: Same camera angle, perspective, framing, and viewpoint as the original
3. **IDENTICAL ARCHITECTURE**: Same roof shape, window positions, door locations, and building outline
4. **IDENTICAL LANDSCAPING LAYOUT**: Same trees, plants, and hardscape positions (only change materials/colors)

**YOUR TRANSFORMATION SCOPE - MATERIALS & SURFACES ONLY:**
- **Wall Surfaces**: Replace with ${materialDesc} while keeping exact same wall shapes and dimensions
- **Roof Materials**: Change roof material/color to match ${designStyle} style but keep identical roof shape and angles  
- **Window Frames**: Update frame materials/colors only - same size, position, and quantity of windows
- **Door Materials**: Change door material/color only - same door size and position
- **Trim & Details**: Apply ${designStyle} appropriate trim materials while maintaining building's original architectural lines
- **Color Palette**: Apply ${designStyle} color scheme to all surfaces
- **Surface Textures**: Add realistic material textures (wood grain, stone, brick, etc.)

**WHAT YOU CANNOT CHANGE:**
- Building height, width, or depth
- Roof shape or roofline
- Window sizes, positions, or quantities  
- Door sizes or positions
- Overall building footprint or silhouette
- Camera angle or perspective
- Basic landscaping layout

**TECHNICAL EXECUTION:**
- Think of this as "re-skinning" the building with new materials
- The building should look like it was originally built with ${designStyle} materials
- Maintain all original architectural proportions and structural elements
- Apply photorealistic material textures appropriate to ${designStyle}
- Use natural lighting that enhances the new materials

REMEMBER: You are NOT creating a new building. You are applying a new "material skin" to the EXACT existing building structure. The result should be the same building that appears to have been originally constructed using ${designStyle} materials and design principles.`;
  }  static async uploadImageToBlob(
    file: Buffer,
    filename: string
  ): Promise<string> {
    try {
      // Generate unique filename to avoid conflicts
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const extension = filename.split(".").pop() || "jpg";
      const uniqueFilename = `interior-design-${timestamp}-${randomId}.${extension}`;

      const blob = await put(uniqueFilename, file, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN!,
      });

      console.log("✅ Image uploaded to blob:", blob.url);
      return blob.url;
    } catch (error) {
      console.error("❌ Blob upload failed:", error);
      throw new Error("Failed to upload image to cloud storage");
    }
  }
}
