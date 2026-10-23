CREATE TABLE "service" (
	"id" serial PRIMARY KEY NOT NULL,
	"basePrice" numeric NOT NULL,
	"name" text NOT NULL,
	"authenticationKey" text NOT NULL,
	"wording" text DEFAULT 'activation' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voucher" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expiry" timestamp DEFAULT CURRENT_TIMESTAMP + interval '1 hour' NOT NULL,
	"amount" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "userId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "usingDefault" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "nonzero_check" CHECK ("transaction"."amount" != 0);