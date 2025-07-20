import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { db } from '../db';
import { images, favorites } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { validateImageFile } from './upload';
import type { User } from '../db/schema';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

const authedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;
  // Add authentication check here when auth context is ready
  return opts.next({
    ctx: {
      ...ctx,
      user: null as User | null, // Will be populated with actual user
    },
  });
});

export const appRouter = router({
  auth: router({
    getSession: publicProcedure.query(async () => {
      // Return session data
      return null;
    }),
  }),
  
  user: router({
    getProfile: authedProcedure.query(async ({ ctx }) => {
      // Return user profile
      return ctx.user;
    }),
  }),
  
  images: router({
    getAll: authedProcedure.query(async () => {
      return await db.select().from(images).orderBy(desc(images.createdAt));
    }),

    upload: authedProcedure
      .input(z.object({
        filename: z.string(),
        contentType: z.string(),
        size: z.number(),
      }))
      .mutation(async ({ input }) => {
        const validation = validateImageFile({
          name: input.filename,
          type: input.contentType,
          size: input.size,
        } as File);

        if (!validation.valid) {
          throw new Error(validation.error);
        }

        return { valid: true };
      }),
    
    generateRedecorate: authedProcedure
      .input(z.object({
        originalImageUrl: z.string(),
        roomType: z.enum(['bedroom', 'livingroom', 'bathroom', 'kitchen', 'diningroom']),
        styles: z.array(z.string()),
      }))
      .mutation(async () => {
        // Placeholder for AI generation logic
        return {
          jobId: 'placeholder-job-id',
          generatedImageUrls: [],
        };
      }),

    generateVideo: authedProcedure
      .input(z.object({
        imageUrl: z.string(),
        effect: z.enum(['rotate180', 'zoomIn', 'zoomOut']),
      }))
      .mutation(async ({ input }) => {
        // Luma AI system prompt based on selected effect
        let systemPrompt = "";
        
        switch (input.effect) {
          case 'rotate180':
            systemPrompt = "Create a smooth 180-degree rotation video of this interior space. The camera should rotate smoothly around the room, showing the space from all angles. Focus on creating a cinematic, immersive experience that showcases the room's layout and design.";
            break;
          case 'zoomIn':
            systemPrompt = "Create a smooth zoom-in animation video of this interior space. Start with a wide view and gradually zoom in to focus on specific details or areas of interest. The transition should be smooth and cinematic, creating a sense of depth and intimacy.";
            break;
          case 'zoomOut':
            systemPrompt = "Create a smooth zoom-out animation video of this interior space. Start with a close-up view and gradually zoom out to reveal the full room. The transition should be smooth and cinematic, providing a comprehensive view of the entire space.";
            break;
        }

        // Placeholder for Luma AI API call
        console.log('Luma AI Prompt:', systemPrompt);
        console.log('Image URL:', input.imageUrl);
        console.log('Effect:', input.effect);

        return {
          jobId: `luma-${Date.now()}`,
          videoUrl: `/api/video/${input.effect}-${Date.now()}.mp4`,
          status: 'processing',
          prompt: systemPrompt,
        };
      }),
  }),
  
  favorites: router({
    getAll: authedProcedure.query(async () => {
      return await db.select()
        .from(favorites)
        .leftJoin(images, eq(favorites.imageId, images.id));
    }),
    
    add: authedProcedure
      .input(z.object({ imageId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error('User not authenticated');
        }
        return await db.insert(favorites).values({
          userId: ctx.user.id,
          imageId: input.imageId,
        });
      }),
      
    remove: authedProcedure
      .input(z.object({ imageId: z.string() }))
      .mutation(async ({ input }) => {
        return await db.delete(favorites)
          .where(eq(favorites.imageId, input.imageId));
      }),
  }),
});

export type AppRouter = typeof appRouter;