import { z } from 'zod';

const uploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().refine(
    (type) => ['image/jpeg', 'image/png', 'image/webp'].includes(type),
    'Only JPEG, PNG, and WebP images are allowed'
  ),
  size: z.number().max(5 * 1024 * 1024, 'File size must be less than 5MB'),
});

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validation = uploadSchema.safeParse({
    filename: file.name,
    contentType: file.type,
    size: file.size,
  });

  if (!validation.success) {
    return { valid: false, error: validation.error.errors[0].message };
  }

  return { valid: true };
}