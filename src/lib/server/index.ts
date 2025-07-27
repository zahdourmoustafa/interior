import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { db } from "../db";
import { images, favorites, users } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { validateImageFile } from "./upload";
import { GeminiService } from "../ai/gemini-service";
import { ImagenService } from "../ai/imagen-service";
import { PromptGenerator } from "../ai/prompt-generator";
import { EnhancementService } from "../ai/enhancement-service";


// Helper method to enhance images with rate limit handling
const enhanceWithDelay = async (imageUrl: string): Promise<string> => {
  try {
    // Add delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
    return await EnhancementService.enhance(imageUrl);
  } catch (error) {
    console.warn('Enhancement failed, using original image:', error);
    return imageUrl;
  }
};

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

const authedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;
  // For now, create a mock user for development
  // TODO: Replace with actual authentication check
  const mockUserId = "550e8400-e29b-41d4-a716-446655440000";

  // Check if mock user exists, if not create it
  let mockUser = await db
    .select()
    .from(users)
    .where(eq(users.id, mockUserId))
    .limit(1);

  if (mockUser.length === 0) {
    console.log("🔧 Creating mock user for development...");
    const newUser = await db
      .insert(users)
      .values({
        id: mockUserId,
        email: "dev-user@archicassoai.com",
        name: "Development User",
        emailVerified: true,
        image: null,
      })
      .returning();
    mockUser = newUser;
  }

  return opts.next({
    ctx: {
      ...ctx,
      user: mockUser[0],
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
      .input(
        z.object({
          filename: z.string(),
          contentType: z.string(),
          size: z.number(),
        })
      )
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
      .input(
        z.object({
          originalImageUrl: z.string(),
          roomType: z.enum([
            "living-room",
            "kitchen",
            "bedroom",
            "kids-room",
            "dining-room",
            "home-office",
            "game-room",
            "bath-room",
          ]),
          designStyle: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          console.log("🎨 Starting redecoration generation:", input);

          // Generate dynamic prompt using OpenAI
          const dynamicPrompt = await PromptGenerator.generateDynamicPrompt({
            roomType: input.roomType,
            designStyle: input.designStyle,
          });

          // Generate image using Gemini
          const result = await GeminiService.generateInteriorDesign({
            imageUrl: input.originalImageUrl,
            roomType: input.roomType,
            designStyle: input.designStyle,
            prompt: dynamicPrompt,
          });

          // Enhance the generated image if successful
          let finalImageUrl = result.imageUrl;
          if (result.status === "completed" && result.imageUrl) {
            console.log("✨ Enhancing redecorate room image...");
            finalImageUrl = await EnhancementService.enhance(result.imageUrl);
            console.log("✅ Enhancement completed for redecorate room");
          }

          // Store in database if successful
          if (result.status === "completed" && finalImageUrl && ctx.user) {
            const imageRecord = await db
              .insert(images)
              .values({
                userId: ctx.user.id,
                originalImageUrl: input.originalImageUrl,
                generatedImageUrl: finalImageUrl,
                roomType: input.roomType,
                style: input.designStyle,
                aiPromptUsed: dynamicPrompt,
                resolution: "4K",
              })
              .returning();

            console.log("✅ Image saved to database:", imageRecord[0]?.id);
          }

          return {
            jobId: result.jobId,
            generatedImageUrl: finalImageUrl,
            status: result.status,
            error: result.error,
            prompt: dynamicPrompt,
          };
        } catch (error) {
          console.error("❌ Generation failed:", error);
          throw new Error(
            error instanceof Error ? error.message : "Generation failed"
          );
        }
      }),

    generateRedesignExterior: authedProcedure
      .input(
        z.object({
          originalImageUrl: z.string(),
          designStyle: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          console.log("🏡 Starting exterior redesign generation:", input);

          // Generate dynamic prompt for exterior redesign
          const dynamicPrompt = await PromptGenerator.generateExteriorRedesignPrompt({
            designStyle: input.designStyle,
          });

          // Generate image using Gemini
          const result = await GeminiService.generateExteriorDesign({
            imageUrl: input.originalImageUrl,
            designStyle: input.designStyle,
            prompt: dynamicPrompt,
          });

          // Enhance the generated image if successful
          let finalImageUrl = result.imageUrl;
          if (result.status === "completed" && result.imageUrl) {
            console.log("✨ Enhancing exterior redesign image...");
            finalImageUrl = await EnhancementService.enhance(result.imageUrl);
            console.log("✅ Enhancement completed for exterior redesign");
          }

          // Store in database if successful
          if (result.status === "completed" && finalImageUrl && ctx.user) {
            const imageRecord = await db
              .insert(images)
              .values({
                userId: ctx.user.id,
                originalImageUrl: input.originalImageUrl,
                generatedImageUrl: finalImageUrl,
                roomType: "exterior", // Using "exterior" as roomType
                style: input.designStyle,
                aiPromptUsed: dynamicPrompt,
                resolution: "4K",
              })
              .returning();

            console.log("✅ Exterior redesign image saved to database:", imageRecord[0]?.id);
          }

          return {
            jobId: result.jobId,
            generatedImageUrl: finalImageUrl,
            status: result.status,
            error: result.error,
            prompt: dynamicPrompt,
          };
        } catch (error) {
          console.error("❌ Exterior redesign generation failed:", error);
          throw new Error(
            error instanceof Error ? error.message : "Exterior redesign generation failed"
          );
        }
      }),

    generateSketchToReality: authedProcedure
      .input(
        z.object({
          originalImageUrl: z.string(),
          roomType: z.enum([
            "living-room",
            "kitchen",
            "bedroom",
            "kids-room",
            "dining-room",
            "home-office",
            "game-room",
            "bath-room",
          ]),
          designStyle: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          console.log("🏠 Starting sketch-to-reality generation:", input);

          // Generate dynamic prompt for sketch-to-reality
          const dynamicPrompt =
            await PromptGenerator.generateSketchToRealityPrompt({
              roomType: input.roomType,
              designStyle: input.designStyle,
            });

          // Generate image using Gemini with sketch-to-reality model
          const result = await GeminiService.generateSketchToReality({
            imageUrl: input.originalImageUrl,
            roomType: input.roomType,
            designStyle: input.designStyle,
            prompt: dynamicPrompt,
          });

          // Enhance the generated image if successful
          let finalImageUrl = result.imageUrl;
          if (result.status === "completed" && result.imageUrl) {
            console.log("✨ Enhancing sketch-to-reality image...");
            finalImageUrl = await EnhancementService.enhance(result.imageUrl);
            console.log("✅ Enhancement completed for sketch-to-reality");
          }

          // Store in database if successful
          if (result.status === "completed" && finalImageUrl && ctx.user) {
            const imageRecord = await db
              .insert(images)
              .values({
                userId: ctx.user.id,
                originalImageUrl: input.originalImageUrl,
                generatedImageUrl: finalImageUrl,
                roomType: input.roomType,
                style: input.designStyle,
                aiPromptUsed: dynamicPrompt,
                resolution: "4K",
              })
              .returning();

            console.log(
              "✅ Sketch-to-reality image saved to database:",
              imageRecord[0]?.id
            );
          }

          return {
            jobId: result.jobId,
            generatedImageUrl: finalImageUrl,
            status: result.status,
            error: result.error,
            prompt: dynamicPrompt,
          };
        } catch (error) {
          console.error("❌ Sketch-to-reality generation failed:", error);
          throw new Error(
            error instanceof Error
              ? error.message
              : "Sketch-to-reality generation failed"
          );
        }
      }),

    generateTextToDesign: authedProcedure
      .input(
        z.object({
          prompt: z.string(),
          numberOfImages: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          console.log("🎨 Starting text-to-design generation:", input);

          // Generate image using Imagen 2
          const result = await ImagenService.generateTextToDesign({
            prompt: input.prompt,
            numberOfImages: input.numberOfImages || 1,
          });

          // Store in database if successful
          if (result.status === "completed" && result.imageUrls.length > 0 && ctx.user) {
            for (const imageUrl of result.imageUrls) {
              await db.insert(images).values({
                userId: ctx.user.id,
                originalImageUrl: "", // No original image for text-to-design
                generatedImageUrl: await enhanceWithDelay(imageUrl), // Enhanced image
                roomType: "text-to-design",
                style: "custom",
                aiPromptUsed: input.prompt,
                resolution: "4K",
              });
            }

            console.log(
              `✅ ${result.imageUrls.length} text-to-design images saved to database.`
            );
          }

          return {
            jobId: result.jobId,
            generatedImageUrl: await enhanceWithDelay(result.imageUrls[0]), // Return enhanced image
            status: result.status,
            error: result.error,
            prompt: input.prompt,
          };
        } catch (error) {
          console.error("❌ Text-to-design generation failed:", error);
          throw new Error(
            error instanceof Error
              ? error.message
              : "Text-to-design generation failed"
          );
        }
      }),

    furnishEmptySpace: authedProcedure
      .input(
        z.object({
          imageUrl: z.string(),
          prompt: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          console.log("🛋️ Starting empty space furnishing:", input);

          const result = await GeminiService.furnishEmptySpace({
            imageUrl: input.imageUrl,
            prompt: input.prompt,
          });
          // Enhance the generated image if successful
          let finalImageUrl = result.imageUrl;
          if (result.status === "completed" && result.imageUrl) {
            console.log("✨ Enhancing furnished space image...");
            finalImageUrl = await EnhancementService.enhance(result.imageUrl);
            console.log("✅ Enhancement completed for furnished space");
          }
          if (result.status === "completed" && finalImageUrl && ctx.user) {
            await db.insert(images).values({
              userId: ctx.user.id,
              originalImageUrl: input.imageUrl,
              generatedImageUrl: finalImageUrl,
              roomType: "furnish-empty-space",
              style: "custom",
              aiPromptUsed: input.prompt,
              resolution: "4K",
            });
          }

          return {
            generatedImageUrl: finalImageUrl,
            status: result.status,
          };
        } catch (error) {
          console.error("❌ Furnishing empty space failed:", error);
          throw new Error(
            error instanceof Error
              ? error.message
              : "Furnishing empty space failed"
          );
        }
      }),

    removeObject: authedProcedure
      .input(
        z.object({
          imageUrl: z.string(),
          mask: z.string().optional(),
          prompt: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          console.log("🎨 Starting object removal:", input);

          const result = await GeminiService.removeObject({
            imageUrl: input.imageUrl,
            mask: input.mask,
            prompt: input.prompt,
          });
          // Enhance the generated image if successful
          let finalImageUrl = result.imageUrl;
          if (result.status === "completed" && result.imageUrl) {
            console.log("✨ Enhancing object removal image...");
            finalImageUrl = await EnhancementService.enhance(result.imageUrl);
            console.log("✅ Enhancement completed for object removal");
          }
          if (result.status === "completed" && finalImageUrl && ctx.user) {
            await db.insert(images).values({
              userId: ctx.user.id,
              originalImageUrl: input.imageUrl,
              generatedImageUrl: finalImageUrl,
              roomType: "remove-object",
              style: "custom",
              aiPromptUsed: input.prompt,
              resolution: "4K",
            });
          }

          return {
            generatedImageUrl: finalImageUrl,
            status: result.status,
          };
        } catch (error) {
          console.error("❌ Object removal failed:", error);
          throw new Error(
            error instanceof Error
              ? error.message
              : "Object removal failed"
          );
        }
      }),

    uploadImage: authedProcedure
      .input(
        z.object({
          file: z.string(), // Expect a base64 string
          filename: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const base64Data = input.file.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");

          const imageUrl = await GeminiService.uploadImageToBlob(
            buffer,
            input.filename
          );
          return { imageUrl };
        } catch (error) {
          console.error("❌ Upload failed:", error);
          throw new Error("Failed to upload image");
        }
      }),

    generateVideo: authedProcedure
      .input(
        z.object({
          imageUrl: z.string(),
          effect: z.enum([
            "zoomIn", 
            "zoomOut", 
            "flythrough", 
            "rotateLeft", 
            "rotateRight", 
            "panLeft", 
            "panRight", 
            "tiltUp", 
            "tiltDown"
          ]),
        })
      )
      .mutation(async ({ input }) => {
        // Luma AI system prompt based on selected effect
        try {
        let systemPrompt = "";

        switch (input.effect) {
          case "zoomIn":
            systemPrompt =
              "Create a smooth zoom-in animation video of this interior space. Start with a wide view and gradually zoom in to focus on specific details or areas of interest. The transition should be smooth and cinematic, creating a sense of depth and intimacy with a 5-second duration.";
            break;
          case "zoomOut":
            systemPrompt =
              "Create a smooth zoom-out animation video of this interior space. Start with a close-up view and gradually zoom out to reveal the full room. The transition should be smooth and cinematic, providing a comprehensive view of the entire space with a 5-second duration.";
            break;
          case "flythrough":
            systemPrompt =
              "Create a cinematic flythrough video of this interior space. The camera should move smoothly through the room as if flying, showcasing different areas and perspectives. Create an immersive journey that highlights the room's layout, design elements, and spatial relationships with a 5-second duration.";
            break;
          case "rotateLeft":
            systemPrompt =
              "Create a smooth left rotation video of this interior space. The camera should rotate counterclockwise around the room's center, providing a 360-degree view of the space. The rotation should be steady and cinematic, showcasing all angles of the room with a 5-second duration.";
            break;
          case "rotateRight":
            systemPrompt =
              "Create a smooth right rotation video of this interior space. The camera should rotate clockwise around the room's center, providing a 360-degree view of the space. The rotation should be steady and cinematic, showcasing all angles of the room with a 5-second duration.";
            break;
          case "panLeft":
            systemPrompt =
              "Create a smooth left panning video of this interior space. The camera should pan horizontally from right to left, maintaining the same height and distance while revealing different parts of the room. The movement should be steady and cinematic with a 5-second duration.";
            break;
          case "panRight":
            systemPrompt =
              "Create a smooth right panning video of this interior space. The camera should pan horizontally from left to right, maintaining the same height and distance while revealing different parts of the room. The movement should be steady and cinematic with a 5-second duration.";
            break;
          case "tiltUp":
            systemPrompt =
              "Create a smooth upward tilt video of this interior space. The camera should tilt vertically from looking down to looking up, revealing the ceiling, lighting fixtures, and upper elements of the room. The movement should be smooth and cinematic with a 5-second duration.";
            break;
          case "tiltDown":
            systemPrompt =
              "Create a smooth downward tilt video of this interior space. The camera should tilt vertically from looking up to looking down, revealing the floor, furniture placement, and lower elements of the room. The movement should be smooth and cinematic with a 5-second duration.";
            break;
        }
        // Call Luma AI API for video generation
        console.log("🎬 Calling Luma AI with prompt:", systemPrompt);
        
        const { LumaService } = await import("../ai/luma-service");
        const result = await LumaService.generateVideo({
          imageUrl: input.imageUrl,
          prompt: systemPrompt,
        });

        console.log("🎬 Luma AI result:", result);

        return {
          jobId: result.jobId,
          videoUrl: result.videoUrl,
          status: result.status,
          prompt: systemPrompt,
          error: result.error,
        };
      } catch (error) {
        console.error("❌ Video generation failed:", error);
        throw new Error(
          error instanceof Error
            ? error.message
            : "Video generation failed"
        );
      }
    }),

    addToFavorites: authedProcedure

      .input(z.object({ imageId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("User not authenticated");
        }
        return await db.insert(favorites).values({
          userId: ctx.user.id,
          imageId: input.imageId,
        });
      }),
    add: authedProcedure
      .input(z.object({ imageId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("User not authenticated");
        }
        return await db.insert(favorites).values({
          userId: ctx.user.id,
          imageId: input.imageId,
        });
      }),

    remove: authedProcedure
      .input(z.object({ imageId: z.string() }))
      .mutation(async ({ input }) => {
        return await db
          .delete(favorites)
          .where(eq(favorites.imageId, input.imageId));
      }),
  }),
});

export type AppRouter = typeof appRouter;
