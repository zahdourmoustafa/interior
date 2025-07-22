import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// The specific, high-quality upscaler model you requested.
const ENHANCEMENT_MODEL = "philz1337x/clarity-upscaler:dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e";

export class EnhancementService {
  /**
   * Enhances an image using a dedicated AI upscaler.
   * @param imageUrl The URL of the image to enhance.
   * @returns The URL of the enhanced image. If enhancement fails, it returns the original image URL.
   */
  static async enhance(imageUrl: string): Promise<string> {
    try {
      console.log(`✨ Starting enhancement for image: ${imageUrl}`);

      // Check if we have the API token
      if (!process.env.REPLICATE_API_TOKEN) {
        console.warn("REPLICATE_API_TOKEN not configured, skipping enhancement");
        return imageUrl;
      }

      // Use replicate.predictions.create for better control
      const prediction = await replicate.predictions.create({
        version: ENHANCEMENT_MODEL,
        input: {
          image: imageUrl,
          prompt: "masterpiece, best quality, highres, <lora:more_details:0.5> <lora:SDXLrender_v2.0:1>",
          negative_prompt: "(worst quality, low quality, normal quality:2) JuggernautNegative-neg",
          scale_factor: 2,
          dynamic: 6,
          creativity: 0.35,
          resemblance: 0.6,
          sharpen: 0,
          handfix: "disabled",
          output_format: "png",
        },
      });

      // Wait for the prediction to complete
      let completedPrediction = await replicate.predictions.get(prediction.id);
      
      // Poll until complete (with timeout)
      const maxAttempts = 60; // 5 minutes max
      let attempts = 0;
      
      while (completedPrediction.status === "starting" || completedPrediction.status === "processing") {
        if (attempts >= maxAttempts) {
          console.warn("Enhancement timeout, using original image");
          return imageUrl;
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        completedPrediction = await replicate.predictions.get(prediction.id);
        attempts++;
      }

      if (completedPrediction.status !== "succeeded") {
        console.warn("Enhancement failed or cancelled, using original image", completedPrediction.status);
        return imageUrl;
      }

      // Extract the URL from the output
      const output = completedPrediction.output;
      console.log("Replicate prediction output:", output);

      let enhancedUrl: string;

      if (Array.isArray(output) && output.length > 0) {
        enhancedUrl = output[0];
      } else if (typeof output === 'string') {
        enhancedUrl = output;
      } else {
        console.warn("Could not extract URL from prediction output, using original");
        return imageUrl;
      }

      if (!enhancedUrl || !enhancedUrl.startsWith('http')) {
        console.warn("Invalid URL from enhancement, using original");
        return imageUrl;
      }

      console.log(`✅ Enhancement successful. New URL: ${enhancedUrl}`);
      return enhancedUrl;
      
    } catch (error) {
      console.error(`❌ Image enhancement failed for URL: ${imageUrl}`, error);
      return imageUrl; // Always fallback to original
    }
  }
}