import { GoogleGenAI, Part } from "@google/genai";
import { put } from "@vercel/blob";
import mime from "mime";

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

  return new GoogleGenAI({
    apiKey: apiKey,
  });
};

async function urlToGenerativePart(url: string, mimeType: string): Promise<Part> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return {
    inlineData: {
      data: Buffer.from(buffer).toString("base64"),
      mimeType,
    },
  };
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
  roomType: string;
  designStyle: string;
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

      const config = {
        responseModalities: ["IMAGE", "TEXT"],
        responseMimeType: "text/plain",
      };

      const generationConfig = {
        quality: "hd", // Use 'hd' for higher quality
        responseMimeType: "image/png", // Request a high-quality PNG
        temperature: 0.4, // Lower temperature for more predictable, less "creative" results
        negativePrompt: [
          "blurry, grainy, low-resolution, unrealistic, cartoonish, discolored, watermark, signature, text",
        ],
      };

      const model = this.IMAGE_GENERATION_MODEL;
      const contents = [
        {
          role: "user",
          parts: [
            imagePart,
            {
              text:
                input.prompt ||
                this.generateDefaultPrompt(input.roomType, input.designStyle),
            },
          ],
        },
      ];

      const response = await ai.models.generateContentStream({
        model,
        config,
        generationConfig, // Add the detailed generation config
        contents,
      });

      for await (const chunk of response) {
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

  static async generateSketchToReality(
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

      const config = {
        responseModalities: ["IMAGE", "TEXT"],
        responseMimeType: "text/plain",
      };

      const generationConfig = {
        quality: "hd", // Use 'hd' for higher quality
        responseMimeType: "image/png", // Request a high-quality PNG
        temperature: 0.4, // Lower temperature for more predictable, less "creative" results
        negativePrompt: [
          "blurry, grainy, low-resolution, unrealistic, cartoonish, discolored, watermark, signature, text",
        ],
      };

      const model = this.IMAGE_GENERATION_MODEL;
      const contents = [
        {
          role: "user",
          parts: [
            imagePart,
            {
              text:
                input.prompt ||
                this.generateSketchToRealityPrompt(
                  input.roomType,
                  input.designStyle
                ),
            },
          ],
        },
      ];

      const response = await ai.models.generateContentStream({
        model,
        config,
        generationConfig, // Add the detailed generation config
        contents,
      });

      for await (const chunk of response) {
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

      const config = {
        responseModalities: ["IMAGE", "TEXT"],
        responseMimeType: "text/plain",
      };
      const model = this.IMAGE_GENERATION_MODEL;
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

      const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
      });

      for await (const chunk of response) {
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

    return `Act as an elite interior photographer and a world-class interior designer. Your task is to capture and redesign the provided image of ${roomDesc}, transforming it into ${styleDesc}.

Preserve the original architectural layout, furniture placement, and core structure with absolute precision. Your modifications must focus exclusively on the surface-level elements: textures, colors, lighting, and decorative objects.

The final output must be an ultra-realistic, 8K resolution photograph. It should look like it was taken with a professional DSLR camera with a high-quality lens, showcasing exceptional detail, perfect lighting, and hyper-realistic material textures. Pay close attention to how light interacts with surfaces, creating subtle reflections and soft shadows. The image must be indistinguishable from a real-world photograph published in a top-tier interior design magazine. Do not add, remove, or reposition any furniture or structural features.`;
  }

  private static generateSketchToRealityPrompt(
    roomType: string,
    designStyle: string
  ): string {
    const roomPrompts = {
      "living-room":
        "living room with comfortable seating, coffee table, and ambient lighting",
      bedroom:
        "bedroom with a comfortable bed,. nightstands, and relaxing atmosphere",
      kitchen:
        "kitchen with modern appliances, countertops, and functional layout",
      "dining-room":
        "dining room with dining table, chairs, and elegant atmosphere",
      "home-office":
        "home office with desk, chair, and productive workspace setup",
      "bath-room": "bathroom with fixtures, vanity, and clean modern design",
      "game-room": "game room with entertainment setup and comfortable seating",
      "kids-room":
        "kids room with playful elements, storage, and child-friendly furniture",
    };

    const stylePrompts = {
      scandinavian:
        "Scandinavian style with light wood, neutral colors, minimalist furniture, and natural textures",
      christmas:
        "Christmas themed with warm colors, festive decorations, cozy lighting, and holiday elements",
      japanese:
        "Japanese style with clean lines, natural materials, zen elements, and minimalist aesthetic",
      eclectic:
        "Eclectic style with mixed patterns, vibrant colors, unique furniture pieces, and artistic elements",
      minimalist:
        "Minimalist style with clean lines, neutral palette, simple furniture, and uncluttered space",
      futuristic:
        "Futuristic style with sleek surfaces, modern technology, LED lighting, and contemporary materials",
      bohemian:
        "Bohemian style with rich textures, warm colors, plants, and eclectic decorative elements",
      parisian:
        "Parisian style with elegant furniture, classic details, sophisticated colors, and refined atmosphere",
    };

    const roomDesc =
      roomPrompts[roomType as keyof typeof roomPrompts] || "interior space";
    const styleDesc =
      stylePrompts[designStyle as keyof typeof stylePrompts] || "modern style";

    return `Transform this sketch of a ${roomDesc} into a photorealistic image in a ${styleDesc}. The space should be well-lit with natural light, professionally photographed, high-resolution, 8K quality, photorealistic, detailed textures, perfect lighting, and showcase excellent interior design principles with attention to color harmony, furniture placement, and overall aesthetic appeal. Ultra-detailed, sharp focus, professional interior photography.`;
  }

  static async uploadImageToBlob(file: File): Promise<string> {
    try {
      // Generate unique filename to avoid conflicts
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split(".").pop() || "jpg";
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