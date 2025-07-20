CREATE TABLE IF NOT EXISTS "image_storage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image_data" text NOT NULL,
	"mime_type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
