CREATE TABLE "service" (
	"id" serial PRIMARY KEY NOT NULL,
	"basePrice" numeric NOT NULL,
	"name" text NOT NULL,
	"authenticationKey" text NOT NULL,
	"wording" text DEFAULT 'activation' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" serial PRIMARY KEY NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"amount" numeric NOT NULL,
	"userId" text NOT NULL,
	"reason" text,
	CONSTRAINT "nonzero_check" CHECK ("transaction"."amount" != 0)
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"password" text NOT NULL,
	"usingDefault" boolean DEFAULT true NOT NULL,
	"balance" numeric DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voucher" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expiry" timestamp DEFAULT CURRENT_TIMESTAMP + interval '1 hour' NOT NULL,
	"amount" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;