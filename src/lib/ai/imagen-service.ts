
import { GoogleGenAI } from "@google/genai";
import { put } from "@vercel/blob";
import { ReplicateService } from "./replicate-service";

const getGoogleAI = () => {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export interface GenerateTextToDesignInput {
  prompt: string;
  numberOfImages?: number;
}

export interface GenerateTextToDesignOutput {
  jobId: string;
  imageUrls: string[];
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
}

export class ImagenService {
  private static readonly MODEL_ID = "imagen-4.0-generate-preview-06-06";

  static async generateTextToDesign(
    input: GenerateTextToDesignInput
  ): Promise<GenerateTextToDesignOutput> {
    try {
      console.log("🎨 Starting text-to-design generation with Imagen 2:", {
        prompt: input.prompt.substring(0, 100) + "...",
      });

      const ai = getGoogleAI();
      const response = await ai.models.generateImages({
        model: this.MODEL_ID,
        prompt: input.prompt,
        config: {
          numberOfImages: input.numberOfImages || 1,
        },
      });

      const imageUrls: string[] = [];
      if (response.generatedImages) {
        for (const generatedImage of response.generatedImages) {
          if (generatedImage.image?.imageBytes) {
            const imgBytes = generatedImage.image.imageBytes;
            const buffer = Buffer.from(imgBytes, "base64");
            const blob = await put(
              `imagen-generated-${Date.now()}.png`,
              buffer,
              {
                access: "public",
                token: process.env.BLOB_READ_WRITE_TOKEN!,
              }
            );
            imageUrls.push(blob.url);
          }
        }
      }

      console.log("✅ Imagen 2 generation completed:", imageUrls);

      return {
        jobId: `imagen_${Date.now()}`,
        imageUrls,
        status: "completed",
      };
    } catch (error) {
      console.error("❌ Imagen 2 generation failed:", error);
      
      // Check if this is a billing error (400 Bad Request with specific message)
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isBillingError = errorMessage.includes("Imagen API is only accessible to billed users");
      
      if (isBillingError) {
        console.log("💰 Billing error detected, falling back to Replicate Imagen-4-Fast...");
        
        // Use Replicate's Imagen-4-Fast as fallback
        const replicateResult = await ReplicateService.generateTextToDesign({
          prompt: input.prompt,
          aspectRatio: "1:1"
        });
        
        if (replicateResult.status === "completed" && replicateResult.imageUrl) {
          return {
            jobId: `imagen_fallback_${Date.now()}`,
            imageUrls: [replicateResult.imageUrl],
            status: "completed",
          };
        } else {
          return {
            jobId: `imagen_fallback_failed_${Date.now()}`,
            imageUrls: [],
            status: "failed",
            error: `Imagen billing error + Replicate fallback failed: ${replicateResult.error}`,
          };
        }
      }
      
      return {
        jobId: `imagen_failed_${Date.now()}`,
        imageUrls: [],
        status: "failed",
        error: errorMessage,
      };
    }
  }
}
