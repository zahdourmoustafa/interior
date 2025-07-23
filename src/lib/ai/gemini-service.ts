import { GoogleGenerativeAI as GoogleGenAI, Part } from "@google/generative-ai";
import { put } from "@vercel/blob";
import mime from "mime";
import { furnishEmptySpaceSystemPrompt } from "./prompts/furnish-prompt";

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

      const generationConfig = {
        quality: "hd", // Use 'hd' for higher quality
        responseMimeType: "image/png", // Request a high-quality PNG
        temperature: 0.4, // Lower temperature for more predictable, less "creative" results
        negativePrompt: [
          "blurry, grainy, low-resolution, unrealistic, cartoonish, discolored, watermark, signature, text",
        ],
      };

      const model = ai.getGenerativeModel({
        model: this.IMAGE_GENERATION_MODEL,
        generationConfig,
      });

      const contents = [
        {
          role: "user",
          parts: [
            imagePart,
            {
              text:
                input.prompt ||
                this.generateDefaultPrompt(input.roomType!, input.designStyle!),
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

      const generationConfig = {
        quality: "hd", // Use 'hd' for higher quality
        responseMimeType: "image/png", // Request a high-quality PNG
        temperature: 0.4, // Lower temperature for more predictable, less "creative" results
        negativePrompt: [
          "blurry, grainy, low-resolution, unrealistic, cartoonish, discolored, watermark, signature, text",
        ],
      };

      const model = ai.getGenerativeModel({
        model: this.IMAGE_GENERATION_MODEL,
        generationConfig,
      });

      const contents = [
        {
          role: "user",
          parts: [
            imagePart,
            {
              text:
                input.prompt ||
                this.generateSketchToRealityPrompt(
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

      const generationConfig = {
        quality: "hd",
        responseMimeType: "image/png",
        temperature: 0.5,
        negativePrompt: [
          "blurry, grainy, low-resolution, unrealistic, cartoonish, discolored, watermark, signature, text",
        ],
      };

      const model = ai.getGenerativeModel({
        model: this.IMAGE_GENERATION_MODEL,
        generationConfig,
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

      const generationConfig = {
        quality: "hd", // Use 'hd' for higher quality
        responseMimeType: "image/png", // Request a high-quality PNG
        temperature: 0.2, // Lower temperature for more predictable results
        negativePrompt: [
          "blurry, grainy, low-resolution, unrealistic, cartoonish, discolored, watermark, signature, text",
        ],
      };

      const model = ai.getGenerativeModel({
        model: this.IMAGE_GENERATION_MODEL,
        generationConfig,
      });

      // Create a prompt that instructs Gemini to remove the object marked by the red mask
      const removeObjectPrompt = `\n        You are a professional photo editor specializing in object removal. \n        ${
          input.mask
            ? `I'm providing two images:\n        1. The original image\n        2. The same image with a red mask highlighting the object to be removed\n        \n        Please remove ONLY the object highlighted by the red mask and replace it with appropriate background content that matches the surrounding area.`
            : "I'm providing an image and a prompt."
        }\n        \n        The user has provided the following instruction: "${input.prompt}"\n\n        Important requirements:\n        - ${
          input.mask
            ? "Remove ONLY the red-masked area"
            : "Follow the user's prompt to remove the object."
        }\n        - Use inpainting to fill the removed area naturally\n        - Maintain the exact same perspective, lighting, and style as the original image\n        - Ensure the result looks completely natural with no artifacts\n        - Do not alter any other part of the image\n        - Preserve the original image dimensions and quality\n        \n        Generate a photorealistic result that makes it appear as if the object was never there.\n      `;

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

  static async uploadImageToBlob(
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