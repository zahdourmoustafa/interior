import Replicate from "replicate";
import { put } from "@vercel/blob";

// Initialize Replicate with proper error handling
const getReplicate = () => {
  const token = process.env.REPLICATE_API_TOKEN;

  console.log("🔍 Replicate token check:");
  console.log("- Token exists:", !!token);
  console.log(
    "- Token value:",
    token ? `${token.substring(0, 8)}...` : "undefined"
  );

  if (!token) {
    console.error("❌ REPLICATE_API_TOKEN is not set in environment variables");
    console.error(
      "Available env vars:",
      Object.keys(process.env).filter((key) => key.includes("REPLICATE"))
    );
    throw new Error(
      "Replicate API token is required. Please check your .env file."
    );
  }

  return new Replicate({
    auth: token,
  });
};

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

export class ReplicateService {
  private static readonly MODEL_ID =
    "adirik/interior-design:76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38";

  private static readonly SKETCH_TO_REALITY_MODEL_ID =
    "adirik/interior-design:76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38";

  private static readonly IMAGEN_4_FAST_MODEL_ID =
    "google/imagen-4-fast";

  static async generateInteriorDesign(
    input: GenerateImageInput
  ): Promise<GenerateImageOutput> {
    try {
      console.log("🎨 Starting interior design generation:", {
        roomType: input.roomType,
        designStyle: input.designStyle,
        imageUrl: input.imageUrl.substring(0, 50) + "...",
      });

      const replicateClient = getReplicate();
      const output = (await replicateClient.run(this.MODEL_ID, {
        input: {
          image: input.imageUrl,
          prompt:
            input.prompt ||
            this.generateDefaultPrompt(input.roomType, input.designStyle),
          guidance_scale: 12, // Increased from 15 for better quality
          negative_prompt:
            "lowres, watermark, banner, logo, watermark, contactinfo, text, deformed, blurry, blur, out of focus, out of frame, surreal, extra, ugly, upholstered walls, fabric walls, plush walls, mirror, mirrored, functional, realistic, poor quality, distorted, low quality, pixelated, noise, artifacts, compression artifacts, jpeg artifacts, blur, soft, unfocused, hazy, low resolution, grainy, noisy, text, writing, watermark, logo, oversaturation, over saturation, over shadow",
          prompt_strength: 0.85, // Increased from 0.8 for stronger style application
          num_inference_steps: 75, // Increased from 50 for higher quality
          width: 1024, // Set explicit width for higher resolution
          height: 1024, // Set explicit height for higher resolution
          scheduler: "DPMSolverMultistep", // Better scheduler for quality
          seed: Math.floor(Math.random() * 1000000), // Random seed for variety
        },
      })) as unknown;

      // Handle the output - it could be a URL string, array, or URL object
      let imageUrl: string;
      if (typeof output === "string") {
        imageUrl = output;
      } else if (Array.isArray(output) && output.length > 0) {
        imageUrl = output[0];
      } else if (output && typeof output === "object") {
        // Handle URL object from Replicate
        const outputObj = output as Record<string, unknown>;
        if ("href" in outputObj && typeof outputObj.href === "string") {
          imageUrl = outputObj.href;
        } else if ("url" in outputObj) {
          const urlValue = outputObj.url;
          imageUrl =
            typeof urlValue === "function" ? urlValue() : String(urlValue);
        } else {
          // Try to convert to string
          imageUrl = String(output);
        }
      } else {
        throw new Error("Unexpected output format from Replicate");
      }

      console.log("✅ Generation completed:", imageUrl);

      return {
        jobId: `replicate_${Date.now()}`,
        imageUrl,
        status: "completed",
      };
    } catch (error) {
      console.error("❌ Replicate generation failed:", error);
      return {
        jobId: `failed_${Date.now()}`,
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
      console.log("🏠 Starting sketch-to-reality generation:", {
        roomType: input.roomType,
        designStyle: input.designStyle,
        imageUrl: input.imageUrl.substring(0, 50) + "...",
      });

      const replicateClient = getReplicate();
      const output = (await replicateClient.run(this.SKETCH_TO_REALITY_MODEL_ID, {
        input: {
          image: input.imageUrl,
          prompt:
            input.prompt ||
            this.generateSketchToRealityPrompt(input.roomType, input.designStyle),
          guidance_scale: 7.5, // Lower guidance for more creative interpretation
          negative_prompt:
            "lowres, watermark, banner, logo, watermark, contactinfo, text, deformed, blurry, blur, out of focus, out of frame, surreal, extra, ugly, sketch, drawing, line art, cartoon, anime, illustration, painting, artistic, low quality, pixelated, noise, artifacts, compression artifacts, jpeg artifacts, blur, soft, unfocused, hazy, low resolution, grainy, noisy, text, writing, watermark, logo, oversaturation, over saturation, over shadow",
          prompt_strength: 0.85, // Stronger style application for sketch conversion
          num_inference_steps: 75, // Higher quality for sketch-to-reality
          width: 1024, // High resolution
          height: 1024, // High resolution
          scheduler: "DPMSolverMultistep", // Better scheduler for quality
          seed: Math.floor(Math.random() * 1000000), // Random seed for variety
        },
      })) as unknown;

      // Handle the output - it could be a URL string, array, or URL object
      let imageUrl: string;
      
      if (typeof output === "string") {
        imageUrl = output;
      } else if (Array.isArray(output) && output.length > 0) {
        imageUrl = output[0];
      } else if (output && typeof output === "object") {
        // Handle URL object from Replicate
        const outputObj = output as Record<string, unknown>;
        if ("href" in outputObj && typeof outputObj.href === "string") {
          imageUrl = outputObj.href;
        } else if ("url" in outputObj) {
          const urlValue = outputObj.url;
          imageUrl =
            typeof urlValue === "function" ? urlValue() : String(urlValue);
        } else {
          // Try to convert to string
          imageUrl = String(output);
        }
      } else {
        throw new Error("Unexpected output format from Replicate");
      }

      console.log("✅ Sketch-to-reality generation completed:", imageUrl);

      return {
        jobId: `sketch_replicate_${Date.now()}`,
        imageUrl,
        status: "completed",
      };
    } catch (error) {
      console.error("❌ Sketch-to-reality generation failed:", error);
      return {
        jobId: `sketch_failed_${Date.now()}`,
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
      console.log("🎨 Starting text-to-design generation:", {
        prompt: input.prompt.substring(0, 100) + "...",
        aspectRatio: input.aspectRatio || "1:1",
      });

      const replicateClient = getReplicate();
      const output = (await replicateClient.run(this.IMAGEN_4_FAST_MODEL_ID, {
        input: {
          prompt: input.prompt,
          aspect_ratio: input.aspectRatio || "1:1",
        },
      })) as unknown;

      // Handle the output - it could be a URL string, array, or URL object
      let imageUrl: string;
      
      if (typeof output === "string") {
        imageUrl = output;
      } else if (Array.isArray(output) && output.length > 0) {
        imageUrl = output[0];
      } else if (output && typeof output === "object") {
        // Handle URL object from Replicate
        const outputObj = output as Record<string, unknown>;
        if ("href" in outputObj && typeof outputObj.href === "string") {
          imageUrl = outputObj.href;
        } else if ("url" in outputObj) {
          const urlValue = outputObj.url;
          imageUrl =
            typeof urlValue === "function" ? urlValue() : String(urlValue);
        } else {
          // Try to convert to string
          imageUrl = String(output);
        }
      } else {
        throw new Error("Unexpected output format from Replicate");
      }

      console.log("✅ Text-to-design generation completed:", imageUrl);

      return {
        jobId: `text_design_replicate_${Date.now()}`,
        imageUrl,
        status: "completed",
      };
    } catch (error) {
      console.error("❌ Text-to-design generation failed:", error);
      return {
        jobId: `text_design_failed_${Date.now()}`,
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
        "living room with comfortable seating, coffee table, and ambient lighting",
      bedroom:
        "bedroom with a comfortable bed, nightstands, and relaxing atmosphere",
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

    return `A beautifully designed ${roomDesc} featuring ${styleDesc}. The space should be well-lit with natural light, professionally photographed, high-resolution, 8K quality, photorealistic, detailed textures, perfect lighting, and showcase excellent interior design principles with attention to color harmony, furniture placement, and overall aesthetic appeal. Ultra-detailed, sharp focus, professional interior photography.`;
  }

  private static generateSketchToRealityPrompt(
    roomType: string,
    designStyle: string
  ): string {
    const roomPrompts = {
      "living-room":
        "living room with comfortable seating, coffee table, and ambient lighting",
      bedroom:
        "bedroom with a comfortable bed, nightstands, and relaxing atmosphere",
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

    return `A beautifully designed ${roomDesc} featuring ${styleDesc}. The space should be well-lit with natural light, professionally photographed, high-resolution, 8K quality, photorealistic, detailed textures, perfect lighting, and showcase excellent interior design principles with attention to color harmony, furniture placement, and overall aesthetic appeal. Ultra-detailed, sharp focus, professional interior photography.`;
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
