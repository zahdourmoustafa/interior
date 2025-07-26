import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// The specific, high-quality upscaler model you requested.
const ENHANCEMENT_MODEL = "philz1337x/clarity-upscaler:dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e";

export class EnhancementService {
  /**
   * Enhances an image using a dedicated AI upscaler with rate limit handling.
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

      // Retry logic for rate limits
      const maxRetries = 3;
      let retryCount = 0;
      let prediction;

      while (retryCount < maxRetries) {
        try {
          // Use replicate.predictions.create for better control
          prediction = await replicate.predictions.create({
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
          
          // If successful, break out of retry loop
          break;
          
        } catch (error: unknown) {
          const errorObj = error as { status?: number; message?: string };
          // Check if it's a rate limit error
          if (errorObj.status === 429 || errorObj.message?.includes('rate limit') || errorObj.message?.includes('throttled')) {
            retryCount++;
            const retryAfter = (errorObj as { response?: { headers?: { 'retry-after'?: number } } }).response?.headers?.['retry-after'] || 5; // Default to 5 seconds
            const waitTime = Math.max(retryAfter * 1000, 5000); // Wait at least 5 seconds
            
            console.log(`⏳ Rate limited. Retry ${retryCount}/${maxRetries} after ${waitTime/1000}s...`);
            
            if (retryCount >= maxRetries) {
              console.warn("Max retries reached for enhancement, using original image");
              return imageUrl;
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          } else {
            // Non-rate-limit error, don't retry
            throw error;
          }
        }
      }

      if (!prediction) {
        console.warn("Failed to create prediction after retries, using original image");
        return imageUrl;
      }

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

  /**
   * Enhanced version with exponential backoff for heavy usage scenarios
   */
  static async enhanceWithBackoff(imageUrl: string): Promise<string> {
    const maxRetries = 5;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        return await this.enhance(imageUrl);
      } catch (error: unknown) {
        const errorObj = error as { status?: number; message?: string };
        if (errorObj.status === 429 || errorObj.message?.includes('rate limit')) {
          retryCount++;
          // Exponential backoff: 2^retry * 1000ms + random jitter
          const baseDelay = Math.pow(2, retryCount) * 1000;
          const jitter = Math.random() * 1000;
          const delay = baseDelay + jitter;
          
          console.log(`⏳ Rate limited. Exponential backoff retry ${retryCount}/${maxRetries} after ${delay/1000}s...`);
          
          if (retryCount >= maxRetries) {
            console.warn("Max retries reached with exponential backoff, using original image");
            return imageUrl;
          }
          
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Non-rate-limit error
          console.error("Enhancement failed with non-rate-limit error:", error);
          return imageUrl;
        }
      }
    }
    
    return imageUrl;
  }
}
