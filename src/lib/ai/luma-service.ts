interface LumaGenerationRequest {
  imageUrl: string;
  prompt: string;
}

interface LumaGenerationResponse {
  id: string;
  state: 'queued' | 'dreaming' | 'completed' | 'failed';
  assets?: {
    video?: string;
  };
  failure_reason?: string;
}

export class LumaService {
  private static readonly API_BASE = 'https://api.lumalabs.ai/dream-machine/v1';
  private static readonly API_KEY = process.env.LUMAAI_API_KEY;

  static async generateVideo(request: LumaGenerationRequest): Promise<{
    jobId: string;
    status: 'processing' | 'completed' | 'failed';
    videoUrl?: string;
    error?: string;
  }> {
    try {
      if (!this.API_KEY) {
        throw new Error('Luma API key not configured');
      }

      console.log('🎬 Starting Luma AI video generation:', {
        imageUrl: request.imageUrl.substring(0, 50) + '...',
        prompt: request.prompt.substring(0, 100) + '...'
      });

      // Step 1: Create generation using official Luma Labs API with required model parameter
      const createResponse = await fetch(`${this.API_BASE}/generations/video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          keyframes: {
            frame0: {
              type: 'image',
              url: request.imageUrl
            }
          },
          aspect_ratio: '16:9',
          loop: false,
          model: 'ray-1-6'
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.text();
        console.error('❌ Luma API creation failed:', errorData);
        throw new Error(`Luma API error: ${createResponse.status} - ${errorData}`);
      }

      const createData: LumaGenerationResponse = await createResponse.json();
      console.log('✅ Luma generation created:', createData.id);

      // Step 2: Poll for completion
      const result = await this.pollForCompletion(createData.id);
      
      return result;

    } catch (error) {
      console.error('❌ Luma video generation failed:', error);
      return {
        jobId: `error_${Date.now()}`,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private static async pollForCompletion(jobId: string): Promise<{
    jobId: string;
    status: 'processing' | 'completed' | 'failed';
    videoUrl?: string;
    error?: string;
  }> {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        console.log(`🔄 Polling Luma job ${jobId} (attempt ${attempts + 1}/${maxAttempts})`);

        const response = await fetch(`${this.API_BASE}/generations/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Polling failed: ${response.status}`);
        }

        const data: LumaGenerationResponse = await response.json();
        console.log(`📊 Luma job ${jobId} status:`, data.state);

        switch (data.state) {
          case 'completed':
            if (data.assets?.video) {
              console.log('✅ Luma video generation completed:', data.assets.video);
              return {
                jobId,
                status: 'completed',
                videoUrl: data.assets.video,
              };
            } else {
              throw new Error('Video completed but no URL provided');
            }

          case 'failed':
            console.error('❌ Luma generation failed:', data.failure_reason);
            return {
              jobId,
              status: 'failed',
              error: data.failure_reason || 'Generation failed',
            };

          case 'queued':
          case 'dreaming':
            // Continue polling
            break;

          default:
            console.warn('⚠️ Unknown Luma state:', data.state);
            break;
        }

        // Wait 5 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;

      } catch (error) {
        console.error(`❌ Polling attempt ${attempts + 1} failed:`, error);
        attempts++;
        
        if (attempts >= maxAttempts) {
          return {
            jobId,
            status: 'failed',
            error: 'Polling timeout - generation may still be processing',
          };
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    return {
      jobId,
      status: 'failed',
      error: 'Timeout waiting for video generation',
    };
  }

  static async getGenerationStatus(jobId: string): Promise<{
    status: 'processing' | 'completed' | 'failed';
    videoUrl?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/generations/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const data: LumaGenerationResponse = await response.json();

      switch (data.state) {
        case 'completed':
          return {
            status: 'completed',
            videoUrl: data.assets?.video,
          };
        case 'failed':
          return {
            status: 'failed',
            error: data.failure_reason,
          };
        default:
          return {
            status: 'processing',
          };
      }
    } catch (error) {
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Status check failed',
      };
    }
  }
}
